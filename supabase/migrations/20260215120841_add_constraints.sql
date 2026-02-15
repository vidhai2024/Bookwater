-- Additional constraints and optimizations for Book Water delivery system
-- Run this after the initial migration

-- Add CHECK constraint on delivery status to ensure only valid values
ALTER TABLE deliveries
  ADD CONSTRAINT deliveries_status_check
  CHECK (status IN ('pending', 'completed', 'cancelled'));

-- Add additional indexes for common queries
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_completed_at ON deliveries(completed_at) WHERE completed_at IS NOT NULL;

-- Add constraint to ensure cans is always positive
ALTER TABLE deliveries
  ADD CONSTRAINT deliveries_cans_positive
  CHECK (cans > 0);

-- Add constraint to ensure latitude is valid (-90 to 90)
ALTER TABLE deliveries
  ADD CONSTRAINT deliveries_latitude_valid
  CHECK (latitude >= -90 AND latitude <= 90);

-- Add constraint to ensure longitude is valid (-180 to 180)
ALTER TABLE deliveries
  ADD CONSTRAINT deliveries_longitude_valid
  CHECK (longitude >= -180 AND longitude <= 180);

-- Same constraints for gps_tracking
ALTER TABLE gps_tracking
  ADD CONSTRAINT gps_tracking_latitude_valid
  CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE gps_tracking
  ADD CONSTRAINT gps_tracking_longitude_valid
  CHECK (longitude >= -180 AND longitude <= 180);

-- Add constraint to ensure total_distance is non-negative
ALTER TABLE gps_tracking
  ADD CONSTRAINT gps_tracking_distance_positive
  CHECK (total_distance >= 0);

-- Add index for driver phone lookups (optional, for future features)
CREATE INDEX IF NOT EXISTS idx_drivers_phone ON drivers(phone) WHERE phone IS NOT NULL;

-- Add function to automatically update route_order when delivery is completed
-- This helps maintain data integrity
CREATE OR REPLACE FUNCTION reset_route_order_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Optionally clear route_order when completed
    -- Uncomment if you want this behavior:
    -- NEW.route_order := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for the above function (optional)
-- DROP TRIGGER IF EXISTS trigger_reset_route_order ON deliveries;
-- CREATE TRIGGER trigger_reset_route_order
--   BEFORE UPDATE ON deliveries
--   FOR EACH ROW
--   EXECUTE FUNCTION reset_route_order_on_completion();

-- Add comment to tables for documentation
COMMENT ON TABLE drivers IS 'Driver profiles with authentication linked by email';
COMMENT ON TABLE deliveries IS 'Daily delivery assignments with route optimization';
COMMENT ON TABLE gps_tracking IS 'Real-time GPS tracking data collected every 10 seconds';

-- Add comments to important columns
COMMENT ON COLUMN deliveries.route_order IS 'Optimized delivery sequence (1 = first delivery)';
COMMENT ON COLUMN deliveries.status IS 'Delivery status: pending, completed, or cancelled';
COMMENT ON COLUMN gps_tracking.total_distance IS 'Cumulative distance traveled in kilometers';
