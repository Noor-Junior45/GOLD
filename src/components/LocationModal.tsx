import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  Crosshair,
  LocateFixed,
  MapPin,
  Check,
  ArrowLeft,
  Home,
  Briefcase,
  Building2,
  Trash2,
  ChevronRight,
  Phone,
  User as UserIcon,
  ZoomIn,
  ZoomOut,
  Navigation,
  Loader2,
  Plus,
  Compass,
  Map as MapIcon
} from 'lucide-react';
import L from 'leaflet';
import { KOLKATA_AREAS } from '../data/kolkataAreas';
import { KolkataArea, SavedAddress, UserProfile } from '../types';
import {
  getStoredAddresses,
  saveAddressToFirestore,
  deleteAddressFromFirestore,
  subscribeToAddresses,
  ACTIVE_SAVED_ADDRESS_KEY
} from '../services/supabaseService';
import { showToast } from '../utils/toast';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentArea: KolkataArea;
  activeAddress?: SavedAddress | null;
  userProfile?: UserProfile | null;
  userPhone?: string | null;
  onSelectArea: (area: KolkataArea, address?: SavedAddress) => void;
}

export interface MapSearchResult {
  id: string;
  name: string;
  secondaryText: string;
  lat?: number;
  lng?: number;
  placeId?: string;
  pincode?: string;
  isMapGeocoded?: boolean;
  source?: string;
}

// Helper function to extract a clean name from email if name is not set
function deriveNameFromEmail(email?: string): string {
  if (!email || !email.includes('@')) return '';
  const username = email.split('@')[0];
  const cleaned = username.replace(/[._-]+/g, ' ').replace(/\d+$/, '').trim();
  if (!cleaned) return username;
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentArea,
  activeAddress,
  userProfile,
  userPhone,
  onSelectArea
}) => {
  // Navigation steps: 'search_home' | 'map_pin' | 'details_form'
  const [step, setStep] = useState<'search_home' | 'map_pin' | 'details_form'>('search_home');
  // Source that opened the map: 'add_saved_address' | 'detect_location'
  const [mapEntrySource, setMapEntrySource] = useState<'add_saved_address' | 'detect_location'>('detect_location');

  // Search & Map States
  const [searchQuery, setSearchQuery] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [isMapDragging, setIsMapDragging] = useState(false);
  const [mapSearchResults, setMapSearchResults] = useState<MapSearchResult[]>([]);
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Map Coordinates & Pin Location
  const [pinCoordinates, setPinCoordinates] = useState<{ lat: number; lng: number }>({
    lat: currentArea.lat || 22.5735,
    lng: currentArea.lng || 88.4331
  });

  const [detectedStreet, setDetectedStreet] = useState<string>(
    currentArea.exactStreet || currentArea.name
  );
  const [matchedArea, setMatchedArea] = useState<KolkataArea>(currentArea);

  // Real Saved Addresses
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => getStoredAddresses());

  // Form Fields for Step 3
  const [houseName, setHouseName] = useState('');
  const [houseFlat, setHouseFlat] = useState('');
  const [buildingRoad, setBuildingRoad] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressTag, setAddressTag] = useState<'home' | 'work' | 'hotel' | 'other'>('home');
  const [customTagLabel, setCustomTagLabel] = useState('');

  // Receiver Name
  const [receiverName, setReceiverName] = useState(() => {
    if (activeAddress?.receiverName) return activeAddress.receiverName;
    if (userProfile?.name && userProfile.name.toLowerCase() !== 'customer') return userProfile.name;
    const emailToUse = userProfile?.email || localStorage.getItem('giriraj_user_email') || '';
    const derived = deriveNameFromEmail(emailToUse);
    if (derived) return derived;
    const stored = localStorage.getItem('giriraj_user_name');
    if (stored && stored.toLowerCase() !== 'customer') return stored;
    return '';
  });

  // Receiver Phone
  const [receiverPhone, setReceiverPhone] = useState(() => {
    if (activeAddress?.receiverPhone) return activeAddress.receiverPhone;
    if (userPhone) return userPhone;
    if (userProfile?.phone) return userProfile.phone;
    const stored = localStorage.getItem('giriraj_user_phone');
    if (stored && stored !== '8777400280') return stored;
    return '';
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Subscribe to real-time addresses
  useEffect(() => {
    const unsub = subscribeToAddresses((list) => {
      setSavedAddresses(list);
    });
    return () => unsub();
  }, []);

  // Reset state and refresh saved addresses whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSavedAddresses(getStoredAddresses());
      setStep('search_home');
      setSearchQuery('');
      setFormError(null);

      // Auto-fill Receiver Name
      if (activeAddress?.receiverName) {
        setReceiverName(activeAddress.receiverName);
      } else if (userProfile?.name && userProfile.name.toLowerCase() !== 'customer') {
        setReceiverName(userProfile.name);
      } else {
        const emailToUse = userProfile?.email || localStorage.getItem('giriraj_user_email') || '';
        const derived = deriveNameFromEmail(emailToUse);
        if (derived) {
          setReceiverName(derived);
        } else {
          const stored = localStorage.getItem('giriraj_user_name');
          if (stored && stored.toLowerCase() !== 'customer') {
            setReceiverName(stored);
          }
        }
      }

      // Auto-fill Receiver Phone
      if (activeAddress?.receiverPhone) {
        setReceiverPhone(activeAddress.receiverPhone);
      } else if (userPhone) {
        setReceiverPhone(userPhone);
      } else if (userProfile?.phone) {
        setReceiverPhone(userProfile.phone);
      } else {
        const storedPhone = localStorage.getItem('giriraj_user_phone');
        if (storedPhone && storedPhone !== '8777400280') {
          setReceiverPhone(storedPhone);
        } else {
          setReceiverPhone('');
        }
      }
    }
  }, [isOpen, activeAddress, userProfile, userPhone]);

  // Leaflet Map initialization for 'map_pin' step
  useEffect(() => {
    if (!isOpen || step !== 'map_pin') return;

    const lat = pinCoordinates.lat || 22.5735;
    const lng = pinCoordinates.lng || 88.4331;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 18,
        minZoom: 13,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      map.on('movestart', () => {
        setIsMapDragging(true);
      });

      map.on('move', () => {
        const center = map.getCenter();
        setPinCoordinates({ lat: center.lat, lng: center.lng });
      });

      map.on('moveend', () => {
        setIsMapDragging(false);
        const center = map.getCenter();
        setPinCoordinates({ lat: center.lat, lng: center.lng });
        resolveNearestHub(center.lat, center.lng);
      });

      mapInstanceRef.current = map;
      
      map.invalidateSize();
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, step]);

  // Resolve nearest Kolkata Hub & exact street
  const resolveNearestHub = async (lat: number, lng: number) => {
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
          const resolvedStreet = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ');

          if (resolvedStreet) {
            setDetectedStreet(resolvedStreet);
            setBuildingRoad(resolvedStreet);
          }

          let closest = KOLKATA_AREAS[0];
          let minDistance = Number.MAX_VALUE;
          KOLKATA_AREAS.forEach((area) => {
            if (area.pincode && postcode && area.pincode === postcode) {
              closest = area;
              minDistance = 0;
            } else if (area.lat && area.lng) {
              const dist = Math.hypot(area.lat - lat, area.lng - lng);
              if (dist < minDistance) {
                minDistance = dist;
                closest = area;
              }
            }
          });
          setMatchedArea(closest);
          return;
        }
      }
    } catch {
      // Fallback
    }

    let closest = KOLKATA_AREAS[0];
    let minDistance = Number.MAX_VALUE;

    KOLKATA_AREAS.forEach((area) => {
      if (area.lat && area.lng) {
        const dist = Math.hypot(area.lat - lat, area.lng - lng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = area;
        }
      }
    });

    setMatchedArea(closest);
    const street = closest.exactStreet || closest.name;
    setDetectedStreet(street);
    setBuildingRoad(street);
  };

  // Fly to target coordinates on map
  const flyToCoords = (lat: number, lng: number, zoom = 18) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  };

  // Instantly apply current location / area
  const handleUseCurrentLocationDirectly = (areaToUse?: KolkataArea, streetToUse?: string) => {
    const area = areaToUse || matchedArea;
    const street = streetToUse || detectedStreet || area.exactStreet || area.name;

    try {
      localStorage.removeItem(ACTIVE_SAVED_ADDRESS_KEY);
      localStorage.setItem('giriraj_active_address', street);
    } catch (e) {
      console.error(e);
    }

    const appliedArea: KolkataArea = {
      ...area,
      exactStreet: street
    };

    onSelectArea(appliedArea, undefined);
    onClose();
  };

  // Trigger GPS Current Location fetch using Geolocation API to auto-populate map view
  const handleDetectCurrentLocation = (goToMap = true) => {
    setMapEntrySource('detect_location');
    setGpsLoading(true);

    if (!navigator.geolocation) {
      setGpsLoading(false);
      const defaultArea = KOLKATA_AREAS[3]; // Sector V
      setPinCoordinates({ lat: defaultArea.lat || 22.5735, lng: defaultArea.lng || 88.4331 });
      setMatchedArea(defaultArea);
      setDetectedStreet(defaultArea.exactStreet || defaultArea.name);
      setBuildingRoad(defaultArea.exactStreet || defaultArea.name);
      if (goToMap) {
        setStep('map_pin');
        setTimeout(() => flyToCoords(defaultArea.lat || 22.5735, defaultArea.lng || 88.4331, 18), 150);
      } else {
        handleUseCurrentLocationDirectly(defaultArea, defaultArea.exactStreet || defaultArea.name);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPinCoordinates({ lat, lng });

        if (goToMap) {
          setStep('map_pin');
          setTimeout(() => flyToCoords(lat, lng, 18), 150);
        }

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
          // fallback
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

        setMatchedArea(matched);
        setDetectedStreet(resolvedStreet);
        setBuildingRoad(resolvedStreet);

        if (!goToMap) {
          handleUseCurrentLocationDirectly(matched, resolvedStreet);
        }
      },
      (err) => {
        console.warn('High precision GPS failed, using standard fallback', err);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGpsLoading(false);
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setPinCoordinates({ lat, lng });
            resolveNearestHub(lat, lng);
            if (goToMap) {
              setStep('map_pin');
              setTimeout(() => flyToCoords(lat, lng, 18), 150);
            } else {
              const fallback = KOLKATA_AREAS[3];
              handleUseCurrentLocationDirectly(fallback, fallback.exactStreet || fallback.name);
            }
          },
          () => {
            setGpsLoading(false);
            const fallback = KOLKATA_AREAS[3];
            setPinCoordinates({ lat: fallback.lat || 22.5735, lng: fallback.lng || 88.4331 });
            setMatchedArea(fallback);
            setDetectedStreet(fallback.exactStreet || fallback.name);
            setBuildingRoad(fallback.exactStreet || fallback.name);
            if (goToMap) {
              setStep('map_pin');
              setTimeout(() => flyToCoords(fallback.lat || 22.5735, fallback.lng || 88.4331, 18), 150);
            } else {
              handleUseCurrentLocationDirectly(fallback, fallback.exactStreet || fallback.name);
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Real-time Google Maps Places / Geocoding Search Effect
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setMapSearchResults([]);
      setIsSearchingMap(false);
      return;
    }

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setIsSearchingMap(true);

    const debounceTimer = setTimeout(async () => {
      try {
        // 1. Fetch from Google Maps Platform Places / Geocoding endpoint
        const response = await fetch(
          `/api/maps/places-autocomplete?input=${encodeURIComponent(q)}`,
          {
            signal: controller.signal
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.results) && data.results.length > 0) {
            setMapSearchResults(data.results);
            setIsSearchingMap(false);
            return;
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Google Maps search error:', err);
        }
      }

      // Local fallback with clean road and area names
      const localMatches: MapSearchResult[] = KOLKATA_AREAS.filter((area) => {
        const lowerQ = q.toLowerCase();
        return (
          area.name.toLowerCase().includes(lowerQ) ||
          area.pincode.includes(lowerQ) ||
          (area.exactStreet && area.exactStreet.toLowerCase().includes(lowerQ))
        );
      }).map((area) => ({
        id: `area-${area.pincode}`,
        name: area.name,
        secondaryText: `Kolkata, West Bengal • PIN ${area.pincode}`,
        lat: area.lat || 22.5735,
        lng: area.lng || 88.4331,
        pincode: area.pincode,
        isMapGeocoded: false
      }));

      setMapSearchResults(localMatches);
      setIsSearchingMap(false);
    }, 250);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchQuery]);

  // Handle selection of a Google Maps search result
  const handleSelectMapSearchResult = async (result: MapSearchResult, openPinMap = true) => {
    let lat = result.lat;
    let lng = result.lng;
    let pin = result.pincode;

    // If Google Maps Place ID exists but coords are not yet present, resolve place details
    if (result.placeId && (!lat || !lng)) {
      try {
        const detRes = await fetch(`/api/maps/place-details?placeId=${encodeURIComponent(result.placeId)}`);
        if (detRes.ok) {
          const detData = await detRes.json();
          if (detData.success && detData.lat && detData.lng) {
            lat = detData.lat;
            lng = detData.lng;
            if (detData.pincode) pin = detData.pincode;
          }
        }
      } catch (err) {
        console.warn('Could not fetch place details:', err);
      }
    }

    const finalLat = lat || 22.5735;
    const finalLng = lng || 88.4331;

    setPinCoordinates({ lat: finalLat, lng: finalLng });

    // Match closest Kolkata service hub
    let closest = KOLKATA_AREAS[0];
    let minDistance = Number.MAX_VALUE;

    KOLKATA_AREAS.forEach((area) => {
      if (pin && area.pincode === pin) {
        closest = area;
        minDistance = 0;
      } else if (area.lat && area.lng) {
        const dist = Math.hypot(area.lat - finalLat, area.lng - finalLng);
        if (dist < minDistance) {
          minDistance = dist;
          closest = area;
        }
      }
    });

    const street = result.name || closest.exactStreet || closest.name;
    const updatedArea: KolkataArea = {
      ...closest,
      exactStreet: street
    };

    setMatchedArea(updatedArea);
    setDetectedStreet(street);
    setBuildingRoad(street);

    if (openPinMap) {
      setMapEntrySource('detect_location');
      setStep('map_pin');
      setTimeout(() => {
        flyToCoords(finalLat, finalLng, 18);
      }, 150);
    } else {
      handleUseCurrentLocationDirectly(updatedArea, street);
    }
  };

  // Open map to pinpoint arbitrary area
  const handleOpenPinOnMap = (area: KolkataArea) => {
    setMapEntrySource('detect_location');
    setMatchedArea(area);
    setDetectedStreet(area.exactStreet || area.name);
    setBuildingRoad(area.exactStreet || area.name);
    if (area.lat && area.lng) {
      setPinCoordinates({ lat: area.lat, lng: area.lng });
    }
    setStep('map_pin');
    setTimeout(() => {
      if (area.lat && area.lng) {
        flyToCoords(area.lat, area.lng, 18);
      }
    }, 150);
  };

  // Proceed to address details
  const handleProceedToDetails = () => {
    setBuildingRoad(detectedStreet || matchedArea.exactStreet || matchedArea.name);
    setFormError(null);
    setStep('details_form');
  };

  // Select an existing saved address
  const handleSelectSavedAddress = (saved: SavedAddress) => {
    try {
      localStorage.setItem(ACTIVE_SAVED_ADDRESS_KEY, JSON.stringify(saved));
      localStorage.setItem('giriraj_active_address', `${saved.houseFlat}, ${saved.houseName}`);
      if (saved.landmark) {
        localStorage.setItem('giriraj_active_landmark', saved.landmark);
      }
    } catch (e) {
      console.error(e);
    }

    onSelectArea(saved.area, saved);
    onClose();
  };

  // Delete saved address
  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteAddressFromFirestore(id);
      showToast('Address removed', 'info');
    } catch {
      showToast('Address removed locally', 'info');
    }
  };

  // Save address form
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName.trim()) {
      setFormError('Please enter House / Apartment / Building Name');
      return;
    }
    if (!houseFlat.trim()) {
      setFormError('Please enter Flat / Floor / House Number');
      return;
    }

    const formatted = `${houseFlat.trim()}, ${houseName.trim()}, ${buildingRoad.trim()}, ${matchedArea.name} (PIN ${matchedArea.pincode})`;

    const newAddress: SavedAddress = {
      id: `addr-${Date.now()}`,
      tag: addressTag,
      tagLabel: addressTag === 'other' && customTagLabel.trim() ? customTagLabel.trim() : undefined,
      houseName: houseName.trim(),
      houseFlat: houseFlat.trim(),
      buildingRoad: buildingRoad.trim() || matchedArea.name,
      landmark: landmark.trim() || undefined,
      formattedExactAddress: formatted,
      area: matchedArea,
      lat: pinCoordinates.lat,
      lng: pinCoordinates.lng,
      receiverName: receiverName.trim() || undefined,
      receiverPhone: receiverPhone.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await saveAddressToFirestore(newAddress);
      if (res.success) {
        showToast('Address saved and synced successfully!', 'success');
      } else {
        showToast('Address saved locally. Cloud sync queued.', 'info');
      }
    } catch {
      showToast('Address saved locally.', 'info');
    }

    try {
      localStorage.setItem('giriraj_active_address', `${newAddress.houseFlat}, ${newAddress.houseName}`);
      if (newAddress.landmark) {
        localStorage.setItem('giriraj_active_landmark', newAddress.landmark);
      }
    } catch (err) {
      console.error(err);
    }

    onSelectArea(matchedArea, newAddress);
    onClose();
  };

  const getTagIcon = (tag: SavedAddress['tag']) => {
    switch (tag) {
      case 'home':
        return <Home className="w-4 h-4 text-slate-700" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-slate-700" />;
      case 'hotel':
        return <Building2 className="w-4 h-4 text-slate-700" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-700" />;
    }
  };

  const getTagLabel = (addr: SavedAddress) => {
    if (addr.tag === 'home') return 'Home';
    if (addr.tag === 'work') return 'Work';
    if (addr.tag === 'hotel') return 'Hotel';
    return addr.tagLabel || 'Other';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0 -z-10 cursor-pointer"
        onClick={onClose}
        aria-label="Close modal background"
      />

      {/* Left-side Drawer Panel */}
      <div 
        id="location-drawer-panel"
        className="w-full max-w-[420px] sm:w-[420px] md:w-[440px] h-full bg-[#f4f4f5] shadow-2xl flex flex-col overflow-hidden border-r border-slate-300 animate-in slide-in-from-left duration-300 z-10"
      >
        
        {/* ================= STEP 1: CLEAN LEFT DRAWER SEARCH ================= */}
        {step === 'search_home' && (
          <div className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto no-scrollbar">
            
            {/* Top Close Button (Clean Left X Icon as in reference image) */}
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                id="location-drawer-close-btn"
                onClick={onClose}
                className="text-slate-800 hover:text-black p-1 -ml-1 rounded-md hover:bg-slate-200/70 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-6 h-6 stroke-[2]" />
              </button>
            </div>

            {/* Search Input Box with Map connection */}
            <div className="relative mb-4">
              <div className="flex items-center bg-white border border-slate-300 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 transition-all px-3.5 py-3 shadow-2xs rounded-lg">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                <input
                  type="text"
                  id="location-search-input"
                  placeholder="Search with Google Maps (street, area, PIN)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                {isSearchingMap ? (
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0 ml-2" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-700 font-semibold px-1 py-0.5 ml-2 cursor-pointer"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {/* Real-time Google Maps Places / Geocoded Search Results */}
            {searchQuery.trim() ? (
              <div className="flex-1 flex flex-col bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden mb-4">
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-slate-800">
                    <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                    Google Maps Locations
                  </span>
                  {isSearchingMap ? (
                    <span className="text-emerald-700 font-normal normal-case flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Searching Google Maps...
                    </span>
                  ) : (
                    <span className="text-[10px] font-normal normal-case text-slate-400">
                      Google Maps Platform
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {mapSearchResults.length > 0 ? (
                    mapSearchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleSelectMapSearchResult(result, true)}
                        className="w-full p-3.5 text-left hover:bg-slate-50 flex items-center justify-between group cursor-pointer transition-colors"
                      >
                        <div className="flex items-start gap-3 truncate text-left">
                          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div className="truncate">
                            <div className="text-sm font-semibold text-slate-900 group-hover:text-black truncate">
                              {result.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 truncate">
                              {result.secondaryText}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 group-hover:bg-emerald-100 px-2 py-1 rounded transition-colors flex items-center gap-1">
                            <Crosshair className="w-3 h-3" />
                            Select
                          </span>
                        </div>
                      </div>
                    ))
                  ) : !isSearchingMap ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No exact area found</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Try searching with a landmark, main road or PIN code
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {/* Clean, Animated "Detect Location" Button */}
                <div 
                  id="detect-my-current-location-btn"
                  onClick={() => handleDetectCurrentLocation(true)}
                  className="relative overflow-hidden bg-white border border-slate-200 hover:border-slate-900 rounded-xl p-3.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group flex items-center justify-between"
                  title="Detect my current location using GPS"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shrink-0">
                      {/* Radar pulse ping ring */}
                      <span className="absolute inset-0 rounded-lg bg-blue-400/30 animate-ping opacity-60 group-hover:opacity-100" />
                      <span className="absolute -inset-1 rounded-xl bg-blue-500/10 animate-pulse" />
                      {gpsLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                      ) : (
                        <LocateFixed className="w-4 h-4 stroke-[2.2] relative z-10 group-hover:scale-110 transition-transform duration-200" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-black tracking-tight truncate">
                        {gpsLoading ? 'Detecting Location...' : 'Detect Location'}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider group-hover:bg-blue-100 transition-colors shrink-0">
                        GPS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-slate-400 group-hover:text-slate-900 transition-colors shrink-0 pl-2">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </div>

                {/* Add Address Action Button */}
                <div
                  id="add-saved-address-btn"
                  onClick={() => {
                    setMapEntrySource('add_saved_address');
                    setStep('map_pin');
                  }}
                  className="mt-2.5 bg-white border border-slate-200 hover:border-slate-900 rounded-xl p-3.5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group flex items-center justify-between"
                  title="Add new address"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white group-hover:bg-black transition-colors duration-200 shrink-0">
                      <Plus className="w-4 h-4 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-black tracking-tight truncate">
                      Add Address
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform duration-200 shrink-0" />
                </div>

                {/* Saved Addresses Section (Clean, without demo or popular tags) */}
                {savedAddresses.length > 0 && (
                  <div className="mt-8 space-y-3">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-0.5">
                      Saved Addresses
                    </div>

                    <div className="space-y-2.5">
                      {savedAddresses.map((addr) => {
                        const isSelected = activeAddress?.id === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-3.5 bg-white border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isSelected
                                ? 'border-slate-800 ring-1 ring-slate-800 shadow-2xs'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start gap-3 overflow-hidden">
                              <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                {getTagIcon(addr.tag)}
                              </div>
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 truncate">
                                    {addr.houseName}
                                  </span>
                                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5">
                                    {getTagLabel(addr)}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-600 truncate mt-0.5">
                                  {addr.houseFlat}, {addr.buildingRoad}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {addr.area.name} • {addr.area.pincode}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 self-center">
                              <button
                                type="button"
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ================= STEP 2: INTERACTIVE MAP PIN (In-Drawer) ================= */}
        {step === 'map_pin' && (
          <div className="flex-1 flex flex-col relative overflow-hidden bg-white">
            
            {/* Top Bar with Back Button */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('search_home')}
                  className="p-1.5 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                  title="Back to search"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                    Set Delivery Location
                  </h3>
                  <p className="text-xs text-slate-500">
                    Drag map to position pin at your exact doorstep
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Map Canvas */}
            <div className="flex-1 w-full min-h-[300px] relative">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Floating Top Quick GPS Action: Detect My Current Location */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-[90%] flex justify-center">
                <button
                  type="button"
                  id="map-detect-current-location-pill"
                  onClick={() => handleDetectCurrentLocation(true)}
                  className="bg-white/95 hover:bg-white text-slate-900 border border-slate-300 shadow-md px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:border-slate-800 transition-all cursor-pointer backdrop-blur-sm active:scale-95"
                  title="Auto-populate map to your GPS location"
                >
                  {gpsLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                  ) : (
                    <LocateFixed className="w-3.5 h-3.5 text-slate-900" />
                  )}
                  <span>{gpsLoading ? 'Detecting Location...' : 'Detect My Current Location'}</span>
                </button>
              </div>

              {/* Center Map Pin */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-[950]">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`bg-slate-900 text-white px-3 py-1 rounded-full shadow-xl text-[11px] font-bold flex items-center gap-1.5 transition-all duration-200 ${
                      isMapDragging ? '-translate-y-2 opacity-90 scale-95' : 'translate-y-0 opacity-100 scale-100'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                    <span>Deliver here</span>
                  </div>

                  <div
                    className={`mt-1 transition-all duration-200 flex flex-col items-center ${
                      isMapDragging ? '-translate-y-2 scale-110' : 'translate-y-0 scale-100'
                    }`}
                  >
                    <svg width="36" height="44" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20 0C8.954 0 0 8.954 0 20C0 34.5 20 48 20 48C20 48 40 34.5 40 20C40 8.954 31.046 0 20 0Z"
                        fill="#0f172a"
                      />
                      <circle cx="20" cy="18" r="7.5" fill="#FFFFFF" />
                      <circle cx="20" cy="18" r="3.5" fill="#0f172a" />
                    </svg>
                  </div>

                  <div
                    className={`w-3.5 h-1.5 rounded-full bg-black/40 blur-[1px] transition-all duration-200 ${
                      isMapDragging ? 'scale-50 opacity-20' : 'scale-100 opacity-80'
                    }`}
                  />
                </div>
              </div>

              {/* Floating Controls: Locate Me & Zoom */}
              <div className="absolute bottom-4 right-3.5 z-[1000] flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleDetectCurrentLocation(true)}
                  className="w-10 h-10 bg-white border border-slate-200 text-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                  title="Detect My Current Location (GPS)"
                >
                  <LocateFixed className={`w-4 h-4 text-slate-900 ${gpsLoading ? 'animate-spin' : ''}`} />
                </button>

                <div className="bg-white border border-slate-200 shadow-lg flex flex-col">
                  <button
                    type="button"
                    onClick={() => mapInstanceRef.current?.zoomIn()}
                    className="w-9 h-8 flex items-center justify-center hover:bg-slate-50 border-b border-slate-100 text-slate-700 cursor-pointer"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mapInstanceRef.current?.zoomOut()}
                    className="w-9 h-8 flex items-center justify-center hover:bg-slate-50 text-slate-700 cursor-pointer"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Pin Summary & Confirm Button */}
            <div className="bg-white border-t border-slate-200 p-4 sm:p-5 z-[1000] shadow-xl shrink-0 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="overflow-hidden flex-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Selected Location
                  </span>
                  <div className="text-sm font-bold text-slate-900 truncate">
                    {detectedStreet || matchedArea.name}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {matchedArea.name} • PIN {matchedArea.pincode}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  id="confirm-pin-proceed-details-btn"
                  onClick={handleProceedToDetails}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold text-sm tracking-tight flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-[0.99]"
                >
                  <span>CONFIRM LOCATION &amp; ENTER DETAILS</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {mapEntrySource !== 'add_saved_address' && (
                  <button
                    type="button"
                    id="quick-confirm-location-btn"
                    onClick={() => handleUseCurrentLocationDirectly()}
                    className="w-full py-2.5 px-3 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-slate-50"
                  >
                    <Check className="w-3.5 h-3.5 text-slate-600" />
                    <span>Quick Deliver to Selected Area</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ================= STEP 3: HOUSE & ADDRESS DETAILS FORM ================= */}
        {step === 'details_form' && (
          <form onSubmit={handleSaveAddress} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 no-scrollbar bg-white">
            
            {/* Top Bar with Back Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('map_pin')}
                  className="p-1 -ml-1 text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                  title="Back to map"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-base font-bold text-slate-900">
                  Enter Complete Address
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Locality Pill */}
            <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {detectedStreet || matchedArea.name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    PIN {matchedArea.pincode}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('map_pin')}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-black bg-white border border-slate-300 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
              >
                Change Pin
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* 1. House / Society Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                House / Society / Apartment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Greenfield Heights / Shanti Niwas"
                value={houseName}
                onChange={(e) => {
                  setHouseName(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 bg-white"
              />
            </div>

            {/* 2. Flat / Floor / House Number */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Flat / House / Floor No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Flat 4B, 3rd Floor"
                value={houseFlat}
                onChange={(e) => {
                  setHouseFlat(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 bg-white"
              />
            </div>

            {/* 3. Area / Road / Street Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Street / Area / Sector <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. EP Block, Street No. 12"
                value={buildingRoad}
                onChange={(e) => {
                  setBuildingRoad(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 bg-white"
              />
            </div>

            {/* 4. Directions / Landmark */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Landmark <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Opposite RDB Cinema"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 bg-white"
              />
            </div>

            {/* 5. Save Address As Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Save Address As
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { tag: 'home', label: 'Home', icon: Home },
                  { tag: 'work', label: 'Work', icon: Briefcase },
                  { tag: 'hotel', label: 'Hotel', icon: Building2 },
                  { tag: 'other', label: 'Other', icon: MapPin }
                ].map(({ tag, label, icon: Icon }) => {
                  const isSelected = addressTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddressTag(tag as SavedAddress['tag'])}
                      className={`py-2 px-1 border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>

              {addressTag === 'other' && (
                <input
                  type="text"
                  placeholder="e.g. Site Office, Factory"
                  value={customTagLabel}
                  onChange={(e) => setCustomTagLabel(e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                />
              )}
            </div>

            {/* 6. Receiver Details */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Receiver Contact Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="address-receiver-name-input"
                    type="text"
                    placeholder="Receiver Name"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>

                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="address-receiver-phone-input"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold text-sm tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>SAVE &amp; DELIVER HERE</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
