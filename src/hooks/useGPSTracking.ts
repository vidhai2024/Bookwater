import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculateTotalDistance } from '../utils/routeOptimizer';

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export function useGPSTracking(driverId: string | null, isTracking: boolean) {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const locationHistory = useRef<GPSLocation[]>([]);
  const watchId = useRef<number | null>(null);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isTracking || !driverId) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position);
        setError(null);
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    intervalId.current = setInterval(() => {
      // Access current location via ref to avoid dependency issues
      navigator.geolocation.getCurrentPosition(
        (position) => {
          saveLocation(position);
        },
        (err) => {
          console.error('GPS tracking error:', err);
        },
        { enableHighAccuracy: true }
      );
    }, 10000);

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [isTracking, driverId]);

  const saveLocation = async (position: GeolocationPosition) => {
    if (!driverId) return;

    const newLocation: GPSLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: new Date().toISOString(),
    };

    locationHistory.current.push(newLocation);

    const distance = calculateTotalDistance(locationHistory.current);
    setTotalDistance(distance);

    await supabase.from('gps_tracking').insert({
      driver_id: driverId,
      latitude: newLocation.latitude,
      longitude: newLocation.longitude,
      total_distance: distance,
    });
  };

  return { currentLocation, totalDistance, error };
}
