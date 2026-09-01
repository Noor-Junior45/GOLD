import { IMapProvider, IMapInstance, MapCoordinates, MapInitOptions, MapSearchResult, ReverseGeocodeResult } from './types';
import { API_BASE_URL } from '../../lib/apiBase';

declare global {
  interface Window {
    mappls?: any;
    MapmyIndia?: any;
  }
}

let mapplsScriptPromise: Promise<boolean> | null = null;
let mapplsLoadFailed = false;

export function resetMapplsScriptState(): void {
  mapplsLoadFailed = false;
  mapplsScriptPromise = null;
  try {
    const existing = document.getElementById('mappls-web-sdk-script');
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }
  } catch (e) {
    console.warn('[MapplsProvider] Error removing script during reset:', e);
  }
}

function loadMapplsScript(mapKey: string): Promise<boolean> {
  if (mapplsLoadFailed) {
    return Promise.resolve(false);
  }

  if (window.mappls && window.mappls.Map) {
    return Promise.resolve(true);
  }

  if (mapplsScriptPromise) {
    return mapplsScriptPromise;
  }

  mapplsScriptPromise = new Promise<boolean>((resolve) => {
    try {
      const existingScript = document.getElementById('mappls-web-sdk-script');
      if (existingScript) {
        if (window.mappls && window.mappls.Map) {
          resolve(true);
          return;
        }
        existingScript.addEventListener('load', () => {
          const ok = Boolean(window.mappls && window.mappls.Map);
          if (!ok) mapplsLoadFailed = true;
          resolve(ok);
        });
        existingScript.addEventListener('error', () => {
          mapplsLoadFailed = true;
          resolve(false);
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'mappls-web-sdk-script';
      script.src = `https://apis.mappls.com/advancedmaps/api/${encodeURIComponent(mapKey)}/map_sdk?layer=raster&v=3.0`;
      script.async = true;
      script.defer = true;

      const timeout = setTimeout(() => {
        console.warn('[MapplsProvider] Script loading timed out after 2.5 seconds');
        mapplsLoadFailed = true;
        resolve(false);
      }, 2500);

      script.onload = () => {
        clearTimeout(timeout);
        const isReady = Boolean(window.mappls && window.mappls.Map);
        if (!isReady) {
          mapplsLoadFailed = true;
        }
        resolve(isReady);
      };

      script.onerror = (e) => {
        clearTimeout(timeout);
        console.warn('[MapplsProvider] Failed to load Mappls Web Maps SDK script:', e);
        mapplsLoadFailed = true;
        resolve(false);
      };

      document.head.appendChild(script);
    } catch (err) {
      console.warn('[MapplsProvider] Error injecting script:', err);
      mapplsLoadFailed = true;
      resolve(false);
    }
  });

  return mapplsScriptPromise;
}

export class MapplsProvider implements IMapProvider {
  readonly name = 'mappls' as const;

  private getMapKey(): string {
    const key = (
      import.meta.env.VITE_MAPPLS_MAP_KEY ||
      ''
    ).trim();
    if (!key || key === 'YOUR_MAPPLS_MAP_KEY' || key === 'YOUR_STATIC_KEY') {
      return '';
    }
    return key;
  }

  hasKey(): boolean {
    return Boolean(this.getMapKey());
  }

  resetState(): void {
    resetMapplsScriptState();
  }

  isAvailable(): boolean {
    if (mapplsLoadFailed) return false;
    return Boolean(this.getMapKey());
  }

  async initialize(container: HTMLElement, options: MapInitOptions): Promise<IMapInstance> {
    const key = this.getMapKey();
    if (!key) {
      throw new Error('Mappls Static Map Key is not configured (VITE_MAPPLS_MAP_KEY).');
    }

    const loaded = await loadMapplsScript(key);
    if (!loaded || !window.mappls || !window.mappls.Map) {
      throw new Error('Mappls Web Maps SDK failed to load from server.');
    }

    // Ensure container is empty before initializing
    container.innerHTML = '';

    const centerCoords = [options.center.lat, options.center.lng];
    const map = new window.mappls.Map(container, {
      center: centerCoords,
      zoom: options.zoom || 18,
      minZoom: options.minZoom || 11,
      maxZoom: options.maxZoom || 19,
      zoomControl: false,
      hybrid: false,
      attributionControl: false
    });

    if (options.onMoveStart) {
      map.on('movestart', () => options.onMoveStart?.());
    }

    if (options.onMove) {
      map.on('move', () => {
        try {
          const center = map.getCenter();
          if (center) {
            const lat = typeof center.lat === 'function' ? center.lat() : center.lat || center[0];
            const lng = typeof center.lng === 'function' ? center.lng() : center.lng || center[1];
            options.onMove?.({ lat, lng });
          }
        } catch {
          // Ignore transient map read errors
        }
      });
    }

    if (options.onMoveEnd) {
      map.on('moveend', () => {
        try {
          const center = map.getCenter();
          if (center) {
            const lat = typeof center.lat === 'function' ? center.lat() : center.lat || center[0];
            const lng = typeof center.lng === 'function' ? center.lng() : center.lng || center[1];
            options.onMoveEnd?.({ lat, lng });
          }
        } catch {
          // Ignore transient map read errors
        }
      });
    }

    const instance: IMapInstance = {
      setCenter: (coords: MapCoordinates) => {
        try {
          if (map.setCenter) {
            map.setCenter([coords.lat, coords.lng]);
          } else if (map.panTo) {
            map.panTo([coords.lat, coords.lng]);
          }
        } catch (e) {
          console.warn('[MapplsInstance] setCenter error:', e);
        }
      },

      getCenter: (): MapCoordinates => {
        try {
          const c = map.getCenter();
          if (c) {
            const lat = typeof c.lat === 'function' ? c.lat() : c.lat || c[0] || options.center.lat;
            const lng = typeof c.lng === 'function' ? c.lng() : c.lng || c[1] || options.center.lng;
            return { lat, lng };
          }
        } catch {
          // Fallback to default
        }
        return options.center;
      },

      flyTo: (coords: MapCoordinates, zoom = 18) => {
        try {
          if (map.flyTo) {
            map.flyTo({ center: [coords.lat, coords.lng], zoom, duration: 1000 });
          } else if (map.panTo) {
            map.panTo([coords.lat, coords.lng]);
            if (map.setZoom) map.setZoom(zoom);
          }
        } catch {
          if (map.setCenter) map.setCenter([coords.lat, coords.lng]);
        }
      },

      zoomIn: () => {
        try {
          if (map.zoomIn) {
            map.zoomIn();
          } else if (map.getZoom && map.setZoom) {
            map.setZoom(map.getZoom() + 1);
          }
        } catch (e) {
          console.warn('[MapplsInstance] zoomIn error:', e);
        }
      },

      zoomOut: () => {
        try {
          if (map.zoomOut) {
            map.zoomOut();
          } else if (map.getZoom && map.setZoom) {
            map.setZoom(map.getZoom() - 1);
          }
        } catch (e) {
          console.warn('[MapplsInstance] zoomOut error:', e);
        }
      },

      invalidateSize: () => {
        try {
          if (map.invalidateSize) map.invalidateSize();
          if (map.resize) map.resize();
        } catch {
          // Ignore
        }
      },

      destroy: () => {
        try {
          if (map.remove) map.remove();
        } catch {
          // Ignore
        }
      }
    };

    return instance;
  }

  async searchPlaces(query: string, locationBias?: MapCoordinates): Promise<MapSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    try {
      const biasParam = locationBias ? `&lat=${locationBias.lat}&lng=${locationBias.lng}` : '';
      const res = await fetch(`${API_BASE_URL}/api/maps/mappls/autocomplete?input=${encodeURIComponent(q)}${biasParam}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.results) && data.results.length > 0) {
          return data.results.map((r: any) => ({
            id: r.id || `mappls-${Math.random().toString(36).substring(2, 8)}`,
            name: r.name,
            secondaryText: r.secondaryText || 'Kolkata, West Bengal',
            lat: r.lat,
            lng: r.lng,
            pincode: r.pincode,
            placeId: r.placeId,
            isMapGeocoded: true,
            provider: 'mappls' as const
          }));
        }
      }
    } catch (err) {
      console.warn('[MapplsProvider] searchPlaces error, delegating fallback:', err);
    }

    throw new Error('Mappls search produced no results');
  }

  async reverseGeocode(coords: MapCoordinates): Promise<ReverseGeocodeResult> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/maps/mappls/rev-geocode?lat=${coords.lat}&lng=${coords.lng}`);
      if (res.ok) {
        const data = await res.json();
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
            provider: 'mappls' as const
          };
        }
      }
    } catch (err) {
      console.warn('[MapplsProvider] reverseGeocode error:', err);
    }

    throw new Error('Mappls reverse geocoding unavailable');
  }
}
