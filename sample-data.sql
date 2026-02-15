-- Book Water Sample Data
-- Run this in your Supabase SQL Editor after creating a driver auth user

-- Step 1: Create a test driver
-- Replace 'driver@bookwater.com' with your actual auth user email
INSERT INTO drivers (email, name, phone)
VALUES ('driver@bookwater.com', 'John Driver', '+1234567890')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Insert sample deliveries for today
-- These are sample locations in New York City area
INSERT INTO deliveries (driver_id, customer_name, customer_phone, address, latitude, longitude, cans, delivery_date, status)
VALUES
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Alice Smith',
    '+1234567891',
    '123 Main St, Manhattan, NY',
    40.7128,
    -74.0060,
    2,
    CURRENT_DATE,
    'pending'
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Bob Johnson',
    '+1234567892',
    '456 Oak Ave, Manhattan, NY',
    40.7580,
    -73.9855,
    1,
    CURRENT_DATE,
    'pending'
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Carol White',
    '+1234567893',
    '789 Pine Rd, Manhattan, NY',
    40.7489,
    -73.9680,
    3,
    CURRENT_DATE,
    'pending'
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'David Brown',
    '+1234567894',
    '321 Elm St, Manhattan, NY',
    40.7614,
    -73.9776,
    2,
    CURRENT_DATE,
    'pending'
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Emma Davis',
    '+1234567895',
    '555 Broadway, Manhattan, NY',
    40.7549,
    -73.9840,
    4,
    CURRENT_DATE,
    'pending'
  );

-- Verify the data
SELECT
  d.customer_name,
  d.address,
  d.cans,
  d.status,
  d.delivery_date
FROM deliveries d
JOIN drivers dr ON d.driver_id = dr.id
WHERE dr.email = 'driver@bookwater.com'
  AND d.delivery_date = CURRENT_DATE
ORDER BY d.created_at;
