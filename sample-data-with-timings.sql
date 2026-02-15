-- Book Water Sample Data with Time Windows
-- Run this in your Supabase SQL Editor after running migrations

-- Step 1: Create a test driver (update email to match your auth user)
INSERT INTO drivers (email, name, phone)
VALUES ('driver@bookwater.com', 'John Driver', '+919876543210')
ON CONFLICT (email) DO NOTHING;

-- Step 2: Insert sample deliveries with time windows for today
-- Locations are in Chennai, India
INSERT INTO deliveries (
  driver_id, 
  customer_name, 
  customer_phone, 
  address, 
  latitude, 
  longitude, 
  cans, 
  delivery_date, 
  status,
  preferred_time_start,
  preferred_time_end,
  estimated_duration_minutes
)
VALUES
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Rajesh Kumar',
    '+919876543211',
    '123 Anna Salai, T. Nagar, Chennai',
    13.0410,
    80.2329,
    2,
    CURRENT_DATE,
    'pending',
    '09:00:00',
    '12:00:00',
    15
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Priya Sharma',
    '+919876543212',
    '456 Mount Road, Nungambakkam, Chennai',
    13.0569,
    80.2425,
    1,
    CURRENT_DATE,
    'pending',
    '10:00:00',
    '13:00:00',
    10
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Mohammed Ali',
    '+919876543213',
    '789 Velachery Road, Velachery, Chennai',
    12.9750,
    80.2211,
    3,
    CURRENT_DATE,
    'pending',
    '14:00:00',
    '17:00:00',
    20
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Lakshmi Iyer',
    '+919876543214',
    '321 Besant Nagar Beach Road, Chennai',
    13.0004,
    80.2669,
    1,
    CURRENT_DATE,
    'pending',
    '11:00:00',
    '14:00:00',
    10
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Vijay Patel',
    '+919876543215',
    '567 OMR Road, Thoraipakkam, Chennai',
    12.9391,
    80.2338,
    5,
    CURRENT_DATE,
    'pending',
    NULL,
    NULL,
    25
  ),
  (
    (SELECT id FROM drivers WHERE email = 'driver@bookwater.com'),
    'Aishwarya Reddy',
    '+919876543216',
    '890 Adyar, Chennai',
    13.0078,
    80.2574,
    2,
    CURRENT_DATE,
    'pending',
    '08:00:00',
    '11:00:00',
    15
  );

-- Verify the data
SELECT
  d.customer_name,
  d.address,
  d.cans,
  d.preferred_time_start,
  d.preferred_time_end,
  d.estimated_duration_minutes,
  d.status,
  d.delivery_date
FROM deliveries d
JOIN drivers dr ON d.driver_id = dr.id
WHERE dr.email = 'driver@bookwater.com'
  AND d.delivery_date = CURRENT_DATE
ORDER BY d.created_at;
