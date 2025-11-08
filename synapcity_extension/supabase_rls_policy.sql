-- RLS Policy for items table
-- This policy allows inserts for anon and authenticated users
-- Run this in your Supabase SQL Editor

-- ============================================
-- SIMPLE SOLUTION (Try this first):
-- ============================================
-- Step 1: Ensure RLS is enabled
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing insert policies
DROP POLICY IF EXISTS "Allow inserts for anon and authenticated" ON public.items;
DROP POLICY IF EXISTS "Allow inserts with user_id" ON public.items;

-- Step 3: Create a simple insert policy
CREATE POLICY "Allow inserts for anon and authenticated" 
ON public.items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- ============================================
-- ALTERNATIVE: If the above doesn't work, try this comprehensive solution:
-- ============================================

-- Step 2: Drop ALL existing policies to avoid conflicts
-- This will remove any conflicting policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'items' AND schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.items';
    END LOOP;
END $$;

-- Step 3: Create a simple policy that allows inserts
-- This allows any anon or authenticated user to insert rows
CREATE POLICY "Allow inserts for anon and authenticated" 
ON public.items
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Step 4: Verify the policy was created
-- You should see the policy listed after running this
SELECT * FROM pg_policies WHERE tablename = 'items' AND schemaname = 'public';

-- Optional: Create a policy for users to read their own items
DROP POLICY IF EXISTS "Users can read own items" ON public.items;

CREATE POLICY "Users can read own items"
ON public.items
FOR SELECT
TO anon, authenticated
USING (true); -- Adjust this based on your needs
-- If you want users to only see their own items, use:
-- USING (auth.uid() = user_id OR user_id IS NOT NULL)

-- Optional: Create a policy for users to update their own items
DROP POLICY IF EXISTS "Users can update own items" ON public.items;

CREATE POLICY "Users can update own items"
ON public.items
FOR UPDATE
TO anon, authenticated
USING (true); -- Adjust based on your needs
WITH CHECK (true);

-- Optional: Create a policy for users to delete their own items
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;

CREATE POLICY "Users can delete own items"
ON public.items
FOR DELETE
TO anon, authenticated
USING (true); -- Adjust based on your needs

