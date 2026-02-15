# Book Water - Driver Delivery App

A lightweight, mobile-first Progressive Web App for water delivery drivers.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add Google Maps API Key** to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

3. **Create driver auth user** in Supabase Dashboard (Authentication > Users)

4. **Add sample data** by running `sample-data.sql` in Supabase SQL Editor
   - Update the email in the SQL file to match your auth user

5. **Create PWA icons**:
   - Convert `public/icon.svg` to PNG format
   - Create `public/icon-192.png` (192x192px)
   - Create `public/icon-512.png` (512x512px)
   - Use an online tool like [CloudConvert](https://cloudconvert.com/svg-to-png)

6. **Run the app**
   ```bash
   npm run dev
   ```

## Key Features

- Driver login with Supabase Auth
- Today's delivery list with customer info
- Route optimization (nearest neighbor algorithm)
- Google Maps navigation integration
- GPS tracking every 10 seconds
- Mark deliveries complete
- Distance calculation
- Mobile-responsive PWA

## Documentation

See [SETUP.md](./SETUP.md) for detailed setup instructions and troubleshooting.

## Tech Stack

- React 18 + TypeScript
- Supabase (Auth + Database + Realtime)
- Tailwind CSS
- Lucide React (icons)
- Vite (build tool)
- PWA (Service Worker + Manifest)

## Database Structure

- `drivers` - Driver profiles
- `deliveries` - Daily delivery assignments
- `gps_tracking` - Live location data

All tables have Row Level Security enabled.

## Free Tier Compatible

Designed to work within free tier limits of Supabase and Google Maps Platform.
