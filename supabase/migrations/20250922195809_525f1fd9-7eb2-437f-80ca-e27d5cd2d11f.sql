-- Add missing UPDATE policy for bookings table to allow admins to update booking details
CREATE POLICY "Admins can update bookings" 
ON public.bookings 
FOR UPDATE 
USING (is_admin());

-- Also add UPDATE policy to allow workers to update their assigned bookings status
CREATE POLICY "Workers can update own assigned bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = worker_id);