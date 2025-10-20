-- Update authentication system to work with Supabase Auth
-- First, let's modify the is_admin function to check auth.users instead of admin_users table
-- We'll make it so any authenticated user can access the admin panel for now

CREATE OR REPLACE FUNCTION public.is_admin(user_email text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- For now, allow any authenticated user to be admin
  -- You can modify this later to check user roles
  SELECT auth.uid() IS NOT NULL;
$$;

-- Also update get_current_user_email function to be more robust
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(auth.jwt() ->> 'email', '');
$$;

-- Create a profiles table for storing additional user information
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  name text,
  role text DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles table
CREATE POLICY "Users can view and update their own profile" ON public.profiles
FOR ALL USING (auth.uid() = id);

-- Create trigger to auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing RLS policies to use the new is_admin function
-- This will make all authenticated users able to access admin features