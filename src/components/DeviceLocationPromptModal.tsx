import React, { useState } from 'react';
import {
  X,
  MapPin,
  Search,
  Home,
  Briefcase,
  Building2,
  ChevronRight,
  Loader2,
  Check
} from 'lucide-react';
import { KolkataArea, SavedAddress } from '../types';
import { KOLKATA_AREAS } from '../data/kolkataAreas';
import { ACTIVE_SAVED_ADDRESS_KEY } from '../services/supabaseService';
import { useBottomSheetDismiss } from '../hooks/useBottomSheetDismiss';

interface DeviceLocationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedAddresses: SavedAddress[];
  currentArea: KolkataArea;
  activeAddress?: SavedAddress | null;
  onSelectArea: (area: KolkataArea, address?: SavedAddress) => void;
  onOpenManualSearch: () => void;
}

export const DeviceLocationPromptModal: React.FC<DeviceLocationPromptModalProps> = ({
  isOpen,
  onClose,
  savedAddresses,
  activeAddress,
  onSelectArea,
  onOpenManualSearch
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Drag down to dismiss on mobile
  const {
    handleTouchStart: handleSheetTouchStart,
    handleTouchMove: handleSheetTouchMove,
    handleTouchEnd: handleSheetTouchEnd,
    dragStyle
  } = useBottomSheetDismiss({
    onClose,
    disabled: !isOpen
  });

  if (!isOpen) return null;

  const handleEnableLocation = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsLoading(false);
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let resolvedStreet = '';
        let matched = KOLKATA_AREAS[0];

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const addr = data.address;
              const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
              const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || addr.city_district || '';
              const building = addr.building || addr.amenity || addr.shop || '';
              const postcode = addr.postcode || '';
              const parts = [building, road, suburb].filter(Boolean);
              resolvedStreet = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ');

              let minDistance = Number.MAX_VALUE;
              KOLKATA_AREAS.forEach((a) => {
                if (a.pincode && postcode && a.pincode === postcode) {
                  matched = a;
                  minDistance = 0;
                } else if (a.lat && a.lng) {
                  const dist = Math.hypot(a.lat - lat, a.lng - lng);
                  if (dist < minDistance) {
                    minDistance = dist;
                    matched = a;
                  }
                }
              });
            }
          }
        } catch {
          // Fallback nearest
        }

        if (!resolvedStreet) {
          let minDistance = Number.MAX_VALUE;
          KOLKATA_AREAS.forEach((a) => {
            if (a.lat && a.lng) {
              const dist = Math.hypot(a.lat - lat, a.lng - lng);
              if (dist < minDistance) {
                minDistance = dist;
                matched = a;
              }
            }
          });
          resolvedStreet = matched.exactStreet || matched.name;
        }

        setGpsLoading(false);

        const appliedArea: KolkataArea = {
          ...matched,
          lat,
          lng,
          exactStreet: resolvedStreet
        };

        try {
          localStorage.removeItem(ACTIVE_SAVED_ADDRESS_KEY);
          localStorage.setItem('giriraj_active_address', resolvedStreet);
        } catch (e) {
          console.error(e);
        }

        onSelectArea(appliedArea, undefined);
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        console.warn('Geolocation error:', err);
        setGpsError('Permission denied or location timed out. Please select or search manually below.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    try {
      localStorage.setItem(ACTIVE_SAVED_ADDRESS_KEY, JSON.stringify(addr));
      localStorage.setItem('giriraj_active_address', `${addr.houseFlat}, ${addr.houseName}`);
      if (addr.landmark) {
        localStorage.setItem('giriraj_active_landmark', addr.landmark);
      }
    } catch (e) {
      console.error(e);
    }

    onSelectArea(addr.area, addr);
    onClose();
  };

  const getTagIcon = (tag: SavedAddress['tag']) => {
    switch (tag) {
      case 'home':
        return <Home className="w-4 h-4 text-rose-600" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      default:
        return <MapPin className="w-4 h-4 text-rose-600" />;
    }
  };

  const getTagTitle = (addr: SavedAddress) => {
    if (addr.tag === 'home') return 'Home';
    if (addr.tag === 'work') return 'Work';
    if (addr.tag === 'hotel') return 'Hotel / Site';
    return addr.tagLabel || 'Saved Location';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-black/65 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-200 p-0 sm:p-4">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0 -z-10 cursor-pointer"
        onClick={onClose}
        aria-label="Dismiss location prompt"
      />

      {/* Floating Circular Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="mb-2.5 sm:mb-3 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        title="Close"
      >
        <X className="w-4.5 h-4.5 stroke-[2.5]" />
      </button>

      {/* Bottom Sheet Container - Perfectly fitted for mobile phone screens */}
      <div
        id="device-location-prompt-sheet"
        style={dragStyle}
        className="w-full max-w-lg bg-[#f8fafc] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[85vh] sm:max-h-[80vh] text-slate-900"
      >
        {/* Drag Down Handle on Mobile */}
        <div
          onTouchStart={handleSheetTouchStart}
          onTouchMove={handleSheetTouchMove}
          onTouchEnd={handleSheetTouchEnd}
          className="w-full flex flex-col items-center justify-center pt-2.5 pb-1.5 sm:hidden cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors" />
        </div>

        <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 overflow-y-auto no-scrollbar pb-6 sm:pb-5">
          
          {/* Card 1: Current Location with Reddish Google Maps Pin */}
          <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Google Maps Style Reddish Pin Logo */}
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-b from-rose-50 to-rose-100/60 border border-rose-200/80 shadow-[0_2px_8px_-2px_rgba(244,63,94,0.15),inset_0_1px_1px_rgba(255,255,255,0.9)] shrink-0">
                <svg
                  className="w-5.5 h-5.5 sm:w-6 sm:h-6 drop-shadow-[0_2px_4px_rgba(225,29,72,0.25)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C8.13401 2 5 5.13401 5 9C5 14.18 11.16 21.32 11.45 21.65C11.74 21.98 12.26 21.98 12.55 21.65C12.84 21.32 19 14.18 19 9C19 5.13401 15.866 2 12 2Z"
                    fill="url(#gmap-prompt-pin-gradient)"
                  />
                  <ellipse
                    cx="12"
                    cy="8.8"
                    rx="2.8"
                    ry="2.8"
                    fill="white"
                  />
                  <defs>
                    <linearGradient
                      id="gmap-prompt-pin-gradient"
                      x1="5"
                      y1="2"
                      x2="19"
                      y2="22"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#ff4d79" />
                      <stop offset="0.5" stopColor="#ff245d" />
                      <stop offset="1" stopColor="#d91448" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none truncate">
                  Current location
                </h3>
              </div>
            </div>

            {/* Enable Action Button */}
            <button
              type="button"
              id="enable-device-location-btn"
              onClick={handleEnableLocation}
              disabled={gpsLoading}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-b from-[#ff4575] via-[#ff245d] to-[#e0194e] text-white font-bold text-xs sm:text-sm tracking-tight shadow-[0_4px_12px_-2px_rgba(255,36,93,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] border border-rose-400/40 hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-75 flex items-center gap-1.5 min-h-[38px]"
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enabling...</span>
                </>
              ) : (
                <span>Enable</span>
              )}
            </button>
          </div>

          {/* GPS Error message if permission denied */}
          {gpsError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {gpsError}
            </div>
          )}

          {/* Card 2: Saved Addresses From User Account (Shown ONLY if user has saved addresses, with borderless design and less details) */}
          {savedAddresses && savedAddresses.length > 0 && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between px-1 mb-1">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Saved Addresses
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenManualSearch();
                  }}
                  className="text-[11px] sm:text-xs font-bold text-[#ff245d] hover:text-[#d91448] transition-colors cursor-pointer"
                >
                  Manage ({savedAddresses.length})
                </button>
              </div>

              {/* Borderless Address items with less details */}
              <div className="bg-white rounded-2xl p-1 shadow-2xs divide-y divide-slate-100 max-h-[200px] overflow-y-auto no-scrollbar">
                {savedAddresses.map((addr) => {
                  const isSelected = activeAddress?.id === addr.id;
                  const shortAddress = addr.buildingRoad || addr.area?.name || addr.houseName || 'Kolkata';
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 text-left group ${
                        isSelected
                          ? 'bg-slate-100/90 font-medium'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                          {getTagIcon(addr.tag)}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {getTagTitle(addr)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {shortAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Card 3 / Secondary Action: Search location manually Bar */}
          <button
            type="button"
            id="search-location-manually-trigger"
            onClick={() => {
              onClose();
              onOpenManualSearch();
            }}
            className="w-full bg-white border border-slate-200/90 hover:border-slate-400 rounded-2xl p-3 sm:p-3.5 transition-all shadow-2xs hover:shadow-xs flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group min-h-[46px]"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 group-hover:bg-rose-100 text-[#ff245d] flex items-center justify-center shrink-0 transition-colors">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-slate-900 flex-1 truncate">
              Search location manually
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

        </div>
      </div>
    </div>
  );
};
