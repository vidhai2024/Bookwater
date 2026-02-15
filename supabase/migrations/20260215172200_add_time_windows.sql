-- Add time window and estimated duration to deliveries table

-- Add time window columns
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS preferred_time_start time,
  ADD COLUMN IF NOT EXISTS preferred_time_end time,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer DEFAULT 15;

-- Add comment for documentation
COMMENT ON COLUMN deliveries.preferred_time_start IS 'Customer preferred delivery start time';
COMMENT ON COLUMN deliveries.preferred_time_end IS 'Customer preferred delivery end time';
COMMENT ON COLUMN deliveries.estimated_duration_minutes IS 'Estimated time to complete delivery in minutes';

-- Add constraint to ensure valid time window
ALTER TABLE deliveries
  ADD CONSTRAINT check_time_window
  CHECK (
    (preferred_time_start IS NULL AND preferred_time_end IS NULL) OR
    (preferred_time_start IS NOT NULL AND preferred_time_end IS NOT NULL AND preferred_time_start < preferred_time_end)
  );
