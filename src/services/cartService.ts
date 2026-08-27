import { supabase } from '../lib/supabaseClient';
import { CartItem, Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/products';
import { getActiveUserScope } from './supabaseService';

export interface SavedItemRecord {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

const LOCAL_SAVED_ITEMS_KEY_BASE = 'giriraj_saved_items_v2';

function getSavedItemsKey(): string {
  const scope = getActiveUserScope();
  return scope ? `${LOCAL_SAVED_ITEMS_KEY_BASE}_${scope}` : `${LOCAL_SAVED_ITEMS_KEY_BASE}_guest`;
}

/**
 * Fetch all cart items from Supabase for the current authenticated user.
 * Joins with the `products` table.
 */
export async function fetchCartItemsFromSupabase(): Promise<CartItem[] | null> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user?.id) {
      return null; // Guest user, use client-side state
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select('id, product_id, quantity, selected_color, products(*)')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase cart_items fetch notice:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      return [];
    }

    const cartItems: CartItem[] = data.map((row: any) => {
      const p = row.products;
      let product: Product;
      if (p) {
        product = {
          id: String(p.id),
          name: p.name || 'Product',
          brand: p.brand || 'Giriraj Power',
          category: p.category || 'electrical',
          subCategory: p.sub_category || p.subcategory || 'General',
          price: Number(p.price || 0),
          originalPrice: Number(p.original_price || p.mrp || p.price),
          discountPercentage: Number(p.discount_percentage || p.discount_percent || 0),
          unit: p.unit || '1 pc',
          rating: Number(p.rating || p.rating_avg || 4.8),
          reviewsCount: Number(p.reviews_count || p.rating_count || 32),
          deliveryMinutes: Number(p.delivery_minutes || 30),
          image: p.image || (Array.isArray(p.image_urls) && p.image_urls[0]) || 'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop',
          inStock: p.in_stock ?? true,
          stockCount: Number(p.stock_quantity ?? p.stock_count ?? 50),
          isEmergency: !!p.is_emergency,
          specs: p.specs || p.specifications || {},
          description: p.description || '',
          tags: p.tags || []
        };
      } else {
        const fallback = INITIAL_PRODUCTS.find((ip) => ip.id === row.product_id);
        product = fallback || {
          id: row.product_id,
          name: 'Electrical Item',
          brand: 'Giriraj Power',
          category: 'electrical',
          subCategory: 'General',
          price: 99,
          originalPrice: 120,
          discountPercentage: 17,
          unit: '1 pc',
          rating: 4.8,
          reviewsCount: 15,
          deliveryMinutes: 60,
          image: 'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop',
          inStock: true,
          stockCount: 20,
          isEmergency: false,
          specs: {},
          description: '',
          tags: []
        };
      }

      return {
        product,
        quantity: Number(row.quantity || 1),
        selectedColor: row.selected_color || undefined
      };
    });

    return cartItems;
  } catch (err) {
    console.warn('Error fetching cart from Supabase:', err);
    return null;
  }
}

/**
 * Optimistically syncs / upserts an item to the Supabase `cart_items` table
 */
export async function syncCartItemToSupabase(
  productId: string,
  quantity: number,
  selectedColor?: string
): Promise<void> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user?.id) return;

    if (quantity <= 0) {
      await removeCartItemFromSupabase(productId);
      return;
    }

    await supabase.from('cart_items').upsert(
      {
        user_id: authData.user.id,
        product_id: String(productId),
        quantity: quantity,
        selected_color: selectedColor || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'user_id,product_id' }
    );
  } catch (err) {
    console.warn('Error syncing cart item to Supabase:', err);
  }
}

/**
 * Removes a cart item from the Supabase `cart_items` table
 */
export async function removeCartItemFromSupabase(productId: string): Promise<void> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user?.id) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', authData.user.id)
      .eq('product_id', String(productId));
  } catch (err) {
    console.warn('Error deleting cart item from Supabase:', err);
  }
}

/**
 * Clears all cart items from Supabase for the current user
 */
export async function clearCartInSupabase(): Promise<void> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user?.id) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', authData.user.id);
  } catch (err) {
    console.warn('Error clearing cart in Supabase:', err);
  }
}

/**
 * Fetch all saved items (Save for later)
 */
export async function fetchSavedItemsFromSupabase(): Promise<SavedItemRecord[]> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    
    // Check Supabase if authenticated
    if (authData?.user?.id) {
      const { data, error } = await supabase
        .from('saved_items')
        .select('id, product_id, created_at, products(*)')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const items: SavedItemRecord[] = data.map((row: any) => {
          const p = row.products;
          const product: Product = p
            ? {
                id: String(p.id),
                name: p.name || 'Product',
                brand: p.brand || 'Giriraj Power',
                category: p.category || 'electrical',
                subCategory: p.sub_category || p.subcategory || 'General',
                price: Number(p.price || 0),
                originalPrice: Number(p.original_price || p.mrp || p.price),
                discountPercentage: Number(p.discount_percentage || p.discount_percent || 0),
                unit: p.unit || '1 pc',
                rating: Number(p.rating || 4.8),
                reviewsCount: Number(p.reviews_count || 24),
                deliveryMinutes: Number(p.delivery_minutes || 30),
                image: p.image || (Array.isArray(p.image_urls) && p.image_urls[0]) || 'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop',
                inStock: p.in_stock ?? true,
                stockCount: Number(p.stock_quantity ?? p.stock_count ?? 50),
                isEmergency: !!p.is_emergency,
                specs: p.specs || {},
                description: p.description || '',
                tags: p.tags || []
              }
            : INITIAL_PRODUCTS.find((ip) => ip.id === row.product_id) || {
                id: row.product_id,
                name: 'Saved Item',
                brand: 'Giriraj Power',
                category: 'electrical',
                subCategory: 'General',
                price: 199,
                originalPrice: 250,
                discountPercentage: 20,
                unit: '1 pc',
                rating: 4.8,
                reviewsCount: 10,
                deliveryMinutes: 60,
                image: 'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=400&auto=format&fit=crop',
                inStock: true,
                stockCount: 15,
                isEmergency: false,
                specs: {},
                description: '',
                tags: []
              };

          return {
            id: row.id,
            productId: row.product_id,
            product,
            createdAt: row.created_at
          };
        });

        localStorage.setItem(getSavedItemsKey(), JSON.stringify(items));
        return items;
      }
    }

    // Fallback to local storage
    const raw = localStorage.getItem(getSavedItemsKey());
    if (raw) {
      return JSON.parse(raw);
    }
    return [];
  } catch (err) {
    console.warn('Error fetching saved items:', err);
    return [];
  }
}

/**
 * Move item from Cart to Save for Later
 */
export async function saveItemForLater(product: Product): Promise<SavedItemRecord[]> {
  try {
    const raw = localStorage.getItem(getSavedItemsKey());
    const current: SavedItemRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = current.filter((item) => item.productId !== product.id);
    const newRecord: SavedItemRecord = {
      id: `saved-${Date.now()}`,
      productId: product.id,
      product,
      createdAt: new Date().toISOString()
    };
    const updated = [newRecord, ...filtered];
    localStorage.setItem(getSavedItemsKey(), JSON.stringify(updated));

    // Sync to Supabase
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      await supabase.from('saved_items').upsert(
        {
          user_id: authData.user.id,
          product_id: String(product.id),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'user_id,product_id' }
      );
      // Remove from cart_items table
      await removeCartItemFromSupabase(product.id);
    }

    return updated;
  } catch (err) {
    console.warn('Error saving item for later:', err);
    return [];
  }
}

/**
 * Remove an item from Saved for Later
 */
export async function removeSavedItem(productId: string): Promise<SavedItemRecord[]> {
  try {
    const raw = localStorage.getItem(getSavedItemsKey());
    const current: SavedItemRecord[] = raw ? JSON.parse(raw) : [];
    const updated = current.filter((item) => item.productId !== productId);
    localStorage.setItem(getSavedItemsKey(), JSON.stringify(updated));

    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user?.id) {
      await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', authData.user.id)
        .eq('product_id', String(productId));
    }

    return updated;
  } catch (err) {
    console.warn('Error removing saved item:', err);
    return [];
  }
}
