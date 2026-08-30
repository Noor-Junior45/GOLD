import { useState, useEffect, useCallback, useRef } from 'react';
import { CLIENT_BUILD_ID, APP_VERSION, ServerVersionInfo } from '../version';
import { API_BASE_URL } from '../lib/apiBase';

export interface UseVersionCheckOptions {
  /** Check interval in milliseconds (default: 45000 / 45s) */
  intervalMs?: number;
  /** Whether automatic background polling is enabled */
  enabled?: boolean;
  /** Auto refresh countdown in seconds (default: 5, 0 = immediate) */
  autoRefreshDelaySec?: number;
  /** Callback fired when a mismatch is detected */
  onMismatch?: (serverInfo: ServerVersionInfo) => void;
}

export interface VersionCheckState {
  clientBuildId: string;
  clientVersion: string;
  serverBuildId: string | null;
  serverVersion: string | null;
  isUpdateAvailable: boolean;
  isChecking: boolean;
  lastCheckedAt: Date | null;
  countdown: number | null;
  isRefreshing: boolean;
  error: string | null;
  checkForUpdates: () => Promise<boolean>;
  triggerSoftRefresh: () => void;
  dismissUpdate: () => void;
}

const STORAGE_LAST_REFRESHED_BUILD = 'giriraj_last_soft_refresh_build';
const STORAGE_LAST_REFRESHED_TIME = 'giriraj_last_soft_refresh_time';

/**
 * Silent Background Cache & Asset Invalidation Engine
 * Cleans dynamic CacheStorage and transient caches in the background
 * without triggering jarring screen reloads, page blinking, or popups.
 */
export async function clearBrowserCacheInBackground(targetBuildId?: string): Promise<void> {
  try {
    if (targetBuildId) {
      sessionStorage.setItem(STORAGE_LAST_REFRESHED_BUILD, targetBuildId);
      sessionStorage.setItem(STORAGE_LAST_REFRESHED_TIME, Date.now().toString());
    }

    // Clear dynamic CacheStorage silently in the background
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      } catch (e) {
        // Silent error handling
      }
    }
  } catch (err) {
    // Silent error handling
  }
}

export function useVersionCheck(options: UseVersionCheckOptions = {}): VersionCheckState {
  const {
    intervalMs = 60000,
    enabled = true,
    onMismatch
  } = options;

  const [serverBuildId, setServerBuildId] = useState<string | null>(null);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isDismissedRef = useRef<boolean>(false);
  const lastCheckTimestampRef = useRef<number>(0);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    if (now - lastCheckTimestampRef.current < 5000) {
      return isUpdateAvailable;
    }
    lastCheckTimestampRef.current = now;

    try {
      setIsChecking(true);
      setError(null);

      // Cache buster to query fresh server version info
      const response = await fetch(`${API_BASE_URL}/api/version?t=${now}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        return false;
      }

      const data: ServerVersionInfo = await response.json();
      setLastCheckedAt(new Date());

      if (data && data.buildId) {
        setServerBuildId(data.buildId);
        setServerVersion(data.version || null);

        const hasMismatch = Boolean(
          CLIENT_BUILD_ID &&
          data.buildId &&
          CLIENT_BUILD_ID !== data.buildId
        );

        if (hasMismatch) {
          setIsUpdateAvailable(true);
          
          // Silently purge stale cache storage in the background for fresh assets
          await clearBrowserCacheInBackground(data.buildId);
          
          // Trigger silent background data refresh callback if provided
          if (onMismatch) {
            onMismatch(data);
          }

          return true;
        } else {
          setIsUpdateAvailable(false);
          return false;
        }
      }
      return false;
    } catch (err: any) {
      setError(err?.message || 'Version check failed');
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [isUpdateAvailable, onMismatch]);

  // Periodic background check & event listeners (no reload loops, no UI popups)
  useEffect(() => {
    if (!enabled) return;

    const initialTimer = setTimeout(() => {
      checkForUpdates();
    }, 5000);

    const intervalTimer = setInterval(() => {
      checkForUpdates();
    }, intervalMs);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdates();
      }
    };

    const handleOnline = () => {
      checkForUpdates();
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [enabled, intervalMs, checkForUpdates]);

  const triggerSoftRefresh = useCallback(() => {
    clearBrowserCacheInBackground(serverBuildId || undefined);
  }, [serverBuildId]);

  const dismissUpdate = useCallback(() => {
    isDismissedRef.current = true;
    setIsUpdateAvailable(false);
  }, []);

  return {
    clientBuildId: CLIENT_BUILD_ID,
    clientVersion: APP_VERSION,
    serverBuildId,
    serverVersion,
    isUpdateAvailable,
    isChecking,
    lastCheckedAt,
    countdown: null,
    isRefreshing: false,
    error,
    checkForUpdates,
    triggerSoftRefresh,
    dismissUpdate
  };
}
