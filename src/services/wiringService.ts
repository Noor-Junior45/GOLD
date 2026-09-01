import { supabase } from '../lib/supabaseClient';
import { ElectricalProduct, FilterState, SortOption } from '../types/electrical';
import { transformToElectricalProduct } from './electricalService';

/**
 * Fetch genuine wiring, cable, conduit, and wiring supply products strictly from Supabase database.
 * No demo or simulated fallback products are injected.
 */
export async function fetchWiringProducts(
  filters?: FilterState,
  sort: SortOption = 'popularity',
  searchQuery: string = ''
): Promise<{ products: ElectricalProduct[]; total: number }> {
  try {
    const { data: dbData, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    let items: ElectricalProduct[] = [];

    if (!error && Array.isArray(dbData) && dbData.length > 0) {
      // Map all db products
      const allDb = dbData.map(transformToElectricalProduct);

      // Filter products belonging to wiring, cables, conduits, casing, pipes, electrical accessories
      items = allDb.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const sub = (p.subcategory || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();

        return (
          cat === 'services' ||
          cat === 'wiring' ||
          sub.includes('wiring') ||
          sub.includes('wire') ||
          sub.includes('cable') ||
          sub.includes('pipe') ||
          sub.includes('pvc') ||
          sub.includes('conduit') ||
          sub.includes('casing') ||
          sub.includes('capping') ||
          sub.includes('gi box') ||
          sub.includes('switchboard') ||
          sub.includes('tape') ||
          name.includes('wire') ||
          name.includes('kabel') ||
          name.includes('cable') ||
          name.includes('conduit') ||
          name.includes('pipe') ||
          name.includes('casing') ||
          name.includes('capping') ||
          name.includes('gi box') ||
          name.includes('tape')
        );
      });
    } else {
      // Strict database mode: return empty array if no database products exist
      items = [];
    }

    // Apply Subcategory filter
    if (filters?.subcategories && filters.subcategories.length > 0) {
      const selectedSubs = filters.subcategories.map((s) => s.toLowerCase());
      items = items.filter((p) => {
        const pSub = (p.subcategory || '').toLowerCase();
        const pName = (p.name || '').toLowerCase();
        return selectedSubs.some(
          (sel) =>
            pSub.includes(sel) ||
            sel.includes(pSub) ||
            pName.includes(sel)
        );
      });
    }

    // Apply Brands filter
    if (filters?.brands && filters.brands.length > 0) {
      const selectedBrands = filters.brands.map((b) => b.toLowerCase());
      items = items.filter((p) =>
        selectedBrands.some((b) => (p.brand || '').toLowerCase().includes(b))
      );
    }

    // Apply Price filter
    if (filters?.minPrice !== undefined) {
      items = items.filter((p) => p.price >= (filters.minPrice ?? 0));
    }
    if (filters?.maxPrice !== undefined) {
      items = items.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }

    // Apply Rating filter
    if (filters?.minRating !== undefined) {
      items = items.filter((p) => p.rating_avg >= (filters.minRating ?? 0));
    }

    // Apply Discount filter
    if (filters?.minDiscount !== undefined) {
      items = items.filter((p) => p.discount_percent >= (filters.minDiscount ?? 0));
    }

    // In Stock filter
    if (filters?.inStockOnly) {
      items = items.filter((p) => p.stock_quantity > 0);
    }

    // Apply Search query
    if (searchQuery.trim()) {
      const queryLower = searchQuery.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(queryLower) ||
          p.brand.toLowerCase().includes(queryLower) ||
          p.subcategory.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower)
      );
    }

    // Apply Sort
    if (sort === 'price_asc') {
      items.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      items.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      items.sort((a, b) => b.rating_avg - a.rating_avg);
    } else if (sort === 'newest') {
      items.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    } else {
      // Default popularity
      items.sort((a, b) => b.rating_count - a.rating_count);
    }

    return {
      products: items,
      total: items.length
    };
  } catch (err) {
    console.error('Error fetching wiring products from Supabase:', err);
    return {
      products: [],
      total: 0
    };
  }
}
