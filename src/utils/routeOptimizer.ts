import type { Delivery } from '../lib/types';

interface Location {
  lat: number;
  lng: number;
}

interface RouteOptimizationResult {
  optimizedRoute: Delivery[];
  totalDistance: number;
  unoptimizedDistance: number;
  fuelSaved: number; // in liters
  moneySaved: number; // in currency
  co2Saved: number; // in kg
}

// Average fuel consumption for delivery vehicles (km per liter)
const FUEL_EFFICIENCY = 10; // 10 km/L for typical delivery vehicle
const FUEL_COST_PER_LITER = 110; // INR per liter (adjust as needed)
const CO2_PER_LITER = 2.31; // kg of CO2 per liter of fuel

function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Calculate total distance for a route
function calculateRouteDistance(deliveries: Delivery[], startLocation: Location): number {
  if (deliveries.length === 0) return 0;
  
  let total = 0;
  let current = startLocation;
  
  for (const delivery of deliveries) {
    const distance = calculateDistance(current, {
      lat: delivery.latitude,
      lng: delivery.longitude,
    });
    total += distance;
    current = { lat: delivery.latitude, lng: delivery.longitude };
  }
  
  return total;
}

export function optimizeRoute(
  deliveries: Delivery[],
  currentLocation: Location
): Delivery[] {
  if (deliveries.length === 0) return [];

  const unvisited = [...deliveries];
  const optimized: Delivery[] = [];
  let current = currentLocation;

  // Nearest neighbor algorithm
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDistance = calculateDistance(current, {
      lat: unvisited[0].latitude,
      lng: unvisited[0].longitude,
    });

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(current, {
        lat: unvisited[i].latitude,
        lng: unvisited[i].longitude,
      });
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    current = { lat: nearest.latitude, lng: nearest.longitude };
  }

  return optimized;
}

export function optimizeRouteWithStats(
  deliveries: Delivery[],
  currentLocation: Location
): RouteOptimizationResult {
  if (deliveries.length === 0) {
    return {
      optimizedRoute: [],
      totalDistance: 0,
      unoptimizedDistance: 0,
      fuelSaved: 0,
      moneySaved: 0,
      co2Saved: 0,
    };
  }

  // Calculate unoptimized distance (original order)
  const unoptimizedDistance = calculateRouteDistance(deliveries, currentLocation);

  // Optimize route
  const optimizedRoute = optimizeRoute(deliveries, currentLocation);

  // Calculate optimized distance
  const totalDistance = calculateRouteDistance(optimizedRoute, currentLocation);

  // Calculate savings
  const distanceSaved = unoptimizedDistance - totalDistance;
  const fuelSaved = distanceSaved / FUEL_EFFICIENCY;
  const moneySaved = fuelSaved * FUEL_COST_PER_LITER;
  const co2Saved = fuelSaved * CO2_PER_LITER;

  return {
    optimizedRoute,
    totalDistance,
    unoptimizedDistance,
    fuelSaved,
    moneySaved,
    co2Saved,
  };
}

// Find the nearest delivery from current location
export function findNearestDelivery(
  deliveries: Delivery[],
  currentLocation: Location
): { delivery: Delivery; distance: number } | null {
  if (deliveries.length === 0) return null;

  let nearest = deliveries[0];
  let shortestDistance = calculateDistance(currentLocation, {
    lat: deliveries[0].latitude,
    lng: deliveries[0].longitude,
  });

  for (let i = 1; i < deliveries.length; i++) {
    const distance = calculateDistance(currentLocation, {
      lat: deliveries[i].latitude,
      lng: deliveries[i].longitude,
    });
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = deliveries[i];
    }
  }

  return { delivery: nearest, distance: shortestDistance };
}

export function calculateTotalDistance(
  locations: Array<{ latitude: number; longitude: number }>
): number {
  if (locations.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < locations.length - 1; i++) {
    total += calculateDistance(
      { lat: locations[i].latitude, lng: locations[i].longitude },
      { lat: locations[i + 1].latitude, lng: locations[i + 1].longitude }
    );
  }
  return total;
}

export function buildGoogleMapsUrl(deliveries: Delivery[]): string {
  if (deliveries.length === 0) return '';

  // If only one delivery, just navigate to it
  if (deliveries.length === 1) {
    return `https://www.google.com/maps/dir/?api=1&destination=${deliveries[0].latitude},${deliveries[0].longitude}&travelmode=driving`;
  }

  // For multiple deliveries, exclude the last one from waypoints (it's the destination)
  const waypoints = deliveries
    .slice(0, -1)
    .map((d) => `${d.latitude},${d.longitude}`)
    .join('|'); // Google Maps uses | as separator

  const destination = deliveries[deliveries.length - 1];

  return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&waypoints=${waypoints}&travelmode=driving`;
}
