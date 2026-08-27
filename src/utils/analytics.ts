import { Product, CartItem, Order } from '../types';
import { ElectricalProduct } from '../types/electrical';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type AnyProduct = Product | ElectricalProduct | Record<string, any>;

/**
 * Safe wrapper to invoke gtag
 */
export function sendGAEvent(eventName: string, eventParams: Record<string, any> = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, eventParams);
    }
  } catch (err) {
    console.debug('GA Event error:', err);
  }
}

/**
 * Format any product object to standard GA4 Item schema
 */
export function formatGAProductItem(product: AnyProduct, quantity = 1, selectedVariant?: string) {
  if (!product) return {};
  
  const id = product.id || '';
  const name = product.name || 'Product';
  const brand = product.brand || 'Giriraj Power';
  const category = product.category || 'electrical';
  const subCategory = (product as Product).subCategory || (product as ElectricalProduct).subcategory || '';
  const price = typeof product.price === 'number' ? product.price : 0;
  const originalPrice = (product as Product).originalPrice || (product as ElectricalProduct).mrp || price;
  const discount = originalPrice > price ? originalPrice - price : 0;
  const variant = selectedVariant || (product as Product).selectedColor || undefined;

  return {
    item_id: String(id),
    item_name: String(name),
    item_brand: String(brand),
    item_category: String(category),
    item_category2: String(subCategory),
    item_variant: variant ? String(variant) : undefined,
    price: Number(price),
    quantity: Number(quantity),
    discount: Number(discount)
  };
}

/**
 * Track Page Views
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  sendGAEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== 'undefined' ? document.title : ''),
    send_to: 'G-7J0DXZDRWL'
  });
}

/**
 * Track Product View (view_item)
 * Triggered whenever a product card quick view or product details page is opened
 */
export function trackProductView(product: AnyProduct) {
  if (!product) return;
  const item = formatGAProductItem(product, 1);
  sendGAEvent('view_item', {
    currency: 'INR',
    value: item.price || 0,
    items: [item]
  });
}

/**
 * Track Product List / Category Browse (view_item_list)
 */
export function trackProductListView(products: AnyProduct[], listName: string) {
  if (!products || products.length === 0) return;
  sendGAEvent('view_item_list', {
    item_list_name: listName,
    items: products.slice(0, 20).map((p, idx) => ({
      ...formatGAProductItem(p, 1),
      index: idx + 1
    }))
  });
}

/**
 * Track Add to Cart (add_to_cart)
 */
export function trackAddToCart(product: AnyProduct, quantity = 1, selectedVariant?: string) {
  if (!product) return;
  const item = formatGAProductItem(product, quantity, selectedVariant);
  sendGAEvent('add_to_cart', {
    currency: 'INR',
    value: (item.price || 0) * quantity,
    items: [item]
  });
}

/**
 * Track Remove From Cart (remove_from_cart)
 */
export function trackRemoveFromCart(product: AnyProduct, quantity = 1) {
  if (!product) return;
  const item = formatGAProductItem(product, quantity);
  sendGAEvent('remove_from_cart', {
    currency: 'INR',
    value: (item.price || 0) * quantity,
    items: [item]
  });
}

/**
 * Track Begin Checkout (begin_checkout)
 */
export function trackBeginCheckout(cartItems: CartItem[], totalAmount: number) {
  sendGAEvent('begin_checkout', {
    currency: 'INR',
    value: totalAmount,
    items: cartItems.map((item) => formatGAProductItem(item.product, item.quantity, item.selectedColor))
  });
}

/**
 * Track Purchase / Order Placed (purchase)
 */
export function trackPurchase(order: Order, items: CartItem[], totalAmount: number, shippingFee = 0) {
  sendGAEvent('purchase', {
    transaction_id: order.id,
    value: totalAmount,
    currency: 'INR',
    shipping: shippingFee,
    payment_type: order.paymentMethod || 'COD / Online',
    items: items.map((item) => formatGAProductItem(item.product, item.quantity, item.selectedColor))
  });
}

/**
 * Track Search Queries (search)
 */
export function trackSearch(searchTerm: string) {
  if (!searchTerm || !searchTerm.trim()) return;
  sendGAEvent('search', {
    search_term: searchTerm.trim()
  });
}
