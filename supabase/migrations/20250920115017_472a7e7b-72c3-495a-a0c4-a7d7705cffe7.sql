-- Create profiles for existing users and make them admins
INSERT INTO public.profiles (id, email, name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  'admin'
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.profiles);