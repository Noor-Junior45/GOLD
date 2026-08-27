/**
 * Mobile Haptic Feedback Utility
 * Uses navigator.vibrate with safe feature detection and fallback guards
 */

export const HAPTIC_PATTERNS = {
  // Ultra-light tap for micro-interactions (stepper +/-, color select, tabs)
  light: 15,
  // Medium punchy tap for primary actions (Add to Cart, Select Address)
  medium: 30,
  // Strong impact for key triggers
  heavy: 55,
  // Success pattern (e.g. Order Placed, Booking Confirmed, Coupon Applied)
  success: [35, 60, 65],
  // Warning pattern (e.g. Delete/Remove item, Clear cart)
  warning: [40, 50, 40],
  // Error pattern (e.g. Validation error, API failure)
  error: [50, 40, 50, 40, 80],
  // Double-tap pulse
  selection: [18, 30, 18],
} as const;

export type HapticInput = number | number[] | readonly number[];

/**
 * Triggers vibration if supported on the current mobile device/browser
 */
export function triggerHaptic(pattern: HapticInput = HAPTIC_PATTERNS.light): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      return navigator.vibrate(pattern as VibratePattern);
    }
  } catch {
    // Graceful fallback for sandboxed iframes or unsupported environments
  }
  return false;
}

/**
 * Trigger quick light haptic (e.g., quantity change, filter click, favorite toggle)
 */
export function hapticLight(): void {
  triggerHaptic(HAPTIC_PATTERNS.light);
}

/**
 * Trigger medium haptic (e.g., Add to Cart, Select Address)
 */
export function hapticMedium(): void {
  triggerHaptic(HAPTIC_PATTERNS.medium);
}

/**
 * Trigger celebratory success haptic pattern (e.g., Place Order complete, Booking confirmed)
 */
export function hapticSuccess(): void {
  triggerHaptic(HAPTIC_PATTERNS.success);
}

/**
 * Trigger warning haptic pattern (e.g., Remove from cart, Delete address)
 */
export function hapticWarning(): void {
  triggerHaptic(HAPTIC_PATTERNS.warning);
}

/**
 * Trigger error haptic pattern (e.g., Form validation failed)
 */
export function hapticError(): void {
  triggerHaptic(HAPTIC_PATTERNS.error);
}

/**
 * Trigger selection haptic pattern (e.g., Switch payment method, Area select)
 */
export function hapticSelection(): void {
  triggerHaptic(HAPTIC_PATTERNS.selection);
}
