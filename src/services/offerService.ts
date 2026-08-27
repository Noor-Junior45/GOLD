import { supabase } from '../lib/supabaseClient';
import { CartItem } from '../types';

export interface Offer {
  id: string;
  code: string; // e.g. 'GIRIRAJ10', 'KOLKATA60', 'POWER15'
  title: string; // e.g. 'Flat 10% OFF', '₹100 Instant Discount'
  description?: string;
  discount_type: 'percentage' | 'fixed'; // 'percentage' | 'fixed'
  discount_value: number; // e.g. 10 (for 10%) or 100 (for ₹100)
  category_scope: string; // 'all' | 'electrical' | 'construction' | 'services'
  min_order_value?: number; // Minimum cart total in INR required
  max_discount?: number; // Max discount in INR for percentage offers
  is_active: boolean;
  valid_from?: string | null;
  valid_until?: string | null; // ISO string / date YYYY-MM-DD
  created_at?: string;
}

export interface OfferProduct {
  id?: string;
  offer_id: string;
  product_id: string;
}

export interface ProductOfferEvaluation {
  hasOffer: boolean;
  offer: Offer | null;
  badgeText: string;
  discountText: string;
  discountAmount: number;
  discountPercentage: number;
  effectivePrice: number;
  isMoreFavorableThanMRP: boolean;
}

// Standard offers structure (empty by default so no demo offers are fabricated)
export const DEFAULT_OFFERS: Offer[] = [];

export const DEFAULT_OFFER_PRODUCTS: OfferProduct[] = [];

// In-memory cache (starts empty until real offers are fetched from database)
let cachedOffers: Offer[] = [];
let cachedOfferProducts: OfferProduct[] = [];
let offersFetched = false;

/**
 * Validates if an offer is currently active and within valid date window
 */
export function isOfferActive(offer: Offer): boolean {
  if (!offer.is_active) return false;

  const now = new Date();
  // Start of today in local time
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  if (offer.valid_from) {
    const validFromDate = new Date(offer.valid_from).getTime();
    if (!isNaN(validFromDate) && validFromDate > todayEnd) {
      return false;
    }
  }

  if (offer.valid_until) {
    const validUntilDate = new Date(offer.valid_until).getTime();
    if (!isNaN(validUntilDate) && validUntilDate < todayStart) {
      return false;
    }
  }

  return true;
}

/**
 * Fetch active storefront offers directly from database on demand
 */
export async function fetchActiveStorefrontOffers(): Promise<{ offers: Offer[]; offerProducts: OfferProduct[] }> {
  return await fetchOffersFromSupabase();
}

/**
 * Fetch offers and offer_products from Supabase or fallback
 */
export async function fetchOffersFromSupabase(): Promise<{ offers: Offer[]; offerProducts: OfferProduct[] }> {
  try {
    const [offersRes, opRes] = await Promise.all([
      supabase.from('offers').select('*'),
      supabase.from('offer_products').select('*')
    ]);

    if (!offersRes.error && Array.isArray(offersRes.data) && offersRes.data.length > 0) {
      cachedOffers = offersRes.data.map((row: any) => ({
        id: String(row.id),
        code: String(row.code || '').trim().toUpperCase(),
        title: String(row.title || row.name || 'Special Offer'),
        description: row.description || '',
        discount_type: (row.discount_type === 'fixed' || row.type === 'fixed' ? 'fixed' : 'percentage') as 'percentage' | 'fixed',
        discount_value: Number(row.discount_value || row.value || row.discount || 0),
        category_scope: String(row.category_scope || row.category || 'all').toLowerCase(),
        min_order_value: Number(row.min_order_value || row.min_order || 0),
        max_discount: row.max_discount ? Number(row.max_discount) : undefined,
        is_active: Boolean(row.is_active ?? row.isActive ?? true),
        valid_from: row.valid_from || null,
        valid_until: row.valid_until || row.expires_at || null,
        created_at: row.created_at
      }));
    } else {
      // Keep default active offers
      cachedOffers = [...DEFAULT_OFFERS];
    }

    if (!opRes.error && Array.isArray(opRes.data)) {
      cachedOfferProducts = opRes.data.map((row: any) => ({
        id: row.id ? String(row.id) : undefined,
        offer_id: String(row.offer_id),
        product_id: String(row.product_id)
      }));
    } else {
      cachedOfferProducts = [...DEFAULT_OFFER_PRODUCTS];
    }

    offersFetched = true;
  } catch (err) {
    console.warn('Error fetching offers from Supabase, using defaults:', err);
    cachedOffers = [...DEFAULT_OFFERS];
    cachedOfferProducts = [...DEFAULT_OFFER_PRODUCTS];
  }

  return {
    offers: cachedOffers,
    offerProducts: cachedOfferProducts
  };
}

/**
 * Returns cached offers synchronously (or initiates background load)
 */
export function getCachedOffers(): { offers: Offer[]; offerProducts: OfferProduct[] } {
  if (!offersFetched) {
    fetchOffersFromSupabase().catch(() => {});
  }
  return {
    offers: cachedOffers,
    offerProducts: cachedOfferProducts
  };
}

/**
 * Step 1: Checks if any active offer applies to a specific product
 * 1. First checks `offer_products` for a match on `product_id`. If found, that offer applies.
 * 2. If not found, falls back to checking offers where `category_scope = 'all'` OR `category_scope = product.category`.
 * 3. Only considers offers where `is_active` is true and (`valid_until` is null OR `valid_until` >= today).
 */
export function getApplicableOfferForProduct(
  productId: string,
  category: string = 'electrical',
  customOffers?: Offer[],
  customOfferProducts?: OfferProduct[]
): Offer | null {
  const offers = customOffers || cachedOffers;
  const offerProducts = customOfferProducts || cachedOfferProducts;

  const activeOffers = offers.filter(isOfferActive);
  const activeOfferMap = new Map<string, Offer>();
  activeOffers.forEach((off) => activeOfferMap.set(off.id, off));

  // 1. Check offer_products for direct match
  const directMatch = offerProducts.find(
    (op) => String(op.product_id) === String(productId) && activeOfferMap.has(op.offer_id)
  );

  if (directMatch) {
    const matchedOffer = activeOfferMap.get(directMatch.offer_id);
    if (matchedOffer) return matchedOffer;
  }

  // 2. Fall back to category_scope = 'all' OR category_scope = product's category
  const normalizedCategory = (category || 'electrical').toLowerCase().trim();

  // Try matching specific category first, then 'all'
  const categoryMatch = activeOffers.find(
    (off) => off.category_scope.toLowerCase().trim() === normalizedCategory
  );
  if (categoryMatch) return categoryMatch;

  const allScopeMatch = activeOffers.find(
    (off) => off.category_scope.toLowerCase().trim() === 'all'
  );
  if (allScopeMatch) return allScopeMatch;

  return null;
}

/**
 * Step 2: Evaluates the offer details for display on product cards and detail pages
 */
export function evaluateProductOffer(
  product: {
    id: string;
    category?: string;
    price: number;
    originalPrice?: number;
    discountPercentage?: number;
  },
  customOffer?: Offer | null
): ProductOfferEvaluation {
  const offer = customOffer !== undefined
    ? customOffer
    : getApplicableOfferForProduct(String(product.id), product.category);

  if (!offer) {
    return {
      hasOffer: false,
      offer: null,
      badgeText: '',
      discountText: '',
      discountAmount: 0,
      discountPercentage: 0,
      effectivePrice: product.price,
      isMoreFavorableThanMRP: false
    };
  }

  const basePrice = Number(product.price || 0);
  const mrp = Number(product.originalPrice || basePrice);

  let discountAmount = 0;
  let discountText = '';

  if (offer.discount_type === 'percentage') {
    discountAmount = Math.round(basePrice * (offer.discount_value / 100));
    if (offer.max_discount && discountAmount > offer.max_discount) {
      discountAmount = offer.max_discount;
    }
    discountText = `${offer.discount_value}% OFF`;
  } else {
    discountAmount = Math.min(basePrice, offer.discount_value);
    discountText = `₹${offer.discount_value} OFF`;
  }

  const effectivePrice = Math.max(0, basePrice - discountAmount);
  const totalSavings = (mrp - basePrice) + discountAmount;
  const effectiveDiscountPercentage = mrp > 0 ? Math.round((totalSavings / mrp) * 100) : 0;
  const baseDiscountPercent = Number(product.discountPercentage || (mrp > basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0));

  const isMoreFavorableThanMRP = effectiveDiscountPercentage > baseDiscountPercent || discountAmount > 0;
  const badgeText = `${offer.code} · ${discountText}`;

  return {
    hasOffer: true,
    offer,
    badgeText,
    discountText,
    discountAmount,
    discountPercentage: effectiveDiscountPercentage,
    effectivePrice,
    isMoreFavorableThanMRP
  };
}

/**
 * Step 3: Validates a promo coupon code entered on the cart page
 * 1. Looks it up in offers (matching on code, is_active, and valid date range).
 * 2. Checks whether it actually applies to what's in the cart:
 *    - any cart item's product_id in offer_products
 *    - OR category_scope covering any cart item's category
 * 3. Checks whether min_order_value is met before applying the discount.
 * 4. Shows a clear error if the code doesn't apply to anything currently in the cart.
 */
export function validateAndApplyCartCoupon(
  enteredCode: string,
  cartItems: CartItem[],
  cartTotal: number,
  customOffers?: Offer[],
  customOfferProducts?: OfferProduct[]
): {
  success: boolean;
  discountAmount: number;
  message: string;
  offer?: Offer;
} {
  const cleanCode = (enteredCode || '').trim().toUpperCase();
  if (!cleanCode) {
    return {
      success: false,
      discountAmount: 0,
      message: 'Please enter a coupon code.'
    };
  }

  if (cartItems.length === 0) {
    return {
      success: false,
      discountAmount: 0,
      message: 'Your cart is empty. Add products to apply a coupon.'
    };
  }

  const { offers, offerProducts } = customOffers && customOfferProducts
    ? { offers: customOffers, offerProducts: customOfferProducts }
    : getCachedOffers();

  // 1. Look up matching offer by code & active status
  const matchedOffer = offers.find(
    (off) => off.code.toUpperCase() === cleanCode
  );

  if (!matchedOffer) {
    return {
      success: false,
      discountAmount: 0,
      message: `Invalid coupon code "${cleanCode}". Please check for typos.`
    };
  }

  if (!isOfferActive(matchedOffer)) {
    return {
      success: false,
      discountAmount: 0,
      message: `Coupon "${matchedOffer.code}" has expired or is currently inactive.`
    };
  }

  // 2. Check applicability to cart items
  const offerSpecificProductIds = new Set(
    offerProducts
      .filter((op) => op.offer_id === matchedOffer.id)
      .map((op) => String(op.product_id))
  );

  const offerCategoryScope = (matchedOffer.category_scope || 'all').toLowerCase().trim();

  // Find all cart items that are eligible for this offer
  const eligibleItems = cartItems.filter((item) => {
    const pId = String(item.product.id);
    const pCat = (item.product.category || 'electrical').toLowerCase().trim();

    // Check specific product ID match
    if (offerSpecificProductIds.has(pId)) {
      return true;
    }

    // Check category match or 'all'
    if (offerCategoryScope === 'all' || offerCategoryScope === pCat) {
      return true;
    }

    return false;
  });

  if (eligibleItems.length === 0) {
    const scopeLabel = offerCategoryScope === 'all'
      ? 'selected specific products'
      : `${offerCategoryScope} products`;

    return {
      success: false,
      discountAmount: 0,
      message: `Coupon "${matchedOffer.code}" is only valid for ${scopeLabel}. None of the items in your cart qualify.`
    };
  }

  // Calculate total price of eligible items
  const eligibleItemsTotal = eligibleItems.reduce((sum, item) => {
    return sum + Number(item.product.price || 0) * item.quantity;
  }, 0);

  // 3. Check min_order_value
  if (matchedOffer.min_order_value && cartTotal < matchedOffer.min_order_value) {
    const diff = matchedOffer.min_order_value - cartTotal;
    return {
      success: false,
      discountAmount: 0,
      message: `Minimum order value of ₹${matchedOffer.min_order_value.toLocaleString('en-IN')} required for coupon "${matchedOffer.code}". Add ₹${diff.toLocaleString('en-IN')} more to qualify.`
    };
  }

  // 4. Calculate discount amount
  let discount = 0;
  if (matchedOffer.discount_type === 'percentage') {
    discount = Math.round(eligibleItemsTotal * (matchedOffer.discount_value / 100));
    if (matchedOffer.max_discount && discount > matchedOffer.max_discount) {
      discount = matchedOffer.max_discount;
    }
  } else {
    discount = Math.min(cartTotal, matchedOffer.discount_value);
  }

  return {
    success: true,
    discountAmount: discount,
    message: `Coupon "${matchedOffer.code}" applied! You saved ₹${discount.toLocaleString('en-IN')}.`,
    offer: matchedOffer
  };
}

/**
 * Validates and calculates coupon discount (alias to validateAndApplyCartCoupon)
 */
export const validateAndCalculateCoupon = validateAndApplyCartCoupon;

