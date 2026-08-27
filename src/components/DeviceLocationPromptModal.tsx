import React, { useState } from 'react';
import {
  X,
  MapPin,
  MapPinOff,
  Search,
  Home,
  Briefcase,
  Building2,
  ChevronRight,
  Loader2,
  Compass,
  Check
} from 'lucide-react';
import { KolkataArea, SavedAddress } from '../types';
import { KOLKATA_AREAS } from '../data/kolkataAreas';
import { ACTIVE_SAVED_ADDRESS_KEY } from '../services/supabaseService';

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
  currentArea,
  activeAddress,
  onSelectArea,
  onOpenManualSearch
}) => {
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

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

  const handleSelectQuickArea = (area: KolkataArea) => {
    try {
      localStorage.removeItem(ACTIVE_SAVED_ADDRESS_KEY);
      localStorage.setItem('giriraj_active_address', area.exactStreet || area.name);
    } catch (e) {
      console.error(e);
    }

    onSelectArea(area, undefined);
    onClose();
  };

  const getTagIcon = (tag: SavedAddress['tag']) => {
    switch (tag) {
      case 'home':
        return <Home className="w-4 h-4 text-slate-800" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-slate-800" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-slate-800" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-800" />;
    }
  };

  const getTagTitle = (addr: SavedAddress) => {
    if (addr.tag === 'home') return 'Home';
    if (addr.tag === 'work') return 'Work';
    if (addr.tag === 'hotel') return 'Hotel';
    return addr.tagLabel || 'Saved Location';
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end items-center bg-black/65 backdrop-blur-[3px] transition-opacity animate-in fade-in duration-200 p-0 sm:p-4">
      {/* Backdrop click to dismiss */}
      <div
        className="absolute inset-0 -z-10 cursor-pointer"
        onClick={onClose}
        aria-label="Dismiss location prompt"
      />

      {/* Floating Circular Close Button (as shown in reference image) */}
      <button
        type="button"
        onClick={onClose}
        className="mb-3 w-10 h-10 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
        title="Close"
      >
        <X className="w-5 h-5 stroke-[2.5]" />
      </button>

      {/* Bottom Sheet Container */}
      <div
        id="device-location-prompt-sheet"
        className="w-full max-w-lg bg-[#f8fafc] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[85vh] text-slate-900"
      >
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto no-scrollbar">
          
          {/* Card 1: Device location not enabled */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Location Pin with disabled badge */}
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 shrink-0">
                <div className="relative">
                  <MapPin className="w-6 h-6 text-rose-500 fill-rose-500/20 stroke-[2.2]" />
                  <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 ring-2 ring-white">
                    <MapPinOff className="w-2 h-2 text-white stroke-[3]" />
                  </span>
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug truncate">
                  Device location not enabled
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 leading-normal mt-0.5">
                  Enable your device location for a better delivery experience
                </p>
              </div>
            </div>

            {/* Enable Action Button */}
            <button
              type="button"
              id="enable-device-location-btn"
              onClick={handleEnableLocation}
              disabled={gpsLoading}
              className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#ff3269] hover:bg-[#e0285a] active:bg-[#c9204e] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0 disabled:opacity-75 flex items-center gap-1.5 active:scale-95"
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

          {/* Card 2: Select a saved address */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                {savedAddresses.length > 0 ? 'Select a saved address' : 'Quick select delivery area'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenManualSearch();
                }}
                className="text-xs font-bold text-[#ff3269] hover:text-[#e0285a] transition-colors cursor-pointer"
              >
                {savedAddresses.length > 0 ? 'See all' : 'Explore all'}
              </button>
            </div>

            {/* Address items */}
            {savedAddresses.length > 0 ? (
              <div className="space-y-2">
                {savedAddresses.slice(0, 3).map((addr) => {
                  const isSelected = activeAddress?.id === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectAddress(addr)}
                      className={`w-full p-3.5 bg-white rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs group ${
                        isSelected
                          ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50/50'
                          : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 transition-colors">
                          {getTagIcon(addr.tag)}
                        </div>
                        <div className="overflow-hidden text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {getTagTitle(addr)}
                            </span>
                            {addr.houseName && (
                              <span className="text-[11px] font-semibold text-slate-500 truncate">
                                • {addr.houseName}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {addr.houseFlat ? `${addr.houseFlat}, ` : ''}
                            {addr.buildingRoad || addr.area.name}
                            {addr.landmark ? `, Near ${addr.landmark}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {KOLKATA_AREAS.slice(0, 4).map((area) => (
                  <button
                    key={area.pincode}
                    type="button"
                    onClick={() => handleSelectQuickArea(area)}
                    className="p-3 bg-white border border-slate-200 hover:border-slate-800 rounded-xl text-left transition-all group cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 group-hover:text-black truncate">
                      <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{area.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      PIN {area.pincode} • 60-Min Hub
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Search location manually Bar */}
          <button
            type="button"
            id="search-location-manually-trigger"
            onClick={() => {
              onClose();
              onOpenManualSearch();
            }}
            className="w-full bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-3.5 transition-all shadow-2xs hover:shadow-xs flex items-center gap-3 text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 group-hover:bg-rose-100 text-[#ff3269] flex items-center justify-center shrink-0 transition-colors">
              <Search className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-600 group-hover:text-slate-900 flex-1">
              Search location manually
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

        </div>
      </div>
    </div>
  );
};
