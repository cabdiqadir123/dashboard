-- 1. Add booking_count column to sub_services (replacing duration concept)
ALTER TABLE sub_services ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;

-- 2. Add total_earnings column to worker_profiles (replacing hourly_rate concept)
ALTER TABLE worker_profiles ADD COLUMN IF NOT EXISTS total_earnings NUMERIC DEFAULT 0;

-- 3. Add total_revenue column to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0;

-- 4. Change bookings.booking_number to 6-digit format (will be handled in application logic)
-- No schema change needed, just application logic

-- 5. Create trigger to update booking_count when bookings are created
CREATE OR REPLACE FUNCTION update_sub_service_booking_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_count
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_sub_service_booking_count();

-- 6. Create trigger to update worker total_earnings when booking is completed
CREATE OR REPLACE FUNCTION update_worker_earnings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE worker_profiles
    SET total_earnings = COALESCE(total_earnings, 0) + NEW.final_price
    WHERE user_id = NEW.worker_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_worker_earnings
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_worker_earnings();

-- 7. Create trigger to update category revenue when booking is completed
CREATE OR REPLACE FUNCTION update_category_revenue()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_category_revenue
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_category_revenue();