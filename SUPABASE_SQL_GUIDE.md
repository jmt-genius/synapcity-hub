# Supabase SQL Editor Guide - Modifying Database Policies

## How to Access the SQL Editor

1. **Go to your Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Select your project (project_id: `xxakhnnffkzhbqzblrly`)

2. **Navigate to SQL Editor**
   - In the left sidebar, click on **"SQL Editor"**
   - Or go directly to: `https://supabase.com/dashboard/project/[your-project-id]/sql`

3. **Create a New Query**
   - Click **"New query"** button
   - You can now write and execute SQL commands

---

## Viewing Existing Policies

### List all policies for a table:
```sql
-- View all policies on the items table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'items';
```

### View policies for storage:
```sql
-- View storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## Modifying Policies

### 1. **Drop (Delete) an Existing Policy**

```sql
-- Drop a specific policy
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;
```

### 2. **Modify a Policy by Recreating It**

Since PostgreSQL doesn't support `ALTER POLICY` directly, you need to:
1. Drop the old policy
2. Create a new one with the same name

**Example: Modify SELECT policy to allow viewing all items**
```sql
-- Step 1: Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;

-- Step 2: Create new policy (allow viewing all items)
CREATE POLICY "Users can view their own items"
  ON public.items FOR SELECT
  USING (true);  -- Changed from: auth.uid() = user_id
```

### 3. **Create a New Policy**

```sql
-- Example: Allow users to view items from the last 7 days
CREATE POLICY "Users can view recent items"
  ON public.items FOR SELECT
  USING (
    auth.uid() = user_id 
    OR created_at > now() - interval '7 days'
  );
```

---

## Common Policy Modification Examples

### Example 1: Allow Public Read Access to Items

```sql
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;

-- Create new policy allowing anyone to read
CREATE POLICY "Anyone can view items"
  ON public.items FOR SELECT
  USING (true);
```

### Example 2: Allow Users to View Items from Specific Sources

```sql
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own items" ON public.items;

-- Create policy allowing users to see their own items OR public link items
CREATE POLICY "Users can view their own items or public links"
  ON public.items FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (source = 'link' AND metadata->>'public' = 'true')
  );
```

### Example 3: Restrict Updates to Only Title and Notes

```sql
-- Drop existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;

-- Create policy that allows updates but checks specific fields
CREATE POLICY "Users can update their own items"
  ON public.items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND (OLD.title IS DISTINCT FROM NEW.title OR OLD.notes IS DISTINCT FROM NEW.notes)
  );
```

### Example 4: Add Time-Based Restrictions

```sql
-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;

-- Create policy that only allows inserts during business hours (example)
CREATE POLICY "Users can insert their own items"
  ON public.items FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXTRACT(HOUR FROM now()) BETWEEN 9 AND 17
  );
```

---

## Storage Policies

### Modify Storage Policy Example

```sql
-- Drop existing storage SELECT policy
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Create new policy with restrictions
CREATE POLICY "Authenticated users can view images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );
```

### Allow Public Access to Specific Image Paths

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;

-- Create policy allowing public access to specific paths
CREATE POLICY "Public can view images in public folder"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = 'public'
  );
```

---

## Best Practices

### 1. **Always Use IF EXISTS When Dropping**
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
```
This prevents errors if the policy doesn't exist.

### 2. **Test Policies Before Applying**
- Use the SQL editor's "Run" button to test
- Check the results in the output panel
- Verify with test queries

### 3. **Use Transactions for Multiple Changes**
```sql
BEGIN;

DROP POLICY IF EXISTS "old_policy" ON public.items;
CREATE POLICY "new_policy" ON public.items FOR SELECT USING (true);

COMMIT;
```

### 4. **Document Your Changes**
- Add comments to your SQL
- Keep track of policy changes in your migration files

---

## Viewing Policy Details

### Get Full Policy Definition
```sql
SELECT 
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression
FROM pg_policy
WHERE polrelid = 'public.items'::regclass
  AND polname = 'Users can view their own items';
```

---

## Quick Reference: Policy Types

| Operation | Command | USING Clause | WITH CHECK Clause |
|-----------|---------|--------------|-------------------|
| SELECT    | FOR SELECT | ✓ (required) | ✗ |
| INSERT    | FOR INSERT | ✗ | ✓ (required) |
| UPDATE    | FOR UPDATE | ✓ (optional) | ✓ (optional) |
| DELETE    | FOR DELETE | ✓ (required) | ✗ |

- **USING**: Determines which rows can be accessed/modified
- **WITH CHECK**: Validates new/modified data before it's saved

---

## Troubleshooting

### Policy Not Working?
1. Check if RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'items';
   ```

2. Enable RLS if needed:
   ```sql
   ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
   ```

3. Check your current user:
   ```sql
   SELECT auth.uid(), auth.role();
   ```

### Test Your Policy
```sql
-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM public.items;

-- Reset role
RESET ROLE;
```

---

## Your Current Policies (Reference)

Based on your migration file, you currently have:

**Table: `public.items`**
- `Users can view their own items` - SELECT
- `Users can insert their own items` - INSERT  
- `Users can update their own items` - UPDATE
- `Users can delete their own items` - DELETE

**Table: `storage.objects`**
- `Users can upload their own images` - INSERT
- `Anyone can view images` - SELECT
- `Users can update their own images` - UPDATE
- `Users can delete their own images` - DELETE

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL RLS Docs**: https://www.postgresql.org/docs/current/ddl-rowsecurity.html

