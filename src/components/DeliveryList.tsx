import { useState, useEffect } from 'react';
import { MapPinned, LogOut, Navigation, TrendingUp, Fuel, Leaf, IndianRupee, Sparkles, Loader2, Filter, CheckSquare, Square, ArrowUpDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGPSTracking } from '../hooks/useGPSTracking';
import { useToast } from '../hooks/useToast';
import { optimizeRouteWithStats, buildGoogleMapsUrl, findNearestDelivery } from '../utils/routeOptimizer';
import type { Delivery } from '../lib/types';
import DeliveryCard from './DeliveryCard';
import Toast from './Toast';

type SortOption = 'default' | 'cans-asc' | 'cans-desc' | 'distance' | 'time';
type FilterOption = 'all' | 'pending' | 'completed';

export default function DeliveryList() {
  const { driver, signOut } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [nearestDeliveryId, setNearestDeliveryId] = useState<string | null>(null);
  const [selectedDeliveryIds, setSelectedDeliveryIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const [fuelStats, setFuelStats] = useState({
    fuelSaved: 0,
    moneySaved: 0,
    co2Saved: 0,
    distanceSaved: 0,
  });
  
  const { toasts, hideToast, success, error, info } = useToast();
  const { currentLocation, totalDistance, error: gpsError } = useGPSTracking(
    driver?.id ?? null,
    isTracking
  );

  useEffect(() => {
    if (driver) {
      loadDeliveries();
    }
  }, [driver]);

  useEffect(() => {
    if (currentLocation && deliveries.length > 0) {
      const pending = deliveries.filter((d) => d.status === 'pending');
      if (pending.length > 0) {
        const nearest = findNearestDelivery(pending, {
          lat: currentLocation.coords.latitude,
          lng: currentLocation.coords.longitude,
        });
        if (nearest) {
          setNearestDeliveryId(nearest.delivery.id);
        }
      }
    }
  }, [currentLocation, deliveries]);

  const loadDeliveries = async () => {
    if (!driver) return;
    const today = new Date().toISOString().split('T')[0];
    const { data, error: fetchError } = await supabase
      .from('deliveries')
      .select('*')
      .eq('driver_id', driver.id)
      .eq('delivery_date', today)
      .order('route_order', { ascending: true, nullsFirst: false });
    if (!fetchError && data) {
      setDeliveries(data);
    }
    setLoading(false);
  };

  const handleOptimizeRoute = async () => {
    if (!currentLocation) {
      info('Waiting for GPS location...');
      return;
    }
    const pendingDeliveries = deliveries.filter((d) => d.status === 'pending');
    if (pendingDeliveries.length === 0) {
      info('No pending deliveries to optimize');
      return;
    }
    setIsOptimizing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = optimizeRouteWithStats(pendingDeliveries, {
      lat: currentLocation.coords.latitude,
      lng: currentLocation.coords.longitude,
    });
    setFuelStats({
      fuelSaved: result.fuelSaved,
      moneySaved: result.moneySaved,
      co2Saved: result.co2Saved,
      distanceSaved: result.unoptimizedDistance - result.totalDistance,
    });
    const updatedDeliveries = deliveries.map((d) => {
      if (d.status === 'pending') {
        const index = result.optimizedRoute.findIndex((opt) => opt.id === d.id);
        return { ...d, route_order: index + 1 };
      }
      return d;
    });
    setDeliveries(updatedDeliveries.sort((a, b) => (a.route_order ?? 999) - (b.route_order ?? 999)));
    result.optimizedRoute.forEach(async (delivery, index) => {
      await supabase.from('deliveries').update({ route_order: index + 1 }).eq('id', delivery.id);
    });
    setIsOptimizing(false);
    success(`Route optimized! Save ₹${result.moneySaved.toFixed(0)} on fuel`);
  };

  const handleStartRoute = () => {
    const pendingDeliveries = deliveries.filter((d) => d.status === 'pending');
    if (pendingDeliveries.length === 0) {
      info('No pending deliveries');
      return;
    }
    const url = buildGoogleMapsUrl(pendingDeliveries);
    window.open(url, '_blank');
    setIsTracking(true);
    success('Route started! GPS tracking enabled.');
  };

  const handleNavigateSelected = () => {
    if (selectedDeliveryIds.size === 0) {
      info('Please select deliveries to navigate');
      return;
    }
    const selectedDeliveries = deliveries
      .filter((d) => selectedDeliveryIds.has(d.id) && d.status === 'pending')
      .sort((a, b) => (a.route_order ?? 999) - (b.route_order ?? 999));
    if (selectedDeliveries.length === 0) {
      info('No pending deliveries selected');
      return;
    }
    const url = buildGoogleMapsUrl(selectedDeliveries);
    window.open(url, '_blank');
    success(`Navigating to ${selectedDeliveries.length} selected locations`);
  };

  const handleCompleteDelivery = async (id: string) => {
    const { error: updateError } = await supabase.from('deliveries').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', id);
    if (updateError) {
      error('Failed to complete delivery');
      return;
    }
    setDeliveries(deliveries.map((d) => (d.id === id ? { ...d, status: 'completed', completed_at: new Date().toISOString() } : d)));
    setSelectedDeliveryIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    success('Delivery marked as complete!');
  };

  const handleUncompleteDelivery = async (id: string) => {
    const { error: updateError } = await supabase.from('deliveries').update({
      status: 'pending',
      completed_at: null,
    }).eq('id', id);
    if (updateError) {
      error('Failed to undo completion');
      return;
    }
    setDeliveries(deliveries.map((d) => (d.id === id ? { ...d, status: 'pending', completed_at: null } : d)));
    info('Delivery marked as pending');
  };

  const handleSelectDelivery = (id: string, selected: boolean) => {
    setSelectedDeliveryIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const pendingIds = deliveries.filter(d => d.status === 'pending').map(d => d.id);
    if (selectedDeliveryIds.size === pendingIds.length && pendingIds.length > 0) {
      setSelectedDeliveryIds(new Set());
    } else {
      setSelectedDeliveryIds(new Set(pendingIds));
    }
  };

  const getFilteredAndSortedDeliveries = () => {
    let filtered = [...deliveries];
    if (filterBy === 'pending') {
      filtered = filtered.filter(d => d.status === 'pending');
    } else if (filterBy === 'completed') {
      filtered = filtered.filter(d => d.status === 'completed');
    }
    if (sortBy === 'cans-asc') {
      filtered.sort((a, b) => a.cans - b.cans);
    } else if (sortBy === 'cans-desc') {
      filtered.sort((a, b) => b.cans - a.cans);
    } else if (sortBy === 'distance' && currentLocation) {
      filtered.sort((a, b) => calculateDistanceFromCurrent(a) - calculateDistanceFromCurrent(b));
    } else if (sortBy === 'time') {
      filtered.sort((a, b) => {
        if (!a.preferred_time_start && !b.preferred_time_start) return 0;
        if (!a.preferred_time_start) return 1;
        if (!b.preferred_time_start) return -1;
        return a.preferred_time_start.localeCompare(b.preferred_time_start);
      });
    }
    return filtered;
  };

  const calculateDistanceFromCurrent = (delivery: Delivery): number => {
    if (!currentLocation) return 0;
    const R = 6371;
    const dLat = (delivery.latitude - currentLocation.coords.latitude) * Math.PI / 180;
    const dLon = (delivery.longitude - currentLocation.coords.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(currentLocation.coords.latitude * Math.PI / 180) * Math.cos(delivery.latitude * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredDeliveries = getFilteredAndSortedDeliveries();
  const pendingCount = deliveries.filter((d) => d.status === 'pending').length;
  const completedCount = deliveries.filter((d) => d.status === 'completed').length;
  const completionPercentage = deliveries.length > 0 ? Math.round((completedCount / deliveries.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <div className="text-gray-600 text-lg">Loading deliveries...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 animate-fade-in pb-20">
      {toasts.map((toast) => <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />)}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-6 shadow-xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Book Water" className="h-12 w-auto animate-scale-up" />
              <div>
                <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
                <p className="text-blue-100 text-sm">Welcome, {driver?.name}</p>
              </div>
            </div>
            <button onClick={signOut} className="p-2.5 hover:bg-blue-700 rounded-xl transition-all duration-200 active:scale-95">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="h-2.5 bg-blue-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-700 bg-opacity-60 backdrop-blur rounded-xl p-3 animate-scale-up">
              <div className="text-2xl font-bold">{deliveries.length}</div>
              <div className="text-xs text-blue-100">Total</div>
            </div>
            <div className="bg-blue-700 bg-opacity-60 backdrop-blur rounded-xl p-3 animate-scale-up">
              <div className="text-2xl font-bold text-yellow-300">{pendingCount}</div>
              <div className="text-xs text-blue-100">Pending</div>
            </div>
            <div className="bg-blue-700 bg-opacity-60 backdrop-blur rounded-xl p-3 animate-scale-up">
              <div className="text-2xl font-bold text-green-300">{completedCount}</div>
              <div className="text-xs text-blue-100">Done</div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isTracking && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 animate-slide-up border-l-4 border-blue-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><TrendingUp className="w-6 h-6 text-blue-600" /></div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">Distance Tracked</div>
                <div className="text-2xl font-bold text-blue-600">{totalDistance.toFixed(2)} km</div>
              </div>
            </div>
            {gpsError && <div className="text-red-600 text-sm mt-2 flex items-center gap-2"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>{gpsError}</div>}
          </div>
        )}
        {fuelStats.fuelSaved > 0 && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-xl p-5 mb-4 animate-scale-up">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="text-lg font-bold">Route Optimized!</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1"><Fuel className="w-4 h-4" /><span className="text-xs font-medium">Fuel Saved</span></div>
                <div className="text-xl font-bold">{fuelStats.fuelSaved.toFixed(1)}L</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1"><IndianRupee className="w-4 h-4" /><span className="text-xs font-medium">Money Saved</span></div>
                <div className="text-xl font-bold">₹{fuelStats.moneySaved.toFixed(0)}</div>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1"><Leaf className="w-4 h-4" /><span className="text-xs font-medium">CO₂ Reduced</span></div>
                <div className="text-xl font-bold">{fuelStats.co2Saved.toFixed(1)}kg</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-white text-opacity-90">You saved {fuelStats.distanceSaved.toFixed(1)} km by optimizing your route! 🎉</div>
          </div>
        )}
        <div className="flex gap-3 mb-4">
          <button onClick={handleOptimizeRoute} disabled={pendingCount === 0 || isOptimizing} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
            {isOptimizing ? (<><Loader2 className="w-5 h-5 animate-spin" />Optimizing...</>) : (<><MapPinned className="w-5 h-5" />Optimize Route</>)}
          </button>
          <button onClick={handleStartRoute} disabled={pendingCount === 0} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
            <Navigation className="w-5 h-5" />Start Route
          </button>
        </div>
        {selectedDeliveryIds.size > 0 && (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-4 mb-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">{selectedDeliveryIds.size} selected</span>
              </div>
              <button onClick={handleNavigateSelected} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
                <Navigation className="w-4 h-4" />Navigate Selected
              </button>
            </div>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-gray-700 font-medium hover:text-blue-600 transition-colors">
              <Filter className="w-5 h-5" />Sort & Filter
              <ArrowUpDown className="w-4 h-4" />
            </button>
            {pendingCount > 0 && (
              <button onClick={handleSelectAll} className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm">
                {selectedDeliveryIds.size === pendingCount ? <Square className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                {selectedDeliveryIds.size === pendingCount ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          {showFilters && (
            <div className="space-y-3 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="default">Default Order</option>
                  <option value="distance">Distance (Nearest First)</option>
                  <option value="time">Time Window</option>
                  <option value="cans-asc">Cans (Low to High)</option>
                  <option value="cans-desc">Cans (High to Low)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter By Status</label>
                <div className="flex gap-2">
                  <button onClick={() => setFilterBy('all')} className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${filterBy === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
                  <button onClick={() => setFilterBy('pending')} className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${filterBy === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Pending</button>
                  <button onClick={() => setFilterBy('completed')} className={`flex-1 py-2 px-3 rounded-lg font-medium transition-all ${filterBy === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Completed</button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-3">
          {filteredDeliveries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center text-gray-600 animate-scale-up">
              <MapPinned className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium">{deliveries.length === 0 ? 'No deliveries assigned for today' : 'No deliveries match your filters'}</p>
              <p className="text-sm text-gray-500 mt-2">{deliveries.length === 0 ? 'Check back later for new assignments' : 'Try adjusting your filters'}</p>
            </div>
          ) : (
            filteredDeliveries.map((delivery, index) => {
              const isNearest = delivery.id === nearestDeliveryId && delivery.status === 'pending';
              const distance = currentLocation && delivery.status === 'pending' ? calculateDistanceFromCurrent(delivery) : undefined;
              return (
                <div key={delivery.id} className="stagger-item">
                  <DeliveryCard delivery={delivery} index={index} onComplete={handleCompleteDelivery} onUncomplete={handleUncompleteDelivery} isNearest={isNearest} distance={distance} animationDelay={index * 50} isSelected={selectedDeliveryIds.has(delivery.id)} onSelect={delivery.status === 'pending' ? handleSelectDelivery : undefined} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}