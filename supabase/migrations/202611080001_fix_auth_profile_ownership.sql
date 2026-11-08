-- BOOKMARKD Database Migration
-- Migration: 202611080001_fix_auth_profile_ownership.sql
-- Purpose: Fix auth-profile synchronization, automate profile creation with auth trigger,
--          enforce strict auth.uid() ownership, and prevent account leakage.

-- 1. Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verify profiles table foreign key to auth.users(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
          AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_id_fkey 
        FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Automatic Profile Creation Trigger Function
-- Uses SECURITY DEFINER with safe search_path to securely handle new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
    new_username TEXT;
    new_full_name TEXT;
    raw_user_name TEXT;
BEGIN
    -- Extract full name from raw metadata
    new_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(NEW.email, '@', 1),
        'Bookmarkd Reader'
    );

    -- Extract or generate unique username from metadata or email
    raw_user_name := COALESCE(
        NEW.raw_user_meta_data->>'username',
        SPLIT_PART(NEW.email, '@', 1)
    );

    -- Sanitize username (lowercase alphanumeric and underscore only)
    new_username := LOWER(REGEXP_REPLACE(raw_user_name, '[^a-zA-Z0-9_]', '', 'g'));
    
    -- Fallback if username became empty after sanitization
    IF new_username IS NULL OR LENGTH(new_username) = 0 THEN
        new_username := 'reader_' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8);
    END IF;

    -- Avoid username collision by appending random hex if already taken by another profile
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username AND id <> NEW.id) THEN
        new_username := new_username || '_' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 4);
    END IF;

    -- Insert profile associated strictly with authenticated user's UUID
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        avatar_url,
        bio,
        reading_goal_annual,
        favorite_book_ids,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        new_username,
        new_full_name,
        'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new_username,
        'Passionate reader on Bookmarkd. Logging thoughts and favorite literary gems.',
        25,
        '[]'::jsonb,
        TIMEZONE('utc'::text, NOW()),
        TIMEZONE('utc'::text, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
        updated_at = TIMEZONE('utc'::text, NOW());

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent signup failure if profile insertion encounters an unexpected issue
    RAISE WARNING 'handle_new_user error for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Attach trigger to auth.users on INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill any existing auth users missing from profiles table
INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    reading_goal_annual,
    favorite_book_ids,
    created_at,
    updated_at
)
SELECT 
    u.id,
    LOWER(COALESCE(
        NULLIF(REGEXP_REPLACE(u.raw_user_meta_data->>'username', '[^a-zA-Z0-9_]', '', 'g'), ''),
        'reader_' || SUBSTRING(REPLACE(u.id::text, '-', ''), 1, 8)
    )),
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        SPLIT_PART(u.email, '@', 1),
        'Bookmarkd Reader'
    ),
    'https://api.dicebear.com/7.x/adventurer/svg?seed=' || SUBSTRING(REPLACE(u.id::text, '-', ''), 1, 8),
    'Reader on Bookmarkd.',
    25,
    '[]'::jsonb,
    TIMEZONE('utc'::text, NOW()),
    TIMEZONE('utc'::text, NOW())
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- 6. Enforce strict Row Level Security (RLS) policies using auth.uid()

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- USER_BOOKS
DROP POLICY IF EXISTS "User books are viewable by everyone" ON public.user_books;
DROP POLICY IF EXISTS "Users can manage their own user_books" ON public.user_books;

CREATE POLICY "User books are viewable by everyone" 
    ON public.user_books FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own user_books" 
    ON public.user_books FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user_books" 
    ON public.user_books FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user_books" 
    ON public.user_books FOR DELETE 
    USING (auth.uid() = user_id);

-- REVIEWS
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

CREATE POLICY "Reviews are viewable by everyone" 
    ON public.reviews FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own reviews" 
    ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
    ON public.reviews FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
    ON public.reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- READING LISTS
DROP POLICY IF EXISTS "Public lists are viewable by everyone" ON public.reading_lists;
DROP POLICY IF EXISTS "Users can manage their own reading lists" ON public.reading_lists;

CREATE POLICY "Public lists are viewable by everyone" 
    ON public.reading_lists FOR SELECT 
    USING (is_private = false OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading lists" 
    ON public.reading_lists FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading lists" 
    ON public.reading_lists FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading lists" 
    ON public.reading_lists FOR DELETE 
    USING (auth.uid() = user_id);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);
