import { MapPin, Phone, Check, Navigation2, Zap, Clock, X, ExternalLink } from 'lucide-react';
import type { Delivery } from '../lib/types';

interface DeliveryCardProps {
  delivery: Delivery;
  index: number;
  onComplete: (id: string) => void;
  onUncomplete: (id: string) => void;
  isNearest?: boolean;
  distance?: number;
  animationDelay?: number;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export default function DeliveryCard({ 
  delivery, 
  index, 
  onComplete,
  onUncomplete,
  isNearest = false,
  distance,
  animationDelay = 0,
  isSelected = false,
  onSelect
}: DeliveryCardProps) {
  const isCompleted = delivery.status === 'completed';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or checkbox
    if ((e.target as HTMLElement).closest('button, input[type="checkbox"], a')) {
      return;
    }
    
    // Open individual location in Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.latitude},${delivery.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(delivery.id, e.target.checked);
    }
  };

  // Format time window
  const getTimeWindow = () => {
    if (!delivery.preferred_time_start || !delivery.preferred_time_end) {
      return 'Anytime';
    }
    
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    return `${formatTime(delivery.preferred_time_start)} - ${formatTime(delivery.preferred_time_end)}`;
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-xl shadow-md p-4 transition-all duration-300 cursor-pointer ${
        isCompleted 
          ? 'opacity-75 border-2 border-green-500' 
          : isNearest
          ? 'border-2 border-green-500 bg-green-50 animate-pulse-glow'
          : isSelected
          ? 'border-2 border-blue-500 bg-blue-50'
          : 'border-2 border-transparent hover:border-blue-300 hover:shadow-lg'
      }`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Nearest location badge */}
      {isNearest && !isCompleted && (
        <div className="mb-3 flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium animate-bounce-subtle">
          <Navigation2 className="w-4 h-4" />
          <span>Nearest - {distance ? `${distance.toFixed(1)} km away` : ''}</span>
          <Zap className="w-4 h-4" />
        </div>
      )}

      <div className="flex items-start gap-3 mb-3">
        {/* Checkbox for multi-select */}
        {!isCompleted && onSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="w-5 h-5 mt-1 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Number/Status indicator */}
        <div
          className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
            isCompleted 
              ? 'bg-green-500 text-white scale-110' 
              : isNearest
              ? 'bg-green-500 text-white animate-bounce-subtle'
              : isSelected
              ? 'bg-blue-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {isCompleted ? (
            <Check className="w-6 h-6 animate-scale-up" />
          ) : (
            <span className="transition-transform group-hover:scale-110">
              {delivery.route_order || index + 1}
            </span>
          )}
        </div>

        {/* Customer info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
            {delivery.customer_name}
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {delivery.cans} {delivery.cans === 1 ? 'can' : 'cans'}
            </span>
            {distance && !isCompleted && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600 font-medium">{distance.toFixed(1)} km</span>
              </>
            )}
            {delivery.estimated_duration_minutes && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">~{delivery.estimated_duration_minutes} min</span>
              </>
            )}
          </p>
          
          {/* Time window */}
          <div className="flex items-center gap-1 mt-1 text-sm text-orange-600 font-medium">
            <Clock className="w-4 h-4" />
            <span>{getTimeWindow()}</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex-shrink-0">
          {isCompleted ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUncomplete(delivery.id);
              }}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Undo
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(delivery.id);
              }}
              className="bg-green-500 hover:bg-green-600 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group"
            >
              <Check className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Complete
            </button>
          )}
        </div>
      </div>

      {/* Address and phone */}
      <div className="space-y-2.5">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
          <p className="flex-1 leading-relaxed">{delivery.address}</p>
        </div>
        {delivery.customer_phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-5 h-5 flex-shrink-0 text-blue-600" />
            <a
              href={`tel:${delivery.customer_phone}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-blue-600 transition-all duration-200 hover:underline font-medium"
            >
              {delivery.customer_phone}
            </a>
          </div>
        )}
      </div>

      {/* Completed timestamp */}
      {isCompleted && delivery.completed_at && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Check className="w-3 h-3" />
            Completed at {new Date(delivery.completed_at).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
