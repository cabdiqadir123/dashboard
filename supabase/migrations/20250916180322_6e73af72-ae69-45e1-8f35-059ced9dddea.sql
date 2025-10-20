-- Fix booking foreign key constraints and add missing fields
-- Add password field to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;

-- Add image field to promo_codes table  
ALTER TABLE public.promo_codes ADD COLUMN IF NOT EXISTS image TEXT;

-- Add secondary_image field to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS secondary_image TEXT;

-- Update payment methods to use Somali methods
UPDATE public.payments SET payment_method = 'hormuud' WHERE payment_method = 'credit_card';
UPDATE public.payments SET payment_method = 'somtel' WHERE payment_method = 'debit_card';  
UPDATE public.payments SET payment_method = 'somnet' WHERE payment_method = 'paypal';

-- Add default starts_at for promo codes if missing
UPDATE public.promo_codes SET starts_at = COALESCE(starts_at, created_at, now()) WHERE starts_at IS NULL;

-- Create function to count bookings per user
CREATE OR REPLACE FUNCTION get_user_booking_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM bookings 
    WHERE customer_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;