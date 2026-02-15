-- Ensure profiles table has proper RLS for the Navbar/Auth logic
-- This allows the user to read their own role server-side AND client-side
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Remove recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 2. Simple policy: Anyone authenticated can see their OWN profile
-- This is NOT recursive and is 100% safe.
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 3. If we need admins to see all profiles, we must use a helper or avoid direct self-reference.
-- For now, let's keep it simple to fix the "freeze":
-- (Only own profile access is needed for the dashboard button to show up)

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
