export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'electrical' | 'services' | 'construction' | 'emergency';
  subCategory: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  unit: string;
  rating: number;
  reviewsCount: number;
  deliveryMinutes: number;
  image: string;
  images?: string[];
  image_urls?: string[];
  inStock: boolean;
  stockCount: number;
  isEmergency: boolean;
  isBestSeller?: boolean;
  specs: { [key: string]: string };
  description: string;
  tags: string[];
  selectedColor?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface WiringServiceBooking {
  id: string;
  serviceTitle: string;
  serviceCategory: string;
  projectType: '1BHK' | '2BHK' | '3BHK' | '4BHK / Villa' | 'Commercial Office' | 'Real Estate Complex' | 'Custom Industrial';
  approxAreaSqFt: number;
  preferredDate: string;
  preferredTimeSlot: string;
  siteAddress: string;
  area: string;
  pincode: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  estimatedPrice: number;
  wireGrade: string;
  notes?: string;
  status: 'requested' | 'confirmed' | 'technician_assigned' | 'completed';
  createdAt: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId?: string;
  customerName: string;
  recipientName?: string;
  phone: string;
  recipientPhone?: string;
  customerEmail?: string;
  recipientEmail?: string;
  address: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  area: string;
  pincode: string;
  addressLabel?: string;
  landmark?: string;
  deliveryNotes?: string;
  items: CartItem[];
  services?: WiringServiceBooking[];
  itemTotal: number;
  subtotal?: number;
  deliveryFee: number;
  handlingFee: number;
  fees?: number;
  discount: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalAmount: number;
  paymentMethod: 'cod' | 'upi' | 'card';
  paymentStatus: 'paid' | 'pending';
  status: OrderStatus;
  createdAt: string;
  placed_at?: string;
  packed_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: string;
  placedAt?: string;
  packedAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  estimatedDeliveryTimestamp: number;
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicleNumber: string;
    currentHub: string;
  };
  notes?: string;
}

export interface KolkataArea {
  name: string;
  pincode: string;
  zone: 'Central' | 'North' | 'South' | 'East' | 'West';
  hub: string;
  deliveryMinutes: number;
  serviceable: boolean;
  lat?: number;
  lng?: number;
  exactStreet?: string;
}

export interface SavedAddress {
  id: string;
  tag: 'home' | 'work' | 'hotel' | 'other';
  tagLabel?: string;
  houseName: string; // e.g. "Greenfield Heights", "Shanti Niwas", "Godrej Genesis"
  houseFlat: string; // e.g. "Flat 4B, 3rd Floor"
  buildingRoad: string; // e.g. "EP Block, Street No. 12"
  landmark?: string;
  area: KolkataArea;
  lat?: number;
  lng?: number;
  formattedExactAddress?: string;
  receiverName?: string;
  receiverPhone?: string;
  createdAt?: string;
}

export interface UserReview {
  id: string;
  userName: string;
  userArea: string;
  rating: number;
  date: string;
  comment: string;
  productOrService: string;
  verifiedPurchase: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'refund' | 'cashback' | 'redemption' | 'deposit';
  title: string;
  description: string;
  amount: number;
  date: string;
  orderId?: string;
  status: 'credited' | 'debited' | 'pending';
}

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  emailVerified?: boolean;
  photoURL?: string;
  dob?: string;
  walletBalance?: number;
  refundBalance?: number;
  cashbackBalance?: number;
  savedUpiIds?: string[];
  transactions?: WalletTransaction[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReceivedEmail {
  id: string;
  from: string;
  fromName?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  receivedAt: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  category: 'quote' | 'support' | 'contractor' | 'inbound_webhook' | 'general';
  phone?: string;
  orderId?: string;
  headers?: Record<string, string>;
  attachmentsCount?: number;
  replySent?: {
    subject: string;
    sentAt: string;
    text: string;
  };
}

export type { Offer, OfferProduct, ProductOfferEvaluation } from './services/offerService';
export type { ProductReview } from './types/electrical';

