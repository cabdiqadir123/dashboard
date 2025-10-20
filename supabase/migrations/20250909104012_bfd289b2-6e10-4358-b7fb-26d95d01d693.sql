-- Fix security issues by adding user-specific RLS policies

-- First, drop the orphaned 'user' table that has no RLS policies
DROP TABLE IF EXISTS public.user;

-- Update existing RESTRICTIVE policies to PERMISSIVE and add user-specific access

-- Users table: Users can view and update their own profile
DROP POLICY IF EXISTS "Admins can manage users" ON public.users;
CREATE POLICY "Admins can manage users" ON public.users FOR ALL USING (is_admin());
CREATE POLICY "Users can view and update own profile" ON public.users 
FOR ALL USING (auth.uid() = id);

-- Addresses table: Users can manage their own addresses
DROP POLICY IF EXISTS "Admins can manage addresses" ON public.addresses;
CREATE POLICY "Admins can manage addresses" ON public.addresses FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own addresses" ON public.addresses 
FOR ALL USING (auth.uid() = user_id);

-- Bookings table: Users can view their own bookings, admins can manage all
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL USING (is_admin());
CREATE POLICY "Users can view own bookings" ON public.bookings 
FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = worker_id);
CREATE POLICY "Users can create own bookings" ON public.bookings 
FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Favorites table: Users can manage their own favorites
DROP POLICY IF EXISTS "Admins can manage favorites" ON public.favorites;
CREATE POLICY "Admins can manage favorites" ON public.favorites FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own favorites" ON public.favorites 
FOR ALL USING (auth.uid() = user_id);

-- Payments table: Users can view their own payments, admins can manage all
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (is_admin());
CREATE POLICY "Users can view own payments" ON public.payments 
FOR SELECT USING (
  auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = payments.booking_id
  )
);

-- Complaints table: Users can manage their own complaints
DROP POLICY IF EXISTS "Admins can manage complaints" ON public.complaints;
CREATE POLICY "Admins can manage complaints" ON public.complaints FOR ALL USING (is_admin());
CREATE POLICY "Users can manage own complaints" ON public.complaints 
FOR ALL USING (auth.uid() = user_id);

-- User notifications: Users can view their own notifications
DROP POLICY IF EXISTS "Admins can manage user_notifications" ON public.user_notifications;
CREATE POLICY "Admins can manage user_notifications" ON public.user_notifications FOR ALL USING (is_admin());
CREATE POLICY "Users can view own notifications" ON public.user_notifications 
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications 
FOR UPDATE USING (auth.uid() = user_id);

-- Worker profiles: Workers can view and update their own profiles
DROP POLICY IF EXISTS "Admins can manage worker_profiles" ON public.worker_profiles;
CREATE POLICY "Admins can manage worker_profiles" ON public.worker_profiles FOR ALL USING (is_admin());
CREATE POLICY "Workers can view and update own profile" ON public.worker_profiles 
FOR ALL USING (auth.uid() = user_id);

-- Worker services: Workers can manage their own services
DROP POLICY IF EXISTS "Admins can manage worker_services" ON public.worker_services;
CREATE POLICY "Admins can manage worker_services" ON public.worker_services FOR ALL USING (is_admin());
CREATE POLICY "Workers can manage own services" ON public.worker_services 
FOR ALL USING (auth.uid() = worker_id);

-- Booking items: Users can view items for their own bookings
DROP POLICY IF EXISTS "Admins can manage booking_items" ON public.booking_items;
CREATE POLICY "Admins can manage booking_items" ON public.booking_items FOR ALL USING (is_admin());
CREATE POLICY "Users can view own booking items" ON public.booking_items 
FOR SELECT USING (
  auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_items.booking_id
  )
);

-- Booking status history: Users can view history for their own bookings
DROP POLICY IF EXISTS "Admins can manage booking_status_history" ON public.booking_status_history;
CREATE POLICY "Admins can manage booking_status_history" ON public.booking_status_history FOR ALL USING (is_admin());
CREATE POLICY "Users can view own booking status history" ON public.booking_status_history 
FOR SELECT USING (
  auth.uid() IN (
    SELECT customer_id FROM bookings WHERE bookings.id = booking_status_history.booking_id
  )
);

-- Promo usage: Users can view their own promo usage
DROP POLICY IF EXISTS "Admins can manage promo_usage" ON public.promo_usage;
CREATE POLICY "Admins can manage promo_usage" ON public.promo_usage FOR ALL USING (is_admin());
CREATE POLICY "Users can view own promo usage" ON public.promo_usage 
FOR SELECT USING (auth.uid() = user_id);

-- Public read access for reference tables (categories, sub_services, promo_codes)
-- These need to be readable by users to browse services and apply promos

-- Categories: Public read access
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin());
CREATE POLICY "Public can view active categories" ON public.categories 
FOR SELECT USING (status = 'active');

-- Sub services: Public read access 
DROP POLICY IF EXISTS "Admins can manage sub_services" ON public.sub_services;
CREATE POLICY "Admins can manage sub_services" ON public.sub_services FOR ALL USING (is_admin());
CREATE POLICY "Public can view active sub_services" ON public.sub_services 
FOR SELECT USING (status = 'active');

-- Promo codes: Limited public read access (users need to validate codes)
DROP POLICY IF EXISTS "Admins can manage promo_codes" ON public.promo_codes;
CREATE POLICY "Admins can manage promo_codes" ON public.promo_codes FOR ALL USING (is_admin());
CREATE POLICY "Users can view active promo codes" ON public.promo_codes 
FOR SELECT USING (status = 'active' AND starts_at <= now() AND expires_at >= now());

-- Services: Public read access
DROP POLICY IF EXISTS "Admins can manage services" ON public.services;
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (is_admin());
CREATE POLICY "Public can view services" ON public.services FOR SELECT USING (true);

-- FAQs: Public read access
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL USING (is_admin());
CREATE POLICY "Public can view active faqs" ON public.faqs 
FOR SELECT USING (is_active = true);

-- Keep admin-only tables secure (admin_users, notifications)
-- These should remain admin-only for security