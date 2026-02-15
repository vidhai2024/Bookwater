# Book Water - Driver Delivery App Setup Guide

A mobile-first Progressive Web App (PWA) for water delivery drivers built with React, TypeScript, and Supabase.

## Features

- Driver authentication
- Today's delivery list with customer details
- Automatic route optimization based on GPS location
- Google Maps navigation integration
- Live GPS tracking (every 10 seconds)
- Mark deliveries as completed
- Total distance tracking
- Mobile-responsive design
- Installable as PWA

## Prerequisites

- Node.js 18+ installed
- Supabase account (already configured)
- Google Maps API key for navigation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Maps API Key

Update the `.env` file with your Google Maps API key:

```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

To get a Google Maps API key:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Directions API"
4. Create credentials (API Key)
5. Copy the key to your `.env` file

### 3. Add PWA Icons

Create two icon files in the `public` folder:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

Use a blue water droplet icon for branding.

### 4. Create Test Driver Account

In your Supabase dashboard:

1. Go to Authentication > Users
2. Add a new user with email/password
3. Note the email and password for login

### 5. Add Sample Delivery Data

Run this SQL in your Supabase SQL Editor:

```sql
-- Insert a test driver (use the email from your auth user)
INSERT INTO drivers (email, name, phone)
VALUES ('driver@bookwater.com', 'John Driver', '+1234567890');

-- Insert sample deliveries (replace driver_id with actual driver ID)
INSERT INTO deliveries (driver_id, customer_name, customer_phone, address, latitude, longitude, cans, delivery_date, status)
VALUES
  ((SELECT id FROM drivers WHERE email = 'driver@bookwater.com'), 'Alice Smith', '+1234567891', '123 Main St, City', 40.7128, -74.0060, 2, CURRENT_DATE, 'pending'),
  ((SELECT id FROM drivers WHERE email = 'driver@bookwater.com'), 'Bob Johnson', '+1234567892', '456 Oak Ave, City', 40.7580, -73.9855, 1, CURRENT_DATE, 'pending'),
  ((SELECT id FROM drivers WHERE email = 'driver@bookwater.com'), 'Carol White', '+1234567893', '789 Pine Rd, City', 40.7489, -73.9680, 3, CURRENT_DATE, 'pending'),
  ((SELECT id FROM drivers WHERE email = 'driver@bookwater.com'), 'David Brown', '+1234567894', '321 Elm St, City', 40.7614, -73.9776, 2, CURRENT_DATE, 'pending');
```

## Running the App

### Development Mode

```bash
npm run dev
```

Access the app at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## Usage Guide

### For Drivers

1. **Login**: Enter your driver email and password
2. **View Deliveries**: See today's assigned delivery list
3. **Optimize Route**: Click "Optimize Route" to automatically sort deliveries by nearest location
4. **Start Navigation**: Click "Start Route" to open Google Maps with all stops
5. **Track Progress**: GPS tracking starts automatically when route begins
6. **Complete Deliveries**: Mark each delivery as completed after drop-off
7. **View Stats**: Monitor total distance traveled during the route

### Mobile Installation

On mobile devices:
1. Open the app in Chrome/Safari
2. Tap the browser menu
3. Select "Add to Home Screen"
4. The app will install and work like a native app

## Technical Details

### Database Schema

- **drivers**: Driver profiles linked to auth users
- **deliveries**: Daily delivery assignments with location data
- **gps_tracking**: Live GPS coordinates with timestamps

### Route Optimization

Uses nearest-neighbor algorithm to optimize delivery sequence based on current GPS location.

### GPS Tracking

- Updates every 10 seconds when route is active
- Calculates cumulative distance using Haversine formula
- Stores coordinates in realtime database

### Security

- Row Level Security (RLS) enabled on all tables
- Drivers can only access their own data
- Authenticated access required for all operations

## Troubleshooting

**GPS not working**:
- Ensure location permissions are enabled in browser
- Use HTTPS in production (required for geolocation)

**Google Maps not opening**:
- Verify Google Maps API key is configured
- Check that Directions API is enabled in Google Cloud Console

**No deliveries showing**:
- Ensure deliveries are assigned for today's date
- Verify driver_id matches authenticated driver

## Free Tier Compatibility

- Supabase: Free tier includes 500MB database, 2GB bandwidth/month
- Google Maps: 28,000 free map loads per month
- All features work within free tier limits for small operations

## Support

For issues or questions, refer to the documentation:
- [Supabase Docs](https://supabase.com/docs)
- [Google Maps Platform](https://developers.google.com/maps)
