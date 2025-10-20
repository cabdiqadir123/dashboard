-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email AND status = 'active'
  );
$$;

-- Create function to get current user email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.jwt() ->> 'email';
$$;

-- Admin-only policies for all tables (since this is an admin panel)
CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage admin_users" ON public.admin_users FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage sub_services" ON public.sub_services FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage booking_items" ON public.booking_items FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage booking_status_history" ON public.booking_status_history FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage promo_codes" ON public.promo_codes FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage promo_usage" ON public.promo_usage FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage complaints" ON public.complaints FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage user_notifications" ON public.user_notifications FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage worker_profiles" ON public.worker_profiles FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage worker_services" ON public.worker_services FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage addresses" ON public.addresses FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage favorites" ON public.favorites FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL USING (public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.is_admin(public.get_current_user_email()));

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('category-images', 'category-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('service-images', 'service-images', true);

-- Storage policies
CREATE POLICY "Admins can upload category images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'category-images' AND public.is_admin(public.get_current_user_email()));
CREATE POLICY "Anyone can view category images" ON storage.objects
  FOR SELECT USING (bucket_id = 'category-images');
CREATE POLICY "Admins can update category images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'category-images' AND public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can delete category images" ON storage.objects
  FOR DELETE USING (bucket_id = 'category-images' AND public.is_admin(public.get_current_user_email()));

CREATE POLICY "Admins can upload service images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'service-images' AND public.is_admin(public.get_current_user_email()));
CREATE POLICY "Anyone can view service images" ON storage.objects
  FOR SELECT USING (bucket_id = 'service-images');
CREATE POLICY "Admins can update service images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'service-images' AND public.is_admin(public.get_current_user_email()));
CREATE POLICY "Admins can delete service images" ON storage.objects
  FOR DELETE USING (bucket_id = 'service-images' AND public.is_admin(public.get_current_user_email()));

-- Add some seed admin users for testing
INSERT INTO public.admin_users (name, email, password_hash, role, status) VALUES 
('Admin User', 'admin@example.com', '$2a$10$dummy.hash.for.testing', 'super_admin', 'active'),
('Manager User', 'manager@example.com', '$2a$10$dummy.hash.for.testing', 'admin', 'active');