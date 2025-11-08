-- ============================================
-- Complete Database Setup Script
-- Run this in Supabase SQL Editor to set up the entire database
-- ============================================

-- ============================================
-- 1. Create items table
-- ============================================
CREATE TABLE IF NOT EXISTS public.items (
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

-- ============================================
-- 2. Enable Row Level Security
-- ============================================
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Drop existing policies if they exist (for clean setup)
-- ============================================
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete their own items" ON public.items;

-- ============================================
-- 4. Create RLS Policies
-- ============================================
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

-- ============================================
-- 5. Create updated_at trigger function
-- ============================================
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

-- ============================================
-- 6. Drop existing trigger if it exists
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at ON public.items;

-- ============================================
-- 7. Create updated_at trigger
-- ============================================
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 8. Create storage bucket for images
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. Drop existing storage policies if they exist
-- ============================================
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- ============================================
-- 10. Create storage policies
-- ============================================
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

-- ============================================
-- Setup Complete!
-- ============================================
-- Verify the setup:
-- 1. Check Table Editor - you should see 'items' table
-- 2. Check Authentication > Policies - 4 policies for 'items' table
-- 3. Check Storage - 'images' bucket should exist
-- 4. Check Database > Functions - 'handle_updated_at' should exist
-- 5. Check Database > Triggers - 'set_updated_at' should exist
-- ============================================

