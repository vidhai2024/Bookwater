/*
  # Book Water Delivery System Schema

  1. New Tables
    - `drivers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
    
    - `deliveries`
      - `id` (uuid, primary key)
      - `driver_id` (uuid, foreign key to drivers)
      - `customer_name` (text)
      - `customer_phone` (text)
      - `address` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `cans` (integer) - number of water cans
      - `delivery_date` (date)
      - `status` (text) - 'pending', 'completed'
      - `completed_at` (timestamp)
      - `route_order` (integer) - optimized sequence
      - `created_at` (timestamp)
    
    - `gps_tracking`
      - `id` (uuid, primary key)
      - `driver_id` (uuid, foreign key to drivers)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `timestamp` (timestamp)
      - `total_distance` (numeric) - cumulative distance in km
  
  2. Security
    - Enable RLS on all tables
    - Drivers can only view their own data
    - Drivers can update their own deliveries and GPS tracking
*/

CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  cans integer DEFAULT 1,
  delivery_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  route_order integer,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gps_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid REFERENCES drivers(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  timestamp timestamptz DEFAULT now(),
  total_distance numeric DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_deliveries_driver_date ON deliveries(driver_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_driver ON gps_tracking(driver_id, timestamp DESC);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own profile"
  ON drivers FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = email);

CREATE POLICY "Drivers can view own deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Drivers can update own deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Drivers can insert own GPS tracking"
  ON gps_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    driver_id IN (
      SELECT id FROM drivers WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Drivers can view own GPS tracking"
  ON gps_tracking FOR SELECT
  TO authenticated
  USING (
    driver_id IN (
      SELECT id FROM drivers WHERE email = auth.jwt()->>'email'
    )
  );