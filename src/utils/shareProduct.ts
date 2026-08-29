import { hapticLight } from './haptics';

export interface ShareProductOptions {
  id: string | number;
  name: string;
  brand?: string;
  price?: number;
  category?: string;
  url?: string;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'none';
  cancelled?: boolean;
}

/**
 * Universal cross-platform product share function.
 * Supports:
 * - Native Mobile App / PWA share sheet (WhatsApp, Telegram, Messages, Gmail, Instagram, etc.) via Web Share API
 * - Desktop OS share sheet (Windows, macOS Safari/Edge)
 * - Automatic clipboard fallback with toast confirmation on desktop browsers without Web Share support
 * - Guaranteed exact deep link to the product details page
 */
export async function shareProductDetails(options: ShareProductOptions): Promise<ShareResult> {
  hapticLight();

  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';

  // Determine canonical product URL
  const productPath = `/electrical/product/${encodeURIComponent(String(options.id))}`;
  const fullShareUrl = options.url || `${origin}${productPath}`;

  const shareTitle = `${options.name}${options.brand ? ` (${options.brand})` : ''} - Giriraj Power`;
  const shareText = options.price
    ? `Check out ${options.name} on Giriraj Power for ₹${options.price.toLocaleString('en-IN')}:`
    : `Check out ${options.name} on Giriraj Power:`;

  const shareData = {
    title: shareTitle,
    text: shareText,
    url: fullShareUrl
  };

  // 1. Try Native Web Share API (Mobile phones, Android Webview/PWA, iOS Safari, Windows/macOS native share dialogs)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      // Check if navigator.canShare supports the payload
      if (typeof navigator.canShare === 'function') {
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return { success: true, method: 'native' };
        }
      } else {
        await navigator.share(shareData);
        return { success: true, method: 'native' };
      }
    } catch (err: any) {
      // If user simply closed/cancelled the share pop-up, don't trigger clipboard fallback
      if (err && (err.name === 'AbortError' || err.message?.includes('abort') || err.message?.includes('cancel') || err.message?.includes('Dismissed'))) {
        return { success: false, method: 'native', cancelled: true };
      }
      console.warn('Native share failed, falling back to clipboard copy:', err);
    }
  }

  // 2. Desktop & Fallback: Copy direct product URL to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(fullShareUrl);
      return { success: true, method: 'clipboard' };
    } else {
      // Legacy document.execCommand fallback
      const textArea = document.createElement('textarea');
      textArea.value = fullShareUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (copied) {
        return { success: true, method: 'clipboard' };
      }
    }
  } catch (copyErr) {
    console.error('Failed to copy product URL to clipboard:', copyErr);
  }

  return { success: false, method: 'none' };
}
