import { Capacitor } from '@capacitor/core';

/**
 * Universal API Base URL resolution for Native Apps (Capacitor Android & iOS) and Web Deployments.
 *
 * In native mobile builds (Android & iOS WebView), relative fetch('/api/...') calls
 * fail because there is no local backend server inside the device container.
 * This resolves to the live backend server (https://www.girirajpower.in) or VITE_API_BASE_URL,
 * while preserving standard relative paths in web browsers.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (typeof window !== 'undefined' &&
  (Capacitor.isNativePlatform() ||
    window.location.origin.startsWith('capacitor://') ||
    window.location.origin.startsWith('ionic://') ||
    window.location.origin.startsWith('file://'))
    ? 'https://www.girirajpower.in'
    : '');

/**
 * Helper to safely construct full API URLs across Web and Capacitor platforms.
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) return cleanPath;
  return `${API_BASE_URL.replace(/\/+$/, '')}${cleanPath}`;
}
