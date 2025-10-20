-- Drop the existing function first
DROP FUNCTION IF EXISTS is_admin(text);

-- Drop the existing get_current_user_email function
DROP FUNCTION IF EXISTS get_current_user_email();

-- Create function to get current user email from JWT
CREATE OR REPLACE FUNCTION get_current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '');
$$;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_email text DEFAULT get_current_user_email())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = user_email AND role = 'admin'
  );
END;
$$;