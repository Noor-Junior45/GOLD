import L from 'leaflet';
import { IMapProvider, IMapInstance, MapCoordinates, MapInitOptions, MapSearchResult, ReverseGeocodeResult } from './types';
import { API_BASE_URL } from '../../lib/apiBase';

export class GoogleMapsProvider implements IMapProvider {
  readonly name = 'google' as const;

  private getApiKey(): string {
    const key = (
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      ''
    ).trim();
    if (!key || key === 'YOUR_API_KEY') {
      return '';
    }
    return key;
  }

  isAvailable(): boolean {
    return Boolean(this.getApiKey());
  }

  async initialize(container: HTMLElement, options: MapInitOptions): Promise<IMapInstance> {
    // High-performance Leaflet container configured with crisp, reliable street tiles
    container.innerHTML = '';

    const map = L.map(container, {
      center: [options.center.lat, options.center.lng],
      zoom: options.zoom || 18,
      minZoom: options.minZoom || 11,
      maxZoom: options.maxZoom || 19,
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Voyager tiles (Google Maps-matched clean styling)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    if (options.onMoveStart) {
      map.on('movestart', () => options.onMoveStart?.());
    }

    if (options.onMove) {
      map.on('move', () => {
        const c = map.getCenter();
        options.onMove?.({ lat: c.lat, lng: c.lng });
      });
    }

    if (options.onMoveEnd) {
      map.on('moveend', () => {
        const c = map.getCenter();
        options.onMoveEnd?.({ lat: c.lat, lng: c.lng });
      });
    }

    const instance: IMapInstance = {
      setCenter: (coords: MapCoordinates) => {
        map.setView([coords.lat, coords.lng]);
      },
      getCenter: (): MapCoordinates => {
        const c = map.getCenter();
        return { lat: c.lat, lng: c.lng };
      },
      flyTo: (coords: MapCoordinates, zoom = 18) => {
        map.flyTo([coords.lat, coords.lng], zoom, {
          duration: 1.0,
          easeLinearity: 0.25
        });
      },
      zoomIn: () => {
        map.zoomIn();
      },
      zoomOut: () => {
        map.zoomOut();
      },
      invalidateSize: () => {
        map.invalidateSize();
      },
      destroy: () => {
        map.remove();
      }
    };

    return instance;
  }

  async searchPlaces(query: string): Promise<MapSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/api/maps/places-autocomplete?input=${encodeURIComponent(q)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map((r: any) => ({
            id: r.id || `google-${Math.random().toString(36).substring(2, 8)}`,
            name: r.name,
            secondaryText: r.secondaryText || 'Kolkata, West Bengal',
            lat: r.lat,
            lng: r.lng,
            placeId: r.placeId,
            pincode: r.pincode,
            isMapGeocoded: true,
            provider: 'google' as const
          }));
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsProvider] searchPlaces error:', err);
    }

    throw new Error('Google Places search produced no results');
  }

  async reverseGeocode(coords: MapCoordinates): Promise<ReverseGeocodeResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/maps/google/rev-geocode?lat=${coords.lat}&lng=${coords.lng}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.result) {
          const r = data.result;
          return {
            formattedAddress: r.formattedAddress || r.street || 'Kolkata',
            street: r.street || r.formattedAddress || 'Kolkata',
            locality: r.locality || 'Kolkata',
            suburb: r.suburb,
            city: r.city || 'Kolkata',
            state: r.state || 'West Bengal',
            pincode: r.pincode || '700001',
            lat: coords.lat,
            lng: coords.lng,
            provider: 'google' as const
          };
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsProvider] reverseGeocode proxy error:', err);
    }

    // Fallback geocoding via Nominatim
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
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
          const resolvedStreet = parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(', ') || 'Kolkata';

          return {
            formattedAddress: data.display_name || resolvedStreet,
            street: resolvedStreet,
            locality: suburb || addr.city || 'Kolkata',
            suburb: suburb,
            city: addr.city || addr.state_district || 'Kolkata',
            state: addr.state || 'West Bengal',
            pincode: postcode || '700001',
            lat: coords.lat,
            lng: coords.lng,
            provider: 'google' as const
          };
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsProvider] fallback reverse geocode failed:', err);
    }

    throw new Error('Google reverse geocoding unavailable');
  }

  async getPlaceDetails(placeId: string): Promise<{
    lat: number;
    lng: number;
    name?: string;
    formattedAddress?: string;
    pincode?: string;
  } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maps/place-details?placeId=${encodeURIComponent(placeId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.lat && data.lng) {
          return {
            lat: data.lat,
            lng: data.lng,
            name: data.name,
            formattedAddress: data.formattedAddress,
            pincode: data.pincode
          };
        }
      }
    } catch (err) {
      console.warn('[GoogleMapsProvider] getPlaceDetails error:', err);
    }
    return null;
  }
}
