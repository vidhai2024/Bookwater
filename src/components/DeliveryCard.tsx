import { MapPin, Phone, Check, Navigation2, Zap } from 'lucide-react';
import type { Delivery } from '../lib/types';

interface DeliveryCardProps {
  delivery: Delivery;
  index: number;
  onComplete: (id: string) => void;
  isNearest?: boolean;
  distance?: number;
  animationDelay?: number;
}

export default function DeliveryCard({ 
  delivery, 
  index, 
  onComplete,
  isNearest = false,
  distance,
  animationDelay = 0
}: DeliveryCardProps) {
  const isCompleted = delivery.status === 'completed';

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-4 transition-all duration-300 card-hover ${
        isCompleted 
          ? 'opacity-60 border-2 border-green-500' 
          : isNearest
          ? 'border-2 border-green-500 bg-green-50 animate-pulse-glow'
          : 'border-2 border-transparent hover:border-blue-200'
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

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
              isCompleted 
                ? 'bg-green-500 text-white scale-110' 
                : isNearest
                ? 'bg-green-500 text-white animate-bounce-subtle'
                : 'bg-blue-500 text-white'
            }`}
          >
            {isCompleted ? (
              <Check className="w-6 h-6 animate-scale-up" />
            ) : (
              <span className="transition-transform group-hover:scale-110">
                {index + 1}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {delivery.customer_name}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {delivery.cans} {delivery.cans === 1 ? 'can' : 'cans'}
            </p>
          </div>
        </div>
        {!isCompleted && (
          <button
            onClick={() => onComplete(delivery.id)}
            className="bg-green-500 hover:bg-green-600 active:scale-95 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 group"
          >
            <Check className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Complete
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600 animate-pulse" />
          <p className="flex-1 leading-relaxed">{delivery.address}</p>
        </div>
        {delivery.customer_phone && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone className="w-5 h-5 flex-shrink-0 text-blue-600" />
            <a
              href={`tel:${delivery.customer_phone}`}
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
      {/* Route order indicator */}
      {delivery.route_order && !isCompleted && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Navigation2 className="w-3 h-3" />
              Stop #{delivery.route_order}
            </span>
            {distance && (
              <span className="font-medium text-blue-600">
                {distance.toFixed(1)} km
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
