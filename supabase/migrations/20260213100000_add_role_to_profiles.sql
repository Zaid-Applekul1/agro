-- Add role column to user_profiles if it doesn't exist

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'viewer';

-- Update RLS policies to explicitly allow role reads
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Create index on role for faster admin checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
