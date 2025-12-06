-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (optional, to reset)
-- DROP POLICY IF EXISTS "allow_authenticated_insert_own_profile" ON profiles;
-- DROP POLICY IF EXISTS "allow_authenticated_update_own_profile" ON profiles;
-- DROP POLICY IF EXISTS "allow_public_read_profiles" ON profiles;

-- Policy: Allow authenticated users to INSERT their own profile
CREATE POLICY "allow_authenticated_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to UPDATE their own profile
CREATE POLICY "allow_authenticated_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Allow anyone to READ profiles (public profiles)
CREATE POLICY "allow_public_read_profiles" ON profiles
  FOR SELECT
  USING (true);
