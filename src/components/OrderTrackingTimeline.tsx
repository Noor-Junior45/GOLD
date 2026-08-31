import React from 'react';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  Home,
  Clock,
  AlertCircle,
  Sparkles,
  Phone,
  User,
  Star,
  Navigation
} from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackingTimelineProps {
  order: Order;
  className?: string;
  compact?: boolean;
  borderless?: boolean;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  order,
  className = '',
  compact = false,
  borderless = false
}) => {
  const rawStatus = (order.status || 'pending').toLowerCase();
  const deliveryStatus = (order.delivery?.status || '').toLowerCase();
  const isCancelled = rawStatus === 'cancelled';
  const isDelivered = rawStatus === 'delivered' || deliveryStatus === 'delivered';
  const isNearDestination = rawStatus === 'near_destination' || deliveryStatus === 'near_destination';
  const isOutForDelivery =
    rawStatus === 'out_for_delivery' ||
    rawStatus === 'shipped' ||
    deliveryStatus === 'out_for_delivery' ||
    deliveryStatus === 'picked_up' ||
    isNearDestination;
  const isPacked =
    rawStatus === 'packed' ||
    Boolean(order.packed_at || order.packedAt) ||
    isOutForDelivery ||
    isDelivered;
  const isPacking =
    (rawStatus === 'packing' || rawStatus === 'accepted' || rawStatus === 'confirmed') &&
    !isPacked;

  // Extract timestamps with fallback
  const placedAtStr = order.placed_at || order.placedAt || order.createdAt;
  const packedAtStr = order.packed_at || order.packedAt;
  const shippedAtStr =
    order.shipped_at ||
    order.shippedAt ||
    order.out_for_delivery_at ||
    order.outForDeliveryAt ||
    order.delivery?.out_for_delivery_at ||
    order.delivery?.picked_up_at;
  const deliveredAtStr = order.delivered_at || order.deliveredAt || order.delivery?.delivered_at;

  // Format date helper
  const formatTimestamp = (timestamp?: string | null): string | null => {
    if (!timestamp) return null;
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  const formattedPlaced = formatTimestamp(placedAtStr);
  const formattedPacked = formatTimestamp(packedAtStr);
  const formattedDelivered = formatTimestamp(deliveredAtStr);

  // Dynamic ETA Calculation
  const etaTimestamp = order.delivery?.estimated_delivery_at
    ? new Date(order.delivery.estimated_delivery_at).getTime()
    : order.estimated_delivery_at
    ? new Date(order.estimated_delivery_at).getTime()
    : order.estimatedDeliveryTimestamp || (order.createdAt ? new Date(order.createdAt).getTime() + 3600000 : Date.now() + 3600000);

  const remainingMinutes = Math.max(0, Math.round((etaTimestamp - Date.now()) / 60000));
  const isPastEta = Date.now() > etaTimestamp;

  const etaDisplay = isDelivered
    ? 'Delivered'
    : isPastEta
    ? 'Arriving shortly • Express delivery'
    : remainingMinutes > 0
    ? `Expected in ${remainingMinutes} mins`
    : 'Arriving momentarily';

  // Delivery Partner Info (Only render if genuinely assigned by backend delivery app)
  const rawPartner = order.delivery?.delivery_partner || order.deliveryPartner;
  const partner = rawPartner && rawPartner.name && !rawPartner.name.toLowerCase().includes('bikash') ? rawPartner : undefined;

  const steps = [
    {
      id: 'placed',
      title: 'Order Placed',
      subtitle: 'Order confirmed & received',
      timestamp: formattedPlaced,
      isCompleted: !isCancelled,
      isInProgress: false,
      icon: CheckCircle2
    },
    {
      id: 'packed',
      title: 'Items Packed',
      subtitle: isPacked
        ? 'Packed at Central Kasba Depot'
        : isPacking
        ? 'Packing materials & quality check'
        : 'Awaiting warehouse pick',
      timestamp: formattedPacked,
      isCompleted: isPacked && !isCancelled,
      isInProgress: isPacking && !isCancelled,
      icon: PackageCheck
    },
    {
      id: 'delivered',
      title: isDelivered
        ? 'Delivered'
        : isNearDestination
        ? 'Near Your Location'
        : isOutForDelivery
        ? 'Out for Delivery'
        : 'Delivery',
      subtitle: isDelivered
        ? 'Handed over at doorstep'
        : isNearDestination
        ? 'Rider within 500m of delivery address'
        : isOutForDelivery
        ? `Rider en route to ${order.area || 'your address'}`
        : etaDisplay,
      timestamp: formattedDelivered,
      isCompleted: isDelivered && !isCancelled,
      isInProgress: isOutForDelivery && !isDelivered && !isCancelled,
      icon: isDelivered ? Home : isNearDestination ? Navigation : Truck
    }
  ];

  if (isCancelled) {
    return (
      <div className={`bg-red-50/90 ${borderless ? '' : 'border border-red-200'} rounded-2xl p-3.5 sm:p-4 text-xs ${className}`}>
        <div className="flex items-center gap-2 text-red-800 font-bold mb-1">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>Order Cancelled</span>
        </div>
        <p className="text-red-600 text-[11px] leading-relaxed pl-6">
          {order.cancel_reason || order.cancellation_reason || 'This order was cancelled. If you were charged online, the refund will be credited back within 2-4 business days.'}
        </p>
        {formattedPlaced && (
          <div className="mt-2 text-[10px] text-red-500 font-semibold pl-6">
            Placed at: {formattedPlaced}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-slate-50/90 ${borderless ? '' : 'border border-slate-200/80'} rounded-2xl p-3.5 sm:p-4.5 ${
        compact ? 'text-xs' : 'text-xs'
      } ${className}`}
    >
      {/* Header with dynamic status badge & ETA */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4 flex-wrap">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-xs uppercase tracking-wide text-slate-700">Order Progress</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {isDelivered ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Delivered</span>
            </span>
          ) : isNearDestination ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse">
              <Navigation className="w-3 h-3 text-emerald-600" />
              <span>Rider Near Your Location • {etaDisplay}</span>
            </span>
          ) : isOutForDelivery ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>Out for Delivery • {etaDisplay}</span>
            </span>
          ) : isPacked ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-900 border border-purple-200">
              <PackageCheck className="w-3 h-3 text-purple-700" />
              <span>Packed &amp; Ready • {etaDisplay}</span>
            </span>
          ) : isPacking ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
              <PackageCheck className="w-3 h-3 text-amber-700" />
              <span>Packing Order • {etaDisplay}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200/80 text-slate-700">
              <Sparkles className="w-3 h-3 text-slate-500" />
              <span>Confirmed • {etaDisplay}</span>
            </span>
          )}
        </div>
      </div>

      {/* Step Indicator UI */}
      <div className="relative">
        {/* Horizontal Connector Line Container (Desktop & Tablet) */}
        <div className="hidden sm:block absolute top-4 left-[16%] right-[16%] h-1 z-0">
          {/* Background Track */}
          <div className="absolute inset-0 bg-slate-200 rounded-full" />
          {/* Active Progress Fill */}
          <div
            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-500"
            style={{
              width: isDelivered ? '100%' : isPacked ? '50%' : '0%'
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-2 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2 relative"
              >
                {/* Mobile vertical line connector */}
                {index < steps.length - 1 && (
                  <div
                    className={`sm:hidden absolute left-4 top-8 bottom-0 w-0.5 ${
                      steps[index + 1].isCompleted
                        ? 'bg-emerald-500'
                        : step.isCompleted && steps[index + 1].isInProgress
                        ? 'bg-blue-400'
                        : 'bg-slate-200'
                    }`}
                    style={{ height: 'calc(100% + 2px)' }}
                  />
                )}

                {/* Step Node Icon / Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 shadow-2xs ${
                    step.isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white ring-4 ring-emerald-50'
                      : step.isInProgress
                      ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Text & Timestamp Info */}
                <div className="min-w-0 flex-1 sm:flex-initial">
                  <div className="flex items-center gap-1.5 sm:justify-center">
                    <span
                      className={`text-xs font-bold ${
                        step.isCompleted
                          ? 'text-slate-900'
                          : step.isInProgress
                          ? 'text-blue-900 font-extrabold'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 sm:line-clamp-2 mt-0.5">
                    {step.subtitle}
                  </p>

                  {/* Timestamp Pill */}
                  <div className="mt-1 flex items-center sm:justify-center">
                    {step.timestamp ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span>{step.timestamp}</span>
                      </span>
                    ) : step.isInProgress ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping shrink-0" />
                        <span>In Progress</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assigned Delivery Partner Card (when dispatched/assigned) */}
      {partner && partner.name && !isCancelled && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-3 bg-white/80 p-2.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-900">{partner.name}</span>
                {partner.rating && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>{partner.rating}</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                Delivery Partner {partner.vehicleNumber || partner.vehicle_number ? `• ${partner.vehicleNumber || partner.vehicle_number}` : ''}
              </div>
            </div>
          </div>

          {partner.phone && (
            <a
              href={`tel:${partner.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 active:scale-95 transition-all shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Rider</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
};
