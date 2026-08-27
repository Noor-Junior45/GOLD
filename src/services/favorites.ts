import { getActiveUserScope } from './supabaseService';

export const FAVORITES_STORAGE_KEY_BASE = 'giriraj_favorite_products';

function getFavoritesKey(): string {
  const scope = getActiveUserScope();
  return scope ? `${FAVORITES_STORAGE_KEY_BASE}_${scope}` : `${FAVORITES_STORAGE_KEY_BASE}_guest`;
}

export function getFavoriteProductIds(): string[] {
  try {
    const raw = localStorage.getItem(getFavoritesKey());
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function isProductFavorite(productId: string): boolean {
  return getFavoriteProductIds().includes(productId);
}

export function toggleProductFavorite(productId: string): boolean {
  try {
    const current = getFavoriteProductIds();
    let updated: string[];
    let isFav = false;
    if (current.includes(productId)) {
      updated = current.filter((id) => id !== productId);
      isFav = false;
    } else {
      updated = [...current, productId];
      isFav = true;
    }
    localStorage.setItem(getFavoritesKey(), JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('giriraj_favorites_changed', { detail: updated }));
    return isFav;
  } catch {
    return false;
  }
}

export function clearAllFavorites(): void {
  try {
    localStorage.setItem(getFavoritesKey(), JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('giriraj_favorites_changed', { detail: [] }));
  } catch {
    // ignore
  }
}

