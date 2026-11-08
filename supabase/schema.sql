-- BOOKMARKD Database Schema (PostgreSQL for Supabase)
-- Normalized architecture with Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    favorite_book_ids JSONB DEFAULT '[]'::jsonb,
    reading_goal_annual INTEGER DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.books (
    id TEXT PRIMARY KEY, -- Can be google_books_id, isbn, or generated uuid
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    cover_url TEXT NOT NULL,
    isbn TEXT,
    publisher TEXT,
    published_year INTEGER,
    page_count INTEGER DEFAULT 0,
    genres TEXT[] DEFAULT '{}',
    avg_rating NUMERIC(3, 2) DEFAULT 0.0,
    ratings_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- USER_BOOKS TABLE (Tracking Reading Status & Progress)
CREATE TYPE reading_status_enum AS ENUM ('want_to_read', 'currently_reading', 'read', 'dnf');

CREATE TABLE IF NOT EXISTS public.user_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    status reading_status_enum NOT NULL DEFAULT 'want_to_read',
    rating NUMERIC(2, 1) CHECK (rating >= 0.5 AND rating <= 5.0),
    progress_pages INTEGER DEFAULT 0,
    start_date DATE,
    finish_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 0.5 AND rating <= 5.0),
    content TEXT NOT NULL,
    contains_spoilers BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, book_id)
);

-- REVIEW LIKES TABLE
CREATE TABLE IF NOT EXISTS public.review_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, review_id)
);

-- REVIEW COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.review_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (follower_id, following_id)
);

-- READING LISTS TABLE
CREATE TABLE IF NOT EXISTS public.reading_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- READING LIST BOOKS TABLE
CREATE TABLE IF NOT EXISTS public.reading_list_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES public.reading_lists(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(list_id, book_id)
);

-- READING CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.reading_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    target_books INTEGER NOT NULL DEFAULT 25,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, year)
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    entity_id TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_books_user_status ON public.user_books(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_book_id ON public.reviews(book_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_reading_lists_user ON public.reading_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_list_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read, users can update only their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Books: Viewable by everyone, authenticated users can insert
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert books" ON public.books FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User Books: Viewable by everyone (or privacy rules), editable only by owner
CREATE POLICY "User books are viewable by everyone" ON public.user_books FOR SELECT USING (true);
CREATE POLICY "Users can manage their own user_books" ON public.user_books FOR ALL USING (auth.uid() = user_id);

-- Reviews: Viewable by everyone, editable by author
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Review Likes: Viewable by everyone, users can like/unlike
CREATE POLICY "Likes are viewable by everyone" ON public.review_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON public.review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own likes" ON public.review_likes FOR DELETE USING (auth.uid() = user_id);

-- Review Comments: Viewable by everyone, editable by comment author
CREATE POLICY "Comments are viewable by everyone" ON public.review_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert their own comments" ON public.review_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.review_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.review_comments FOR DELETE USING (auth.uid() = user_id);

-- Reading Lists: Public lists viewable by all, private by owner
CREATE POLICY "Public lists are viewable by everyone" ON public.reading_lists FOR SELECT USING (is_private = false OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own reading lists" ON public.reading_lists FOR ALL USING (auth.uid() = user_id);

-- Reading List Books: Public list books viewable by everyone, private only by owner
CREATE POLICY "Public list books are viewable by everyone" ON public.reading_list_books FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.reading_lists 
        WHERE id = reading_list_books.list_id 
          AND (is_private = false OR auth.uid() = user_id)
    )
);
CREATE POLICY "Users can manage books in their own lists" ON public.reading_list_books FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.reading_lists 
        WHERE id = reading_list_books.list_id 
          AND auth.uid() = user_id
    )
);

-- Reading Challenges: Publicly viewable, editable only by owner
CREATE POLICY "Challenges are viewable by everyone" ON public.reading_challenges FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reading challenges" ON public.reading_challenges FOR ALL USING (auth.uid() = user_id);

-- Follows: Viewable by all, users can follow/unfollow
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- Notifications: Only visible to recipient, created on user interactions
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
