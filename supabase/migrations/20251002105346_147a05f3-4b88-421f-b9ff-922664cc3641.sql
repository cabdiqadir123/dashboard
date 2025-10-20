-- Fix security warnings by setting search_path on new trigger functions

CREATE OR REPLACE FUNCTION update_sub_service_booking_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE sub_services 
    SET booking_count = booking_count + 1
    WHERE id = (
      SELECT sub_service_id 
      FROM booking_items 
      WHERE booking_id = NEW.id 
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_worker_earnings()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE worker_profiles
    SET total_earnings = COALESCE(total_earnings, 0) + NEW.final_price
    WHERE user_id = NEW.worker_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_category_revenue()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE categories c
    SET total_revenue = COALESCE(c.total_revenue, 0) + NEW.final_price
    FROM booking_items bi
    JOIN sub_services ss ON bi.sub_service_id = ss.id
    WHERE bi.booking_id = NEW.id
    AND ss.category_id = c.id;
  END IF;
  RETURN NEW;
END;
$$;