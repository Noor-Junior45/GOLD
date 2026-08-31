import { Capacitor } from '@capacitor/core';

/**
 * Service Worker Registration & Image Pre-warming Utility
 * Ensures offline resilience and instant image loading even on slow 2G/3G connections.
 */

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || Capacitor.isNativePlatform()) {
    return;
  }

  // In development/sandbox preview mode, unregister all existing service workers
  // to prevent stale caching, Vite module interception, or blank white screens.
  if (import.meta.env.DEV || window.location.hostname.includes('ais-dev') || window.location.hostname === 'localhost') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().catch(() => {});
      }
    }).catch(() => {});
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Check for updates on load and periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New version available for BuildNow');
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
  });
}

/**
 * Pre-warms a list of critical product image URLs into the service worker cache
 * using requestIdleCallback or setTimeout so main thread performance is not affected.
 */
export function prewarmImageCache(imageUrls: string[]) {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  const validUrls = imageUrls.filter(
    (url) => typeof url === 'string' && url.startsWith('http') && !url.includes('data:')
  );

  if (validUrls.length === 0) return;

  const runPrewarm = () => {
    // Only prefetch if network is not in severe data-saver mode
    const nav = navigator as any;
    if (nav.connection && (nav.connection.saveData || nav.connection.effectiveType === 'slow-2g')) {
      return;
    }

    caches
      .open('buildnow-images-v2.1.0')
      .then(async (cache) => {
        for (const url of validUrls.slice(0, 20)) {
          const isCached = await cache.match(url);
          if (!isCached) {
            fetch(url, { mode: 'no-cors', priority: 'low' as any })
              .then((res) => {
                if (res && (res.status === 200 || res.type === 'opaque')) {
                  cache.put(url, res);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(runPrewarm, { timeout: 4000 });
  } else {
    setTimeout(runPrewarm, 2000);
  }
}
