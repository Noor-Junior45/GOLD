import { IMapProvider, IMapInstance, MapCoordinates, MapInitOptions, MapSearchResult, ReverseGeocodeResult } from './types';
import { MapplsProvider } from './MapplsProvider';
import { GoogleMapsProvider } from './GoogleMapsProvider';
import { OsmProvider } from './OsmProvider';

export class MapProviderManager {
  private static instance: MapProviderManager | null = null;
  private mapplsProvider: MapplsProvider;
  private googleProvider: GoogleMapsProvider;
  private osmProvider: OsmProvider;
  private activeProviderName: 'mappls' | 'google' | 'osm' = 'mappls';

  private constructor() {
    this.mapplsProvider = new MapplsProvider();
    this.googleProvider = new GoogleMapsProvider();
    this.osmProvider = new OsmProvider();

    if (this.mapplsProvider.isAvailable()) {
      this.activeProviderName = 'mappls';
    } else if (this.googleProvider.isAvailable()) {
      this.activeProviderName = 'google';
    } else {
      this.activeProviderName = 'osm';
    }
  }

  public static getInstance(): MapProviderManager {
    if (!MapProviderManager.instance) {
      MapProviderManager.instance = new MapProviderManager();
    }
    return MapProviderManager.instance;
  }

  public getActiveProviderName(): 'mappls' | 'google' | 'osm' {
    return this.activeProviderName;
  }

  public getProviderStatus(): {
    primary: { name: string; available: boolean; active: boolean };
    backup: { name: string; available: boolean; active: boolean };
    tertiary: { name: string; available: boolean; active: boolean };
  } {
    return {
      primary: {
        name: 'Mappls Web SDK (Primary)',
        available: this.mapplsProvider.isAvailable(),
        active: this.activeProviderName === 'mappls'
      },
      backup: {
        name: 'Google Maps (Backup)',
        available: this.googleProvider.isAvailable(),
        active: this.activeProviderName === 'google'
      },
      tertiary: {
        name: 'OpenStreetMap (Fallback)',
        available: true,
        active: this.activeProviderName === 'osm'
      }
    };
  }

  public isMapplsKeyConfigured(): boolean {
    return this.mapplsProvider.hasKey();
  }

  public isMapplsFailed(): boolean {
    return this.isMapplsKeyConfigured() && !this.mapplsProvider.isAvailable();
  }

  /**
   * Resets provider script cache and attempts full map re-initialization.
   */
  public async retryMap(container: HTMLElement, options: MapInitOptions): Promise<{
    instance: IMapInstance;
    provider: 'mappls' | 'google' | 'osm';
  }> {
    this.mapplsProvider.resetState();
    return this.renderMap(container, options);
  }

  /**
   * Initializes the map in the given DOM container.
   * Tries Mappls first, cascades to Google Maps, then to OSM.
   */
  public async renderMap(container: HTMLElement, options: MapInitOptions): Promise<{
    instance: IMapInstance;
    provider: 'mappls' | 'google' | 'osm';
  }> {
    // 1. Try Mappls if key is configured
    if (this.mapplsProvider.isAvailable()) {
      try {
        const instance = await this.mapplsProvider.initialize(container, options);
        this.activeProviderName = 'mappls';
        return { instance, provider: 'mappls' };
      } catch (err) {
        console.warn('[MapProviderManager] Mappls failed to initialize, falling back to Google Maps:', err);
      }
    }

    // 2. Try Google Maps if configured
    if (this.googleProvider.isAvailable()) {
      try {
        const instance = await this.googleProvider.initialize(container, options);
        this.activeProviderName = 'google';
        return { instance, provider: 'google' };
      } catch (err) {
        console.warn('[MapProviderManager] Google Maps failed to initialize, falling back to OSM:', err);
      }
    }

    // 3. Fallback to OSM / Leaflet
    const instance = await this.osmProvider.initialize(container, options);
    this.activeProviderName = 'osm';
    return { instance, provider: 'osm' };
  }

  /**
   * Searches places using primary Mappls, cascading to Google Maps, then OSM.
   */
  public async searchPlaces(query: string, locationBias?: MapCoordinates): Promise<MapSearchResult[]> {
    const q = query.trim();
    if (!q) return [];

    // 1. Try Mappls
    if (this.mapplsProvider.isAvailable()) {
      try {
        const results = await this.mapplsProvider.searchPlaces(q, locationBias);
        if (results.length > 0) return results;
      } catch (e) {
        console.warn('[MapProviderManager] Mappls search unavailable, trying Google Maps:', e);
      }
    }

    // 2. Try Google Places
    try {
      const results = await this.googleProvider.searchPlaces(q);
      if (results.length > 0) return results;
    } catch (e) {
      console.warn('[MapProviderManager] Google Places unavailable, trying OSM:', e);
    }

    // 3. Fallback to OSM
    try {
      const results = await this.osmProvider.searchPlaces(q);
      return results;
    } catch {
      return [];
    }
  }

  /**
   * Reverse geocodes coordinates to street & address details.
   */
  public async reverseGeocode(coords: MapCoordinates): Promise<ReverseGeocodeResult> {
    // 1. Try Mappls
    if (this.mapplsProvider.isAvailable()) {
      try {
        return await this.mapplsProvider.reverseGeocode(coords);
      } catch (e) {
        console.warn('[MapProviderManager] Mappls reverse geocode failed, trying Google Maps:', e);
      }
    }

    // 2. Try Google Maps / Proxy
    try {
      return await this.googleProvider.reverseGeocode(coords);
    } catch (e) {
      console.warn('[MapProviderManager] Google reverse geocode failed, trying OSM:', e);
    }

    // 3. Fallback to OSM
    return await this.osmProvider.reverseGeocode(coords);
  }

  /**
   * Gets current user coordinates using device GPS.
   */
  public async getCurrentPosition(): Promise<MapCoordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this device.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Fetch Place Details by placeId (Google Maps)
   */
  public async getPlaceDetails(placeId: string) {
    if (this.googleProvider.getPlaceDetails) {
      return await this.googleProvider.getPlaceDetails(placeId);
    }
    return null;
  }
}

export const mapManager = MapProviderManager.getInstance();
