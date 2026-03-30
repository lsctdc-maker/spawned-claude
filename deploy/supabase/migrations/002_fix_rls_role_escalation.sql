-- Fix: Prevent users from changing their own role (privilege escalation)
-- Finding: Any authenticated user could self-promote to admin via:
--   supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
  );
