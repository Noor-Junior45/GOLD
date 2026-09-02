import { KolkataArea } from '../types';
import { KOLKATA_AREAS } from '../data/kolkataAreas';

export interface ResilientPosition {
  lat: number;
  lng: number;
  accuracy?: number;
  isFallback?: boolean;
}

export interface GeolocationResult {
  success: boolean;
  coords: {
    lat: number;
    lng: number;
  };
  resolvedStreet?: string;
  matchedArea: KolkataArea;
  error?: string;
  isPermissionDenied?: boolean;
}

/**
 * Finds the closest predefined Kolkata Area to given coordinates
 */
export function findNearestKolkataArea(lat: number, lng: number, pincode?: string): KolkataArea {
  if (pincode) {
    const pinMatch = KOLKATA_AREAS.find((a) => a.pincode && a.pincode === pincode);
    if (pinMatch) return pinMatch;
  }

  let minDistance = Number.MAX_VALUE;
  let closest = KOLKATA_AREAS[0];

  for (const area of KOLKATA_AREAS) {
    if (area.lat && area.lng) {
      const dist = Math.hypot(area.lat - lat, area.lng - lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = area;
      }
    }
  }

  return closest;
}

/**
 * Safely fetches reverse geocoded street name with timeout and instant fallback
 */
export async function reverseGeocodeWithFallback(
  lat: number,
  lng: number,
  timeoutMs = 4000
): Promise<{ street: string; pincode?: string; matchedArea: KolkataArea }> {
  const matchedArea = findNearestKolkataArea(lat, lng);
  let resolvedStreet = matchedArea.exactStreet || matchedArea.name;
  let pincode: string | undefined = matchedArea.pincode;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.street || addr.pedestrian || addr.footway || '';
        const suburb =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.quarter ||
          addr.city_district ||
          '';
        const building = addr.building || addr.amenity || addr.shop || '';
        pincode = addr.postcode || pincode;

        const parts = [building, road, suburb].filter(Boolean);
        if (parts.length > 0) {
          resolvedStreet = parts.join(', ');
        } else if (data.display_name) {
          resolvedStreet = data.display_name.split(',').slice(0, 3).join(', ');
        }
      }
    }
  } catch (err) {
    // Graceful fallback to nearest area
    console.debug('Reverse geocoding network notice (fallback used):', err);
  }

  const finalMatched = findNearestKolkataArea(lat, lng, pincode);

  return {
    street: resolvedStreet,
    pincode,
    matchedArea: finalMatched
  };
}

/**
 * Multi-Tier Resilient Geolocation Resolver for Android WebViews, PWAs & Mobile Browsers
 *
 * Tier 1: High accuracy GPS with 6s timeout & cached allowance
 * Tier 2: Network / Coarse cellular location fallback
 * Tier 3: watchPosition listener fallback (handles Android WebView getCurrentPosition stall)
 */
export async function getResilientCurrentPosition(): Promise<ResilientPosition> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by this device or browser.');
  }

  // Helper to wrap getCurrentPosition into a promise
  const tryPosition = (options: PositionOptions): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Helper using watchPosition as a fallback (often resolves instantly on Android WebViews)
  const tryWatchPosition = (timeoutMs = 6000): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      let watchId: number | null = null;
      const timeoutId = setTimeout(() => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        reject(new Error('WatchPosition timed out'));
      }, timeoutMs);

      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          clearTimeout(timeoutId);
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }
          resolve(pos);
        },
        (err) => {
          clearTimeout(timeoutId);
          if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
          }
          reject(err);
        },
        { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 300000 }
      );
    });
  };

  let lastError: any = null;

  // 1. First attempt: High Accuracy (GPS hardware) with moderate timeout and recent cache support
  try {
    const pos = await tryPosition({
      enableHighAccuracy: true,
      timeout: 6000,
      maximumAge: 60000 // Accept location cached in the last 60 seconds
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
  } catch (err: any) {
    lastError = err;
    // If user explicitly denied permission (code 1), do not retry further
    if (err && err.code === 1) {
      const error = new Error('Location permission was denied. Please allow location access in your device settings.');
      (error as any).code = 1;
      throw error;
    }
  }

  // 2. Second attempt: Coarse/Network/WiFi location (much faster & works indoors)
  try {
    const pos = await tryPosition({
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000 // Accept up to 5 minute old network fix
    });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
  } catch (err: any) {
    lastError = err;
    if (err && err.code === 1) {
      const error = new Error('Location permission was denied. Please allow location access in your device settings.');
      (error as any).code = 1;
      throw error;
    }
  }

  // 3. Third attempt: WatchPosition fallback for Android WebViews
  try {
    const pos = await tryWatchPosition(6000);
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy
    };
  } catch (err: any) {
    lastError = err;
  }

  // If all attempts failed
  const finalError = new Error(
    lastError?.message ||
      'Unable to retrieve current location. Please check your device GPS or select your area manually.'
  );
  (finalError as any).code = lastError?.code;
  throw finalError;
}
