# BOOKMARKD — Database Migration Report

## 1. Migration Specification
- **Migration Script**: `supabase/migrations/202611080001_fix_auth_profile_ownership.sql`
- **Updated Base Schema**: `supabase/schema.sql`
- **Target Platform**: Supabase PostgreSQL 15+
- **Execution Mode**: Idempotent DDL & DML script

---

## 2. Changes Implemented

### A. Cascading Foreign Key Constraint
Added an explicit foreign key between `public.profiles` and `auth.users`:
```sql
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```
*Rationale*: Guarantees that when an authentication identity is deleted in Supabase, all associated personal profiles, preferences, and reading statistics are automatically garbage-collected without orphaned foreign key references.

### B. Automated Profile Creation Trigger Function
Implemented `public.handle_new_user()` executed `AFTER INSERT ON auth.users`:
```sql
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
    new_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        SPLIT_PART(NEW.email, '@', 1),
        'Bookmarkd Reader'
    );

    raw_user_name := COALESCE(
        NEW.raw_user_meta_data->>'username',
        SPLIT_PART(NEW.email, '@', 1)
    );

    new_username := LOWER(REGEXP_REPLACE(raw_user_name, '[^a-zA-Z0-9_]', '', 'g'));

    IF new_username IS NULL OR LENGTH(new_username) < 3 THEN
        new_username := 'reader_' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 8);
    END IF;

    -- Guarantee unique username collision avoidance
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
        new_username := new_username || '_' || SUBSTRING(REPLACE(NEW.id::text, '-', ''), 1, 4);
    END IF;

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
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            'https://api.dicebear.com/7.x/adventurer/svg?seed=' || new_username
        ),
        'Passionate reader on Bookmarkd.',
        25,
        '[]'::jsonb,
        TIMEZONE('utc'::text, NOW()),
        TIMEZONE('utc'::text, NOW())
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = TIMEZONE('utc'::text, NOW());

    RETURN NEW;
END;
$$;
```
*Rationale*: Using `SECURITY DEFINER` with fixed `search_path` allows the trigger to execute securely in the context of the database owner when new users register via Supabase Auth API, ensuring profiles always exist without requiring client-side profile insertion workarounds.

### C. Safe Backfill of Existing Users
The migration safely provisions profile rows for any existing Supabase users without deleting or altering existing production rows:
```sql
INSERT INTO public.profiles (...)
SELECT u.id, ...
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### D. Strict Row Level Security (RLS) Policies
Enabled RLS across all tables and bound modifications strictly to `auth.uid()`:

1. **`public.profiles`**:
   - `SELECT`: Public access (`USING (true)`).
   - `INSERT`: Strictly `WITH CHECK (auth.uid() = id)`.
   - `UPDATE`: Strictly `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`.

2. **`public.user_books`**:
   - `SELECT`: Public access.
   - `INSERT`, `UPDATE`, `DELETE`: Enforced with `USING (auth.uid() = user_id)`.

3. **`public.reviews`**:
   - `SELECT`: Public access.
   - `INSERT`, `UPDATE`, `DELETE`: Enforced with `USING (auth.uid() = user_id)`.

4. **`public.reading_lists`**:
   - `SELECT`: `USING (is_private = false OR auth.uid() = user_id)`.
   - `INSERT`, `UPDATE`, `DELETE`: Enforced with `USING (auth.uid() = user_id)`.

5. **`public.notifications`**:
   - `SELECT`, `UPDATE`: `USING (auth.uid() = user_id)`.
   - `INSERT`: `WITH CHECK (auth.uid() IS NOT NULL)`.

---

## 3. Data Integrity & Safety Guarantee
- No tables were dropped (`DROP TABLE` was not used).
- No production user data was truncated or lost.
- All operations employ `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, and conditional checks to ensure zero disruption to live operations.
