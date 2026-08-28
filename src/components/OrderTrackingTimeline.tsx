import React from 'react';
import { CheckCircle2, PackageCheck, Truck, Home, Clock, AlertCircle, Sparkles } from 'lucide-react';
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
  const status: OrderStatus = order.status || 'pending';
  const isCancelled = status === 'cancelled';

  // Extract timestamps with fallback to camelCase / createdAt
  const placedAtStr = order.placed_at || order.placedAt || order.createdAt;
  const packedAtStr = order.packed_at || order.packedAt;
  const deliveredAtStr = order.delivered_at || order.deliveredAt;

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

  // Compute active step index (0: Placed, 1: Packed, 2: Delivered)
  // Statuses: 'pending' | 'accepted' -> step 0 (Placed completed, packing in progress)
  // 'packing' -> step 1 in progress (Placed completed)
  // 'out_for_delivery' -> step 1 completed (Packed completed, delivery in progress)
  // 'delivered' -> step 2 completed
  const isPlacedDone = !isCancelled && Boolean(placedAtStr || true);
  const isPackedDone = !isCancelled && (Boolean(packedAtStr) || status === 'out_for_delivery' || status === 'delivered');
  const isDeliveredDone = !isCancelled && (Boolean(deliveredAtStr) || status === 'delivered');

  const isPackingInProgress = !isCancelled && (status === 'accepted' || status === 'packing') && !isPackedDone;
  const isDeliveryInProgress = !isCancelled && status === 'out_for_delivery' && !isDeliveredDone;

  const steps = [
    {
      id: 'placed',
      title: 'Order Placed',
      subtitle: 'Order confirmed & received',
      timestampLabel: 'placed_at',
      timestamp: formattedPlaced,
      rawTimestamp: placedAtStr,
      isCompleted: isPlacedDone,
      isInProgress: false,
      icon: CheckCircle2,
      activeColor: 'emerald'
    },
    {
      id: 'packed',
      title: 'Items Packed',
      subtitle: isPackedDone
        ? 'Packed at Central Kasba Depot'
        : isPackingInProgress
        ? 'Packing materials & quality check'
        : 'Awaiting warehouse pick',
      timestampLabel: 'packed_at',
      timestamp: formattedPacked,
      rawTimestamp: packedAtStr,
      isCompleted: isPackedDone,
      isInProgress: isPackingInProgress,
      icon: PackageCheck,
      activeColor: 'emerald'
    },
    {
      id: 'delivered',
      title: isDeliveredDone ? 'Delivered' : isDeliveryInProgress ? 'Out for Delivery' : 'Delivery',
      subtitle: isDeliveredDone
        ? 'Handed over at doorstep'
        : isDeliveryInProgress
        ? `Rider en route to ${order.area || 'your address'}`
        : '60-min express dispatch',
      timestampLabel: 'delivered_at',
      timestamp: formattedDelivered,
      rawTimestamp: deliveredAtStr,
      isCompleted: isDeliveredDone,
      isInProgress: isDeliveryInProgress,
      icon: isDeliveredDone ? Home : Truck,
      activeColor: 'emerald'
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
          This order was cancelled. If you were charged online, the refund will be credited back within 2-4 business days.
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
      {/* Header with live status badge */}
      <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="text-xs uppercase tracking-wide text-slate-700">Order Progress</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isDeliveredDone ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Delivered</span>
            </span>
          ) : isDeliveryInProgress ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
              <Truck className="w-3 h-3 text-blue-600" />
              <span>Out for Delivery</span>
            </span>
          ) : isPackingInProgress ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200">
              <PackageCheck className="w-3 h-3 text-amber-700" />
              <span>Packing Order</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-200/80 text-slate-700">
              <Sparkles className="w-3 h-3 text-slate-500" />
              <span>Confirmed</span>
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
              width: isDeliveredDone ? '100%' : isPackedDone ? '50%' : '0%'
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
    </div>
  );
};
