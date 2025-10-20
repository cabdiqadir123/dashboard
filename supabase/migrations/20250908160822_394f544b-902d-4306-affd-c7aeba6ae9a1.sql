-- Create admin profiles for authentication
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@example.com', crypt('admin123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create corresponding profile
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@example.com', 'Admin User', 'admin', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = user_email AND role = 'admin'
  );
END;
$$;

-- Update RLS policies to use the function consistently
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
CREATE POLICY "Admins can manage admin_users" 
ON admin_users FOR ALL 
USING (is_admin(get_current_user_email()));

-- Function to get current user email
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT auth.jwt() ->> 'email';
$$;