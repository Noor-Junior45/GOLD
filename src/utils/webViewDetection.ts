/**
 * Utilities to detect WebView environments and network connectivity
 * specifically for Android Studio plain WebView packaging and offline resilience.
 */

export function isWebViewEnvironment(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent || '';

  // 1. Check for standard Android WebView tokens
  const isAndroid = /Android/i.test(ua);
  const isWv = /;\s*wv\b|Version\/[\d.]+\s+Chrome\/|Android.*Version\/[\d.]+\s+Mobile/i.test(ua);

  // 2. Check for missing browser navigation/window properties in standalone WebViews
  const isStandalone = (window.navigator as any).standalone === true;

  // 3. Custom Android bridge indicators or package markers if set
  const hasAndroidBridge = typeof (window as any).Android !== 'undefined';

  return (isAndroid && isWv) || isStandalone || hasAndroidBridge;
}

export function isOnline(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return true;
  return window.navigator.onLine !== false;
}
