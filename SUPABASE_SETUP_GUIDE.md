# Step-by-Step Guide: Setting Up New Supabase Database

This guide will help you create a new Supabase database with the same structure as your current project.

## Prerequisites

- A Supabase account (sign up at https://supabase.com if you don't have one)
- Access to your Supabase dashboard

## Step 1: Create a New Supabase Project

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Log in to your account

2. **Create New Project**
   - Click the **"New Project"** button (usually in the top right or on the projects page)
   - Fill in the project details:
     - **Name**: Enter a name for your project (e.g., "synapcity-hub-new")
     - **Database Password**: Create a strong password (save this securely!)
     - **Region**: Choose the region closest to your users
     - **Pricing Plan**: Select your plan (Free tier is fine for development)

3. **Wait for Project Setup**
   - Supabase will create your project (takes 1-2 minutes)
   - You'll see a loading screen, then be redirected to your project dashboard

## Step 2: Access SQL Editor

1. **Navigate to SQL Editor**
   - In the left sidebar, click on **"SQL Editor"**
   - Or go directly to: `https://supabase.com/dashboard/project/[your-project-id]/sql`

2. **Create New Query**
   - Click the **"New query"** button
   - You'll see a blank SQL editor

## Step 3: Run Migration 1 - Main Schema

1. **Copy the first migration file content**
   - Open: `frontend/supabase/migrations/20251108054426_d70c31de-ee8a-418f-8236-e22c4e3bcf51.sql`
   - Copy the entire contents

2. **Paste into SQL Editor**
   - Paste the SQL code into the SQL Editor

3. **Run the query**
   - Click the **"Run"** button (or press `Ctrl+Enter` / `Cmd+Enter`)
   - Wait for the query to complete
   - You should see a success message: "Success. No rows returned"

4. **Verify the table was created**
   - In the left sidebar, click **"Table Editor"**
   - You should see the `items` table listed
   - Click on it to see the table structure

## Step 4: Run Migration 2 - Function Fix

1. **Go back to SQL Editor**
   - Click **"SQL Editor"** again
   - Click **"New query"** to create a new query

2. **Copy the second migration file content**
   - Open: `frontend/supabase/migrations/20251108054439_51c58ec8-f463-47e4-be30-080cd50918c2.sql`
   - Copy the entire contents

3. **Paste and run**
   - Paste into SQL Editor
   - Click **"Run"**
   - Should see: "Success. No rows returned"

## Step 5: Verify Database Structure

### Check Table Structure

1. **Go to Table Editor**
   - Click **"Table Editor"** in the left sidebar
   - Click on the `items` table

2. **Verify columns exist:**
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key to auth.users)
   - `source` (text, with check constraint)
   - `title` (text)
   - `url` (text, nullable)
   - `notes` (text, nullable)
   - `tags` (text array, nullable)
   - `metadata` (jsonb, nullable)
   - `image_path` (text, nullable)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### Check RLS Policies

1. **Go to Authentication > Policies**
   - In the left sidebar, click **"Authentication"**
   - Click on **"Policies"** tab
   - Select the `items` table from the dropdown

2. **Verify 4 policies exist:**
   - ✅ "Users can view their own items" (SELECT)
   - ✅ "Users can insert their own items" (INSERT)
   - ✅ "Users can update their own items" (UPDATE)
   - ✅ "Users can delete their own items" (DELETE)

### Check Storage Bucket

1. **Go to Storage**
   - Click **"Storage"** in the left sidebar
   - You should see an `images` bucket listed

2. **Verify bucket settings:**
   - Bucket name: `images`
   - Public: Yes (checked)

### Check Functions

1. **Go to Database > Functions**
   - Click **"Database"** in the left sidebar
   - Click **"Functions"**
   - You should see `handle_updated_at` function

2. **Verify trigger exists:**
   - Go to **"Database" > "Triggers"**
   - You should see `set_updated_at` trigger on the `items` table

## Step 6: Get Your Project Credentials

1. **Go to Project Settings**
   - Click the gear icon (⚙️) in the left sidebar
   - Click **"API Settings"**

2. **Copy your credentials:**
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy the `anon` `public` key
   - **service_role key**: Copy the `service_role` `secret` key (keep this secure!)

## Step 7: Update Frontend Environment Variables

1. **Create/Update `.env` file in `frontend` directory:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
   ```

2. **Restart your frontend dev server** if it's running

## Step 8: Test the Setup

1. **Start your frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test authentication:**
   - Try signing up/logging in
   - Verify you can create an account

3. **Test creating items:**
   - Try adding a link, YouTube video, or manual item
   - Verify it appears in your dashboard
   - Verify you can only see your own items

## Complete SQL Script (All-in-One)

If you prefer to run everything at once, here's a combined script:

```sql
-- ============================================
-- Migration 1: Main Schema
-- ============================================

-- Create items table
CREATE TABLE public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  source text NOT NULL CHECK (source IN ('youtube', 'linkedin', 'link', 'manual')),
  title text NOT NULL,
  url text,
  notes text,
  tags text[],
  metadata jsonb,
  image_path text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own items"
  ON public.items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON public.items FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Users can update their own images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Troubleshooting

### Error: "relation already exists"
- The table/bucket/function already exists
- You can either drop it first or skip that part of the migration

### Error: "policy already exists"
- The policy already exists
- Drop it first: `DROP POLICY IF EXISTS "policy_name" ON public.items;`

### Error: "bucket already exists"
- The storage bucket already exists
- Use `ON CONFLICT DO NOTHING` or drop it first

### RLS not working
- Make sure RLS is enabled: `ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;`
- Verify policies are created correctly
- Check that you're authenticated when making requests

### Storage bucket not visible
- Go to Storage > Buckets
- If missing, the INSERT statement might have failed
- Manually create it: Storage > New bucket > Name: "images" > Public: Yes

## Quick Verification Checklist

- [ ] `items` table exists with all columns
- [ ] RLS is enabled on `items` table
- [ ] 4 RLS policies exist (SELECT, INSERT, UPDATE, DELETE)
- [ ] `handle_updated_at` function exists
- [ ] `set_updated_at` trigger exists on `items` table
- [ ] `images` storage bucket exists and is public
- [ ] 4 storage policies exist for the `images` bucket
- [ ] Frontend `.env` file updated with new credentials
- [ ] Can sign up/login
- [ ] Can create items
- [ ] Can only see own items

## Next Steps

After setting up the database:

1. Update your frontend `.env` file with the new Supabase credentials
2. Test authentication
3. Test creating items
4. Verify RLS is working (users can only see their own items)

Your new database is now ready to use! 🎉

