# Book Water - Complete Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Google Cloud account for Maps API
- Basic knowledge of terminal/command line

---

## 🚀 Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (2-3 minutes)
3. Go to **Project Settings** > **API**
4. Copy your `Project URL` and `anon/public` key

### 3. Set Up Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Maps JavaScript API** and **Directions API**
4. Go to **Credentials** and create an API key
5. Restrict the key to your domain for production

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 5. Set Up Database

1. Go to Supabase Dashboard > **SQL Editor**
2. Run the migration file: `supabase/migrations/20260215120840_create_delivery_system.sql`
3. (Optional) Run the constraints migration: `supabase/migrations/20260215120841_add_constraints.sql`

### 6. Create a Test Driver

1. Go to Supabase Dashboard > **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Enter:
   - Email: `driver@example.com`
   - Password: `SecurePassword123!`
   - Enable "Auto Confirm User"

### 7. Add Driver Data

1. Go to **SQL Editor**
2. Run this query (replace email with your test user's email):

```sql
INSERT INTO drivers (email, name, phone)
VALUES ('driver@example.com', 'Test Driver', '+1234567890');
```

### 8. Add Sample Deliveries

1. Go to **SQL Editor**
2. Run `sample-data.sql` (update the email first)
3. Or manually insert deliveries

### 9. Generate PWA Icons

1. Open `generate-icons.html` in your browser
2. Click "Generate 192x192 Icon" and save as `public/icon-192.png`
3. Click "Generate 512x512 Icon" and save as `public/icon-512.png`

### 10. Run the App

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and log in!

---

## 🔧 Detailed Configuration

### Database Schema

The app uses three main tables:

#### `drivers`
- `id` - UUID primary key
- `email` - Unique, links to Supabase Auth
- `name` - Driver's full name
- `phone` - Optional phone number
- `created_at` - Timestamp

#### `deliveries`
- `id` - UUID primary key
- `driver_id` - Links to drivers table
- `customer_name` - Customer's name
- `customer_phone` - Customer's phone
- `address` - Delivery address
- `latitude` / `longitude` - GPS coordinates
- `cans` - Number of water cans (default: 1)
- `delivery_date` - Date of delivery (default: today)
- `status` - 'pending' or 'completed'
- `completed_at` - When delivery was completed
- `route_order` - Optimized sequence number
- `created_at` - Timestamp

#### `gps_tracking`
- `id` - UUID primary key
- `driver_id` - Links to drivers table
- `latitude` / `longitude` - GPS coordinates
- `timestamp` - When location was recorded
- `total_distance` - Cumulative distance in km

### Security (Row Level Security)

All tables have RLS enabled with policies that ensure:
- Drivers can only see their own data
- Drivers can update their own deliveries
- Drivers can insert GPS tracking for themselves
- No cross-driver data access

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |

---

## 🧪 Testing the App

### Test Login
1. Use the driver email and password you created
2. Should see the delivery list

### Test Route Optimization
1. Make sure you have pending deliveries
2. Allow location access when prompted
3. Click "Optimize Route" - should reorder by distance
4. Click "Start Route" - should open Google Maps

### Test Delivery Completion
1. Click the checkmark on any delivery card
2. Should mark as completed and show success toast
3. Refresh page - delivery should stay completed

### Test GPS Tracking
1. Start a route
2. Check Supabase > **Table Editor** > `gps_tracking`
3. Should see new entries every 10 seconds

---

## 📱 PWA Installation

### On Mobile (Chrome/Safari)
1. Visit your deployed URL
2. Chrome: Tap menu > "Add to Home Screen"
3. Safari: Tap share > "Add to Home Screen"

### On Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Add new site from Git
4. Add environment variables in site settings
5. Deploy!

### Important: Update CORS

After deploying, update your Supabase CORS settings:
1. Go to Supabase > **Settings** > **API**
2. Add your production URL to allowed origins

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists
- Check variable names match exactly
- Restart dev server after adding variables

### "No deliveries showing"
- Check you created a driver with matching email
- Make sure deliveries are assigned to that driver
- Check delivery_date is today's date

### "GPS not working"
- Allow location permissions in browser
- HTTPS required (localhost works in dev)
- Check browser console for errors

### "Route optimization not working"
- Wait for GPS location to be acquired
- Make sure you have pending deliveries
- Check browser console for errors

### "Icons not showing in PWA"
- Make sure icon-192.png and icon-512.png exist in public/
- Clear browser cache and reinstall PWA
- Check manifest.json is accessible

### "Service Worker not registering"
- Check browser console for errors
- Make sure sw.js is in public/ directory
- HTTPS required (localhost works in dev)

---

## 🎯 Next Steps

### Immediate Enhancements
- [ ] Add push notifications for new deliveries
- [ ] Add driver notes/comments per delivery
- [ ] Add photo upload for proof of delivery
- [ ] Add cash collection tracking
- [ ] Add delivery time windows

### Advanced Features
- [ ] Real-time location sharing with admin
- [ ] Multi-day route planning
- [ ] Analytics dashboard
- [ ] Customer signature capture
- [ ] Integration with payment systems

### Performance Optimizations
- [ ] Add React Query for better data caching
- [ ] Implement virtual scrolling for large lists
- [ ] Add offline queue for deliveries
- [ ] Optimize bundle size

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Google Maps API Docs](https://developers.google.com/maps/documentation)
- [PWA Best Practices](https://web.dev/pwa/)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

## 🆘 Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs in dashboard
3. Verify all environment variables
4. Make sure database migrations ran successfully
5. Try in incognito/private mode to rule out cache issues

---

## 📄 License

This project is available for personal and commercial use.

---

**Setup Date:** February 15, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
