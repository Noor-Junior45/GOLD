import React from 'react';
import { Tag } from 'lucide-react';
import { Offer } from '../services/offerService';

interface OfferBadgeProps {
  offer: Offer;
  variant?: 'card' | 'detail' | 'pill';
  className?: string;
}

export const OfferBadge: React.FC<OfferBadgeProps> = ({
  offer,
  variant = 'card',
  className = ''
}) => {
  const discountLabel = offer.discount_type === 'percentage'
    ? `${offer.discount_value}% OFF`
    : `₹${offer.discount_value} OFF`;

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-900 border border-amber-500/30 text-[10px] font-black tracking-tight ${className}`}
        title={`${offer.title}: ${offer.description || ''}`}
      >
        <Tag className="w-2.5 h-2.5 text-amber-700 shrink-0" />
        <span className="truncate">{offer.code} · {discountLabel}</span>
      </span>
    );
  }

  if (variant === 'detail') {
    return (
      <div
        className={`flex items-center justify-between gap-2 p-2.5 sm:p-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50/60 border border-amber-200/80 rounded-xl shadow-2xs ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-black">
            <Tag className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-black text-slate-900 tracking-tight uppercase">
                {offer.code}
              </span>
              <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300">
                {discountLabel}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              {offer.description || offer.title}
              {offer.min_order_value ? ` (Min. ₹${offer.min_order_value})` : ''}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-amber-900 bg-white/90 px-2 py-1 rounded-md border border-amber-200/80 shrink-0 shadow-2xs">
          Use at checkout
        </span>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/80 text-[10px] font-extrabold tracking-tight select-none shadow-2xs ${className}`}
      title={`Active coupon: ${offer.code} for ${discountLabel}`}
    >
      <Tag className="w-2.5 h-2.5 text-amber-700 shrink-0 stroke-[2.5]" />
      <span className="truncate">{offer.code} · {discountLabel}</span>
    </div>
  );
};
