import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  HelpCircle,
  MapPin,
  CreditCard,
  Zap,
  Wallet,
  ChevronRight,
  ShoppingBag,
  Bell,
  LogOut,
  Calendar,
  Edit3,
  Star,
  CheckCircle2,
  Phone,
  Mail,
  ShieldCheck,
  Plus,
  Trash2,
  Check,
  MessageSquare,
  RefreshCw,
  Gift,
  Clock,
  KeyRound,
  Smartphone,
  Loader2,
  FileText,
  Lock,
  Heart,
  Package,
  AlertCircle,
  Truck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Order, SavedAddress, UserProfile, CartItem, WalletTransaction, Product, OrderStatus } from '../types';
import { LegalView } from './LegalViews';
import { HelpCenterChat } from './HelpCenterChat';
import {
  saveUserProfile,
  signOutUser,
  deleteAddressFromFirestore,
  deleteFirestoreOrder,
  clearAllUserOrders,
  subscribeToUpiIds,
  saveUpiToFirestore,
  deleteUpiFromFirestore,
  fetchProductsFromSupabase
} from '../services/supabaseService';
import { getFavoriteProductIds, toggleProductFavorite, clearAllFavorites } from '../services/favorites';
import { getOrderWhatsAppUrl } from '../services/emailService';

interface ProfileViewProps {
  userProfile: UserProfile | null;
  orders: Order[];
  savedAddresses: SavedAddress[];
  onBack: () => void;
  onOpenLocationModal: () => void;
  onSelectAddress?: (address: SavedAddress) => void;
  onReorder: (items: CartItem[]) => void;
  onOpenShop: () => void;
  onOpenServices: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
  onAddToCart?: (product: Product) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  orders,
  savedAddresses,
  onBack,
  onOpenLocationModal,
  onSelectAddress,
  onReorder,
  onOpenShop,
  onOpenServices,
  onProfileUpdated,
  onLogout,
  onAddToCart
}) => {
  // Current active sub-page view: 'main' | 'orders' | 'addresses' | 'payments' | 'wallet' | 'services' | 'membership' | 'help' | 'notifications' | 'privacy' | 'terms' | 'favorites'
  const [subPage, setSubPage] = useState<
    'main' | 'orders' | 'addresses' | 'payments' | 'wallet' | 'services' | 'membership' | 'help' | 'notifications' | 'privacy' | 'terms' | 'favorites'
  >('main');

  // Favorites state
  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() => getFavoriteProductIds());
  const [allCatalogProducts, setAllCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProductsFromSupabase().then((prods) => {
      if (prods && prods.length > 0) {
        setAllCatalogProducts(prods);
      }
    });
  }, []);

  useEffect(() => {
    const handleFavsChanged = () => {
      setFavoriteProductIds(getFavoriteProductIds());
    };
    window.addEventListener('giriraj_favorites_changed', handleFavsChanged);
    return () => window.removeEventListener('giriraj_favorites_changed', handleFavsChanged);
  }, []);

  const handleToggleFavorite = (productId: string) => {
    toggleProductFavorite(productId);
    setFavoriteProductIds(getFavoriteProductIds());
  };

  const favoriteProducts = allCatalogProducts.filter((p) => favoriteProductIds.includes(String(p.id)));

  // Edit Profile Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || '');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || '');
  const [editDob, setEditDob] = useState(userProfile?.dob || '');
  const [editPhotoURL, setEditPhotoURL] = useState(userProfile?.photoURL || '');

  // OTP Verification for Email Update
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [otpSentNotice, setOtpSentNotice] = useState(false);

  // 3-dots Dropdown Menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Avatar image error fallback
  const [avatarError, setAvatarError] = useState(false);

  // Past Orders Filter & Expand state
  const [orderCategoryFilter, setOrderCategoryFilter] = useState<'all' | 'active' | 'delivered' | 'materials' | 'services'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(4);
  const [ratingsState, setRatingsState] = useState<{ [orderId: string]: { userRating?: number; deliveryRating?: number } }>({});
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [confirmClearAllOrders, setConfirmClearAllOrders] = useState(false);
  const [isClearingOrders, setIsClearingOrders] = useState(false);

  const handleDeleteSingleOrder = async (order: Order) => {
    try {
      setDeletingOrderId(order.id);
      await deleteFirestoreOrder(order.id);
      setOrderToDelete(null);
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete the order. Please try again.');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleClearAllOrders = async () => {
    try {
      setIsClearingOrders(true);
      await clearAllUserOrders();
      setConfirmClearAllOrders(false);
    } catch (err) {
      console.error('Failed to clear order history:', err);
      alert('Failed to clear order history. Please try again.');
    } finally {
      setIsClearingOrders(false);
    }
  };

  // Payment state (Stored on server & Firestore)
  const [savedUpi, setSavedUpi] = useState<string[]>([]);
  const [newUpiId, setNewUpiId] = useState('');
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [upiError, setUpiError] = useState<string | null>(null);
  const [upiSuccessNotice, setUpiSuccessNotice] = useState<string | null>(null);

  // Preferences & Alerts toggle state
  const [mobileAlerts, setMobileAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Subscribe to real-time saved UPI IDs from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToUpiIds((upis) => {
      setSavedUpi(upis);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Wallet State
  const refundBalance = userProfile?.refundBalance ?? 0;
  const cashbackBalance = userProfile?.cashbackBalance ?? 0;
  const totalWalletBalance = userProfile?.walletBalance ?? (refundBalance + cashbackBalance);
  const [walletNotice, setWalletNotice] = useState<string | null>(null);

  // Reset scroll to top whenever navigating to a subpage or returning to main profile
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [subPage]);

  // Close 3-dots menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isMenuOpen]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOtpStep && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isOtpStep, otpTimer]);

  const handleOpenEdit = () => {
    setEditName(userProfile?.name || '');
    setEditEmail(userProfile?.email || '');
    setEditPhone(userProfile?.phone || '');
    setEditDob(userProfile?.dob || '');
    setEditPhotoURL(userProfile?.photoURL || '');
    setIsOtpStep(false);
    setOtpError('');
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const sendOtpForEmail = (targetEmail: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setPendingEmail(targetEmail);
    setIsOtpStep(true);
    setOtpTimer(60);
    setEnteredOtp('');
    setOtpError('');
    setOtpSentNotice(true);
    setTimeout(() => setOtpSentNotice(false), 8000);
  };

  const handleProfileFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = editEmail.trim();
    const currentEmail = userProfile?.email || '';

    // If email is changed and not empty, require OTP verification
    if (cleanEmail && cleanEmail !== currentEmail) {
      sendOtpForEmail(cleanEmail);
      return;
    }

    // Direct save if email not changed
    const updated: UserProfile = {
      ...userProfile,
      id: userProfile?.id,
      name: editName.trim(),
      email: cleanEmail,
      phone: editPhone.trim(),
      dob: editDob,
      photoURL: editPhotoURL.trim() || userProfile?.photoURL,
      refundBalance,
      cashbackBalance,
      walletBalance: totalWalletBalance
    };

    saveUserProfile(updated);
    onProfileUpdated(updated);
    setIsEditModalOpen(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp) {
      setOtpError('Invalid OTP code. Please enter the 6-digit code sent to your Gmail.');
      return;
    }

    const updated: UserProfile = {
      ...userProfile,
      id: userProfile?.id,
      name: editName.trim(),
      email: pendingEmail,
      emailVerified: true,
      phone: editPhone.trim(),
      dob: editDob,
      photoURL: editPhotoURL.trim() || userProfile?.photoURL,
      refundBalance,
      cashbackBalance,
      walletBalance: totalWalletBalance
    };

    saveUserProfile(updated);
    onProfileUpdated(updated);
    setIsOtpStep(false);
    setIsEditModalOpen(false);
  };

  const handleRateOrder = (orderId: string, type: 'user' | 'delivery', rating: number) => {
    setRatingsState((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [type === 'user' ? 'userRating' : 'deliveryRating']: rating
      }
    }));
  };

  // Sort orders descending by createdAt timestamp
  const sortedOrders = [...orders].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  const activeOrders = sortedOrders.filter((ord) => ord.status !== 'delivered' && ord.status !== 'cancelled');
  const deliveredOrders = sortedOrders.filter((ord) => ord.status === 'delivered');
  const materialsCount = sortedOrders.filter((ord) => ord.items && ord.items.length > 0).length;
  const servicesCount = sortedOrders.filter((ord) => ord.services && ord.services.length > 0).length;

  const filteredOrders = sortedOrders.filter((ord) => {
    if (orderCategoryFilter === 'active') {
      return ord.status !== 'delivered' && ord.status !== 'cancelled';
    }
    if (orderCategoryFilter === 'delivered') {
      return ord.status === 'delivered';
    }
    if (orderCategoryFilter === 'services') {
      return ord.services && ord.services.length > 0;
    }
    if (orderCategoryFilter === 'materials') {
      return ord.items && ord.items.length > 0;
    }
    return true;
  });

  const getOrderStatusConfig = (status?: OrderStatus) => {
    const s = status || 'pending';
    switch (s) {
      case 'pending':
        return {
          label: 'Order Placed',
          stepIndex: 0,
          badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
          dotColor: 'bg-amber-500',
          icon: Clock,
          description: 'Order placed & processing at Kasba Central Hub'
        };
      case 'accepted':
        return {
          label: 'Order Confirmed',
          stepIndex: 1,
          badgeColor: 'text-blue-800 bg-blue-50 border-blue-200',
          dotColor: 'bg-blue-500',
          icon: CheckCircle2,
          description: 'Verified & scheduled for express dispatch'
        };
      case 'packing':
        return {
          label: 'Packing Items',
          stepIndex: 1,
          badgeColor: 'text-indigo-800 bg-indigo-50 border-indigo-200',
          dotColor: 'bg-indigo-500',
          icon: Package,
          description: 'Cable & electrical quality check in progress'
        };
      case 'out_for_delivery':
        return {
          label: 'Out for Delivery',
          stepIndex: 2,
          badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
          dotColor: 'bg-purple-500',
          icon: Zap,
          description: 'Express Runner is on the way (60-min express)'
        };
      case 'delivered':
        return {
          label: 'Delivered',
          stepIndex: 3,
          badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
          dotColor: 'bg-emerald-500',
          icon: CheckCircle2,
          description: 'Delivered at your doorstep'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          stepIndex: -1,
          badgeColor: 'text-rose-800 bg-rose-50 border-rose-200',
          dotColor: 'bg-rose-500',
          icon: AlertCircle,
          description: 'This order was cancelled'
        };
      default:
        return {
          label: 'Processing',
          stepIndex: 0,
          badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
          dotColor: 'bg-amber-500',
          icon: Clock,
          description: 'Processing order'
        };
    }
  };

  // Calculate real savings from completed orders
  const totalSavings = orders.reduce((acc, ord) => acc + (ord.discount || 40), 120);

  // Wallet transactions from user profile or empty
  const walletTransactions: WalletTransaction[] = [];
  const filteredTransactions = walletTransactions;

  // Clean user fields (no demo name/number)
  const rawName = userProfile?.name?.trim() || '';
  const rawPhone = userProfile?.phone?.trim() || '';
  const rawEmail = userProfile?.email?.trim() || '';
  const displayDob = userProfile?.dob;
  const userPhoto = userProfile?.photoURL;

  // Flags for whether profile fields are missing (for first-time/incomplete logins)
  const hasMissingName = !rawName;
  const hasMissingPhone = !rawPhone;
  const hasMissingEmail = !rawEmail;
  const hasAnyMissingDetails = hasMissingName || hasMissingPhone || hasMissingEmail;

  const displayName = rawName || 'Set Your Name';
  const displayPhone = rawPhone;
  const displayEmail = rawEmail;

  const getInitials = (name?: string, phone?: string, email?: string) => {
    if (name && name !== 'Customer' && name !== 'Kolkata Customer' && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    if (phone && phone.trim()) {
      return phone.replace(/\D/g, '').slice(-2);
    }
    return 'GP';
  };

  // -------------------------------------------------------------
  // SUB-PAGE 0: ORDERS & PURCHASES
  // -------------------------------------------------------------
  if (subPage === 'orders') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        {/* Sticky Header with Back Button and Dynamic Counter */}
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubPage('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900">Orders History</h1>
              <p className="text-[11px] text-slate-500 font-semibold">
                {activeOrders.length > 0
                  ? `${activeOrders.length} In-Transit • ${deliveredOrders.length} Delivered`
                  : `${sortedOrders.length} Total Orders`}
              </p>
            </div>
          </div>

          {sortedOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClearAllOrders(true)}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Clear all orders history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Order Filter Tabs */}
          {sortedOrders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setOrderCategoryFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  orderCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({sortedOrders.length})
              </button>

              {activeOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderCategoryFilter('active')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    orderCategoryFilter === 'active'
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Active &amp; In-Transit ({activeOrders.length})</span>
                </button>
              )}

              {deliveredOrders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderCategoryFilter('delivered')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    orderCategoryFilter === 'delivered'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Delivered ({deliveredOrders.length})
                </button>
              )}

              {materialsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderCategoryFilter('materials')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    orderCategoryFilter === 'materials'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Materials ({materialsCount})
                </button>
              )}

              {servicesCount > 0 && (
                <button
                  type="button"
                  onClick={() => setOrderCategoryFilter('services')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    orderCategoryFilter === 'services'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Services ({servicesCount})
                </button>
              )}
            </div>
          )}

          {/* Order Cards List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-extrabold text-slate-800">
                {orderCategoryFilter === 'active' ? 'No active orders in-transit' : 'No Orders Found'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-4">
                Shop wires, switches, tools, or book wiring technicians in 60 minutes.
              </p>
              <button
                onClick={onOpenShop}
                className="px-4 py-2 bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
              >
                Shop Now
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredOrders.map((order) => {
                const orderRatings = ratingsState[order.id] || {};
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const statusCfg = getOrderStatusConfig(order.status);
                const StatusIcon = statusCfg.icon;
                const isDelivered = order.status === 'delivered';
                const isCancelled = order.status === 'cancelled';
                const isActiveOrder = !isDelivered && !isCancelled;
                const isExpanded = expandedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className={`transition-colors ${
                      isExpanded ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Header Row: Clickable Accordion Dropdown Trigger */}
                    <div
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setExpandedOrderId(isExpanded ? null : order.id);
                        }
                      }}
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                            isActiveOrder
                              ? 'bg-amber-100 border-amber-200 text-amber-950 shadow-inner'
                              : isDelivered
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-slate-100 border-slate-200 text-slate-800'
                          }`}
                        >
                          {isActiveOrder ? '⚡' : isDelivered ? '✓' : '📦'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-slate-900">
                              Order #{order.id.slice(-6).toUpperCase()}
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">
                              • {formattedDate}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {order.area} • {order.items?.length || 1} item{(order.items?.length || 1) > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right side: Amount + Status badge + chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-black text-slate-900">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                          </div>
                        </div>

                        <div
                          className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1 rounded-full border shrink-0 ${statusCfg.badgeColor}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${statusCfg.dotColor} ${isActiveOrder ? 'animate-ping' : ''}`} />
                          <span>{statusCfg.label}</span>
                          <StatusIcon className="w-3.5 h-3.5 ml-0.5" />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderToDelete(order);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-200"
                          title="Delete this order"
                          aria-label={`Delete order #${order.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div
                          className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 bg-slate-200 text-slate-900' : ''
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Dropdown Content Area */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3.5 border-t border-slate-100 bg-slate-50/50 animate-in fade-in duration-200">
                        {/* Live Tracking Stepper for Active Orders */}
                        {isActiveOrder && (
                          <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-600 fill-amber-600" />
                                <span className="text-xs font-black text-slate-900">
                                  ⚡ 60-Min Express Dispatch Tracker
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                                Live Status
                              </span>
                            </div>

                            <div className="grid grid-cols-4 gap-1 relative pt-1">
                              {[
                                { label: 'Placed', step: 0 },
                                { label: 'Confirmed', step: 1 },
                                { label: 'On Way ⚡', step: 2 },
                                { label: 'Delivered', step: 3 }
                              ].map((st, i) => {
                                const isCurrent = statusCfg.stepIndex === st.step;
                                const isPassed = statusCfg.stepIndex >= st.step;
                                return (
                                  <div key={i} className="flex flex-col items-center text-center">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all mb-1 ${
                                        isCurrent
                                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 shadow-xs'
                                          : isPassed
                                          ? 'bg-emerald-600 text-white'
                                          : 'bg-slate-200 text-slate-400'
                                      }`}
                                    >
                                      {isPassed ? '✓' : i + 1}
                                    </div>
                                    <span
                                      className={`text-[10px] font-bold leading-tight ${
                                        isCurrent
                                          ? 'text-amber-950 font-black'
                                          : isPassed
                                          ? 'text-slate-800'
                                          : 'text-slate-400'
                                      }`}
                                    >
                                      {st.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <p className="text-[11px] text-amber-950 font-medium flex items-center gap-1.5">
                                <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                <span>{statusCfg.description}</span>
                              </p>

                              <div className="flex items-center gap-2">
                                <a
                                  href={getOrderWhatsAppUrl(order, '918777400280')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>Track on WhatsApp</span>
                                </a>
                                <a
                                  href="tel:+918777400280"
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Phone className="w-3 h-3 text-slate-600" />
                                  <span>Call Hub</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Ordered Items List */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={idx} className="text-xs text-slate-800 font-semibold flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-black text-slate-900 shrink-0 px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                                    {item.quantity}X
                                  </span>
                                  <span className="truncate">
                                    {item.product.name} ({item.product.brand})
                                    {item.selectedColor ? ` [${item.selectedColor}]` : ''}
                                  </span>
                                </div>
                                <span className="font-bold text-slate-700 shrink-0">
                                  ₹{((item.product.price || 0) * item.quantity).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))
                          ) : order.services && order.services.length > 0 ? (
                            order.services.map((srv, idx) => (
                              <div key={idx} className="text-xs text-slate-800 font-semibold flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-black text-slate-900 shrink-0 px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                                    1X
                                  </span>
                                  <span className="truncate">
                                    {srv.serviceTitle} ({srv.projectType})
                                  </span>
                                </div>
                                <span className="font-bold text-slate-700 shrink-0">
                                  ₹{(srv.estimatedPrice || order.totalAmount).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-700 font-semibold">
                              Electrical &amp; Construction Supplies Order
                            </p>
                          )}
                        </div>

                        {/* Rating for Delivered Orders */}
                        {isDelivered && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-xs font-bold text-slate-700">
                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                              <span className="text-[11px] text-slate-600">Product Quality:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRateOrder(order.id, 'user', star)}
                                    className="cursor-pointer"
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 ${
                                        (orderRatings.userRating || 5) >= star
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100">
                              <span className="text-[11px] text-slate-600">Rider Delivery:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleRateOrder(order.id, 'delivery', star)}
                                    className="cursor-pointer"
                                  >
                                    <Star
                                      className={`w-3.5 h-3.5 ${
                                        (orderRatings.deliveryRating || 5) >= star
                                          ? 'text-amber-400 fill-amber-400'
                                          : 'text-slate-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delivery Destination */}
                        <div className="bg-white p-3 rounded-xl space-y-1.5 border border-slate-200/80">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>Delivery Destination</span>
                          </div>
                          <div className="text-slate-600 pl-5 space-y-0.5 text-[11px]">
                            <p className="font-semibold text-slate-800">{order.customerName} ({order.phone})</p>
                            <p>{order.address}</p>
                            {order.landmark && <p className="text-slate-500">Landmark: {order.landmark}</p>}
                            <p className="font-medium text-slate-700">{order.area}, Kolkata – {order.pincode}</p>
                          </div>
                        </div>

                        {/* Dropdown Action Buttons */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setOrderToDelete(order)}
                            className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          {order.items && order.items.length > 0 && (
                            <button
                              onClick={() => onReorder(order.items)}
                              className="px-3.5 py-1.5 bg-[#FFF0ED] hover:bg-[#FFE2DC] text-[#E23744] font-black rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer border border-[#FFD2C9]"
                            >
                              <span>REORDER</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Modal: Delete Single Order */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">Delete Order #{orderToDelete.id}?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this order from your history? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  disabled={Boolean(deletingOrderId)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSingleOrder(orderToDelete)}
                  disabled={Boolean(deletingOrderId)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {deletingOrderId === orderToDelete.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal: Clear All Orders */}
        {confirmClearAllOrders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-black text-slate-900">Clear All Order History?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This will permanently remove all {sortedOrders.length} order record{sortedOrders.length > 1 ? 's' : ''} from your account history.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmClearAllOrders(false)}
                  disabled={isClearingOrders}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAllOrders}
                  disabled={isClearingOrders}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isClearingOrders ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <span>Clear All</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 1: SAVED ADDRESSES
  // -------------------------------------------------------------
  if (subPage === 'addresses') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-2xs">
          <button
            onClick={() => setSubPage('main')}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Manage Saved Addresses</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          {savedAddresses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-extrabold text-slate-800">No Saved Addresses Found</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Pin your home, construction site, or office for fast 60-min delivery.
              </p>
              <button
                onClick={onOpenLocationModal}
                className="px-4 py-2 bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer"
              >
                Add Address Now
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex items-start justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                        {addr.tag}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">
                        {addr.houseName || addr.houseFlat || 'Address'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600">
                      {addr.formattedExactAddress || `${addr.houseFlat}, ${addr.buildingRoad}, ${addr.area.name}`}
                    </p>
                    {addr.receiverName && (
                      <p className="text-[11px] text-slate-500">
                        Contact: {addr.receiverName}
                        {(addr.receiverPhone || displayPhone) ? ` (${addr.receiverPhone || displayPhone})` : ''}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectAddress && (
                      <button
                        onClick={() => {
                          onSelectAddress(addr);
                          setSubPage('main');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Select
                      </button>
                    )}
                    <button
                      onClick={() => deleteAddressFromFirestore(addr.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Address button below saved addresses in yellow */}
              <div className="pt-2">
                <button
                  id="btn-add-address-saved-list"
                  type="button"
                  onClick={onOpenLocationModal}
                  className="w-full py-3 px-4 bg-amber-400 hover:bg-yellow-400 active:bg-amber-500 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer border border-amber-500/20"
                >
                  <Plus className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                  <span>Add New Address</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 2: SAVED PAYMENT MODES
  // -------------------------------------------------------------
  if (subPage === 'payments') {
    const handleSaveUpi = async () => {
      const clean = newUpiId.trim().toLowerCase();
      if (!clean) {
        setUpiError('Please enter a valid UPI ID (e.g. name@okhdfcbank or 98300xxxxx@upi)');
        return;
      }
      if (!clean.includes('@') || clean.length < 4) {
        setUpiError('Invalid UPI ID format. It must include "@" symbol.');
        return;
      }
      setUpiError(null);
      setIsSavingUpi(true);
      try {
        await saveUpiToFirestore(clean);
        setNewUpiId('');
        setShowAddUpi(false);
        setUpiSuccessNotice(`UPI ID ${clean} saved securely on server`);
        setTimeout(() => setUpiSuccessNotice(null), 4000);
      } catch {
        setUpiError('Could not save UPI ID to server. Please try again.');
      } finally {
        setIsSavingUpi(false);
      }
    };

    const handleDeleteUpi = async (upiToDelete: string) => {
      try {
        await deleteUpiFromFirestore(upiToDelete);
        setUpiSuccessNotice(`UPI ID ${upiToDelete} removed.`);
        setTimeout(() => setUpiSuccessNotice(null), 3000);
      } catch {
        setUpiError('Failed to remove UPI ID. Please try again.');
      }
    };

    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubPage('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-slate-900">Saved Payment Modes</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Notification / Success / Error Toasts */}
          {upiSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{upiSuccessNotice}</span>
              </div>
              <button onClick={() => setUpiSuccessNotice(null)} className="text-emerald-600 font-bold hover:text-emerald-800 cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* Add UPI Form (Expandable) */}
          {showAddUpi && (
            <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950">Add New UPI Handle (VPA)</h3>
                <button
                  onClick={() => {
                    setShowAddUpi(false);
                    setUpiError(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Enter your Google Pay, PhonePe, Paytm or bank UPI ID to save for instant checkout.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. yourname@okhdfcbank or 98300xxxxx@ybl"
                  value={newUpiId}
                  onChange={(e) => {
                    setNewUpiId(e.target.value);
                    if (upiError) setUpiError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveUpi();
                  }}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50 focus:bg-white"
                  disabled={isSavingUpi}
                  autoFocus
                />
                <button
                  onClick={handleSaveUpi}
                  disabled={isSavingUpi}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  {isSavingUpi ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save UPI ID</span>
                  )}
                </button>
              </div>
              {upiError && <p className="text-[11px] font-bold text-red-600 mt-1">{upiError}</p>}
            </div>
          )}

          {/* SAVED UPI HANDLES SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Saved UPI Handles
              </h2>
              {savedUpi.length > 0 && (
                <span className="text-[11px] font-bold text-slate-400">
                  {savedUpi.length} saved
                </span>
              )}
            </div>

            {savedUpi.length === 0 ? (
              /* Redesigned Empty State with Button to Add UPI ID */
              <div className="bg-white rounded-2xl p-7 border border-slate-200 text-center shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-slate-900">No Saved UPI Handles</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                  You haven't saved any UPI IDs yet. Add your Google Pay, PhonePe, Paytm, or bank UPI ID for 1-click express checkout.
                </p>
                {!showAddUpi && (
                  <button
                    onClick={() => {
                      setShowAddUpi(true);
                      setUpiError(null);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add UPI ID</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                {savedUpi.map((upi, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
                        UPI
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{upi}</p>
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Saved on Server for Express Checkout</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUpi(upi)}
                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove UPI handle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {!showAddUpi && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={() => {
                        setShowAddUpi(true);
                        setUpiError(null);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another UPI ID</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AVAILABLE CHECKOUT OPTIONS (Redesigned without heavy boxes) */}
          <div className="pt-2 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Available Checkout Options
            </h2>
            
            <div className="divide-y divide-slate-200">
              {/* UPI */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    UPI
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">UPI</p>
                    <p className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm, BHIM &amp; CRED</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>

              {/* Debit Card */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-2xs">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Debit Card</p>
                    <p className="text-[11px] text-slate-500">Visa, MasterCard, RuPay &amp; Maestro</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>

              {/* Credit Card */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 text-white flex items-center justify-center shadow-2xs">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Credit Card</p>
                    <p className="text-[11px] text-slate-500">All Major Banks &amp; No-Cost EMI</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>

              {/* Cash on Delivery */}
              <div className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 text-slate-950 flex items-center justify-center font-black text-xs shadow-2xs">
                    ₹
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">Cash on Delivery (COD)</p>
                    <p className="text-[11px] text-slate-500">Pay cash or scan QR upon delivery / site service</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 3: WALLET
  // -------------------------------------------------------------
  if (subPage === 'wallet') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-2xs">
          <button
            onClick={() => setSubPage('main')}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Wallet</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Main Wallet Balance Card */}
          <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-950 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" />
                  <span>Wallet Balance</span>
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                ₹{totalWalletBalance.toLocaleString('en-IN')}.00
              </div>
            </div>
          </div>

          {/* Transaction Statement */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Transaction History
            </h3>

            {filteredTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No Recent Transactions</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Refunds and wallet credits will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'refund' ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.type === 'refund' ? <RefreshCw className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{tx.title}</p>
                        <p className="text-[11px] text-slate-500">{tx.description}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 shrink-0">+ ₹{tx.amount}.00</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 4: TECHNICIANS & WIRING BOOKINGS (With Prominent Back Arrow)
  // -------------------------------------------------------------
  if (subPage === 'services') {
    return (
      <div className="min-h-screen bg-white text-black pb-20">
        <div className="border-b border-slate-200 px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setSubPage('main')}
            className="p-1.5 rounded-full hover:bg-slate-100 text-black transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="py-24 flex items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-medium text-black">
            Coming Soon
          </h1>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 5: MEMBERSHIP & SAVINGS (Giriraj Power Pro)
  // -------------------------------------------------------------
  if (subPage === 'membership') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-2xs">
          <button
            onClick={() => setSubPage('main')}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Giriraj Power Pro Membership</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-slate-950 rounded-3xl p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-950 text-yellow-300 px-2.5 py-0.5 rounded-full">
                Active Member
              </span>
            </div>
            <h2 className="text-2xl font-black">₹{totalSavings} Saved This Year</h2>
            <p className="text-xs font-bold text-slate-900/80 mt-1">
              Unlimited free 60-min express deliveries &amp; 5% instant cashback.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Your Pro Benefits</h3>
            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero delivery fees on all electrical material orders above ₹299</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct priority dispatch from Giriraj Power Kasba central distribution hub</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant refund to Giriraj Wallet on returns with 0 questions asked</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 6: HELP CENTER & SUPPORT
  // -------------------------------------------------------------
  if (subPage === 'help') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-2xs">
          <button
            onClick={() => setSubPage('main')}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Help Center & Support</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <HelpCenterChat userProfile={userProfile} />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 7: COMMUNICATION PREFERENCES
  // -------------------------------------------------------------
  if (subPage === 'notifications') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-2xs">
          <button
            onClick={() => setSubPage('main')}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to Profile"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Communication Preferences</h1>
        </div>

        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-5">
            {/* Mobile Push Notifications */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 pr-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">Mobile Push Notifications</p>
                <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-1 leading-relaxed">
                  Receive instant mobile device pop-up alerts for live driver location, flash discounts, and delivery milestone alerts
                </p>
              </div>

              {/* Reference-Styled Toggle Button */}
              <button
                id="toggle-mobile-notifications"
                type="button"
                role="switch"
                aria-checked={mobileAlerts}
                aria-label="Toggle Mobile push notifications"
                onClick={() => {
                  const nextState = !mobileAlerts;
                  setMobileAlerts(nextState);
                  if (nextState && 'Notification' in window && Notification.permission !== 'granted') {
                    Notification.requestPermission().catch(() => {});
                  }
                }}
                className={`relative inline-flex h-[32px] w-[58px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  mobileAlerts
                    ? 'bg-[#00B050] shadow-[inset_0_3px_4px_rgba(0,0,0,0.22)]'
                    : 'bg-[#C8CCD0] shadow-[inset_0_3px_4px_rgba(0,0,0,0.2)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[26px] w-[26px] rounded-full bg-[#ECEEF0] shadow-[0_2px_4px_rgba(0,0,0,0.28)] ring-0 transition-transform duration-200 ease-in-out ${
                    mobileAlerts ? 'translate-x-[29px] translate-y-[3px]' : 'translate-x-[3px] translate-y-[3px]'
                  }`}
                />
              </button>
            </div>

            {/* WhatsApp Dispatch Tracking */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex-1 pr-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">WhatsApp Dispatch Tracking</p>
                <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-1 leading-relaxed">
                  Receive live rider phone number and delivery OTP on WhatsApp
                </p>
              </div>

              {/* Reference-Styled Toggle Button */}
              <button
                id="toggle-whatsapp-tracking"
                type="button"
                role="switch"
                aria-checked={whatsappAlerts}
                aria-label="Toggle WhatsApp dispatch tracking"
                onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                className={`relative inline-flex h-[32px] w-[58px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  whatsappAlerts
                    ? 'bg-[#00B050] shadow-[inset_0_3px_4px_rgba(0,0,0,0.22)]'
                    : 'bg-[#C8CCD0] shadow-[inset_0_3px_4px_rgba(0,0,0,0.2)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[26px] w-[26px] rounded-full bg-[#ECEEF0] shadow-[0_2px_4px_rgba(0,0,0,0.28)] ring-0 transition-transform duration-200 ease-in-out ${
                    whatsappAlerts ? 'translate-x-[29px] translate-y-[3px]' : 'translate-x-[3px] translate-y-[3px]'
                  }`}
                />
              </button>
            </div>

            {/* SMS Order Status Updates */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex-1 pr-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">SMS Order Status Updates</p>
                <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-1 leading-relaxed">
                  Get packing and out-for-delivery SMS
                </p>
              </div>

              {/* Reference-Styled Toggle Button */}
              <button
                id="toggle-sms-updates"
                type="button"
                role="switch"
                aria-checked={smsAlerts}
                aria-label="Toggle SMS order status updates"
                onClick={() => setSmsAlerts(!smsAlerts)}
                className={`relative inline-flex h-[32px] w-[58px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  smsAlerts
                    ? 'bg-[#00B050] shadow-[inset_0_3px_4px_rgba(0,0,0,0.22)]'
                    : 'bg-[#C8CCD0] shadow-[inset_0_3px_4px_rgba(0,0,0,0.2)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[26px] w-[26px] rounded-full bg-[#ECEEF0] shadow-[0_2px_4px_rgba(0,0,0,0.28)] ring-0 transition-transform duration-200 ease-in-out ${
                    smsAlerts ? 'translate-x-[29px] translate-y-[3px]' : 'translate-x-[3px] translate-y-[3px]'
                  }`}
                />
              </button>
            </div>

            {/* Email Invoices & Order Summary Alerts */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex-1 pr-2">
                <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">Email Invoices &amp; Order Summaries</p>
                <p className="text-xs sm:text-[13px] text-slate-600 font-normal mt-1 leading-relaxed">
                  Receive official GST invoices, order receipts, and delivery confirmations via email
                </p>
              </div>

              {/* Reference-Styled Toggle Button */}
              <button
                id="toggle-email-updates"
                type="button"
                role="switch"
                aria-checked={emailAlerts}
                aria-label="Toggle Email invoices and order summaries"
                onClick={() => setEmailAlerts(!emailAlerts)}
                className={`relative inline-flex h-[32px] w-[58px] shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  emailAlerts
                    ? 'bg-[#00B050] shadow-[inset_0_3px_4px_rgba(0,0,0,0.22)]'
                    : 'bg-[#C8CCD0] shadow-[inset_0_3px_4px_rgba(0,0,0,0.2)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-[26px] w-[26px] rounded-full bg-[#ECEEF0] shadow-[0_2px_4px_rgba(0,0,0,0.28)] ring-0 transition-transform duration-200 ease-in-out ${
                    emailAlerts ? 'translate-x-[29px] translate-y-[3px]' : 'translate-x-[3px] translate-y-[3px]'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SUB-PAGE 8: PRIVACY POLICY (For Google OAuth Verification)
  // -------------------------------------------------------------
  if (subPage === 'privacy') {
    return <LegalView onBack={() => setSubPage('main')} type="privacy" />;
  }

  // -------------------------------------------------------------
  // SUB-PAGE 9: TERMS OF SERVICE (For Google OAuth Verification)
  // -------------------------------------------------------------
  if (subPage === 'terms') {
    return <LegalView onBack={() => setSubPage('main')} type="terms" />;
  }

  // -------------------------------------------------------------
  // SUB-PAGE 10: FAVORITE ITEMS (Dedicated White Page with Back Button)
  // -------------------------------------------------------------
  if (subPage === 'favorites') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 animate-in fade-in duration-200">
        {/* Sticky Header with Back Arrow Button */}
        <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubPage('main')}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              title="Back to Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Favourites</span>
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'} saved for quick ordering
              </p>
            </div>
          </div>

          {favoriteProducts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearAllFavorites();
                setFavoriteProductIds([]);
              }}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer px-2.5 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Content Container */}
        <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-2xs space-y-3">
              <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 mx-auto flex items-center justify-center border border-pink-100">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">No favourites yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Save electrical supplies, tools, switches, and wiring materials to your favourites for instant 1-click reordering anytime.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={onOpenShop}
                  className="px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Catalog</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 hover:border-pink-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 overflow-hidden w-full sm:w-auto">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold">
                        {product.brand}
                      </span>
                    </div>

                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-black border border-green-200">
                          <Zap className="w-3 h-3 fill-green-600" />
                          <span>60 MINS – 7 DAYS</span>
                        </span>
                        {product.discountPercentage > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 text-[10px] font-black">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Unit: {product.unit} • <span className="text-amber-600 font-bold">★ {product.rating.toFixed(1)}</span>
                      </p>

                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm sm:text-base font-black text-slate-950">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            ₹{product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(product.id)}
                      className="p-2.5 rounded-xl text-pink-600 bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer shrink-0"
                      title="Remove from Favourites"
                    >
                      <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onAddToCart) {
                          onAddToCart(product);
                        } else {
                          onReorder([{ product, quantity: 1 }]);
                        }
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIMARY VIEW: SWIGGY-STYLE PROFILE DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* 1. TOP HEADER BANNER (Full width touching top & both sides, bottom curves only) */}
      <div className="bg-gradient-to-b from-[#8B0000] via-[#A30000] to-[#B31B1B] text-white pt-3.5 pb-5 px-4 sm:px-6 relative shadow-md rounded-b-2xl border-b border-red-950/30">
        {/* Top Control Bar with Back Arrow & Actions */}
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-2.5">
          {/* Arrow Back Button */}
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all cursor-pointer flex items-center gap-1.5"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium sm:inline hidden">Back</span>
          </button>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setSubPage('help')}
              className="text-[11px] font-bold uppercase tracking-wider text-white hover:text-amber-200 transition-colors cursor-pointer px-2 py-1"
            >
              HELP
            </button>

            {/* 3-Dots Menu Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen((prev) => !prev);
                }}
                className="p-1.5 rounded-full hover:bg-white/20 active:bg-white/30 text-white transition-colors cursor-pointer relative"
                aria-label="Profile options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* 3-Dots Dropdown Pop Up */}
              {isMenuOpen && (
                <>
                  {/* Invisible Fullscreen Backdrop to dismiss on outside click */}
                  <div
                    className="fixed inset-0 z-40 bg-black/10"
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                  />

                  <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-2 z-50 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleOpenEdit();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Edit3 className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Edit Profile Details</span>
                      </div>
                      {hasAnyMissingDetails && (
                        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setSubPage('favorites');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Heart className="w-4 h-4 text-pink-500 fill-pink-500 shrink-0" />
                        <span>Favourites</span>
                      </div>
                      <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        {favoriteProducts.length}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setSubPage('addresses');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Manage Addresses</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setSubPage('wallet');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Refund &amp; Cashback Wallet</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setSubPage('privacy');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                    >
                      <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Privacy Policy</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setSubPage('terms');
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center gap-2.5 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                      <span>Terms of Service</span>
                    </button>
                    <div className="h-px bg-slate-100 my-1" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOutUser();
                        onLogout();
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Identity Details with Photo Circle (Swiggy Style) */}
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            {/* Front Circle Box: User Email Photo or Monogram */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white/60 bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-sm overflow-hidden relative">
              {userPhoto && !avatarError ? (
                <img
                  src={userPhoto}
                  alt={displayName}
                  onError={() => setAvatarError(true)}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-sm sm:text-base font-bold tracking-tight">
                  {getInitials(rawName, rawPhone, rawEmail)}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white capitalize">
                  {displayName}
                </h1>
                {hasMissingName && (
                  <span
                    onClick={handleOpenEdit}
                    className="inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-400 hover:bg-yellow-300 text-slate-950 px-2 py-0.5 rounded-full cursor-pointer shadow-xs animate-pulse"
                    title="Enter your full name"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                    Add Name
                  </span>
                )}
              </div>

              {/* Stack-wise Phone Number and Email */}
              <div className="mt-0.5 space-y-0.5 text-[11px] sm:text-xs text-white/90 font-normal">
                {displayPhone ? (
                  <p className="flex items-center gap-1.5">
                    <span className="font-medium text-white tracking-wide">{displayPhone}</span>
                    <span
                      title="Verified Phone"
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 text-white shadow-2xs shrink-0"
                    >
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleOpenEdit}
                    className="flex items-center gap-1.5 text-left text-amber-200 hover:text-white transition-colors cursor-pointer group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 ring-2 ring-yellow-200/50 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="underline decoration-dotted underline-offset-2 text-[11px] font-medium">
                      Add mobile number
                    </span>
                  </button>
                )}

                {displayEmail ? (
                  <p className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-white/85 text-[11px] sm:text-xs break-all">{displayEmail}</span>
                    {userProfile?.emailVerified && (
                      <span
                        title="Verified Email"
                        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 text-white shadow-2xs shrink-0"
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </p>
                ) : (
                  <button
                    onClick={handleOpenEdit}
                    className="flex items-center gap-1.5 text-left text-amber-200 hover:text-white transition-colors cursor-pointer group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 ring-2 ring-yellow-200/50 shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="underline decoration-dotted underline-offset-2 text-[11px] font-medium">
                      Add email address
                    </span>
                  </button>
                )}

                {displayDob && (
                  <p className="text-[11px] text-amber-200 flex items-center gap-1 font-medium pt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>
                      DOB: {new Date(displayDob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-6 mt-4 sm:mt-5 space-y-4">
        {/* VERTICAL MENU BUTTON LIST (All Open Dedicated Sub-Pages with Back Arrows) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {/* 1. Favourites */}
          <button
            id="btn-profile-favorites"
            onClick={() => setSubPage('favorites')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 border border-pink-200 text-pink-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Favourites</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {favoriteProducts.length > 0 && (
                <span className="text-xs font-normal text-pink-800 bg-pink-100 px-2.5 py-1 rounded-full">
                  {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </button>

          {/* 2. Orders History */}
          <button
            onClick={() => setSubPage('orders')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Orders History</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-normal text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                {sortedOrders.length}
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </button>

          {/* 3. Wallet */}
          <button
            onClick={() => setSubPage('wallet')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Wallet</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 4. Saved Payment Modes */}
          <button
            onClick={() => setSubPage('payments')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Saved Payment Modes</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 5. Delivery Addresses */}
          <button
            onClick={() => setSubPage('addresses')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Delivery Addresses</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 6. Communication Preferences */}
          <button
            onClick={() => setSubPage('notifications')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 border border-cyan-200 text-cyan-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Communication Preferences</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 7. Help Center */}
          <button
            onClick={() => setSubPage('help')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Help Center</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 8. Privacy Policy */}
          <button
            onClick={() => setSubPage('privacy')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Privacy Policy</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* 9. Terms of Service */}
          <button
            onClick={() => setSubPage('terms')}
            className="w-full p-4 sm:p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-normal text-slate-800">Terms of Service</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>

        {/* Separate Pill-Shaped Sign Out Button */}
        <div className="pt-3">
          <button
            id="btn-profile-signout"
            onClick={() => {
              signOutUser();
              onLogout();
            }}
            className="w-full py-3.5 px-6 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-all font-medium text-[15px] sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99]"
          >
            <LogOut className="w-5 h-5 text-white" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* App Version Tag & Build Status */}
        <div className="text-center pt-6 pb-2 space-y-1">
          <p className="text-[11px] font-bold text-slate-500">
            Giriraj Power App Version 2.4.0
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Server Deployment Sync Active</span>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          EDIT PROFILE MODAL (With OTP Verification for Gmail Updates)
          ------------------------------------------------------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            {!isOtpStep ? (
              <>
                <h3 className="text-lg font-black text-slate-900 mb-1">Edit Your Profile</h3>
                <p className="text-xs text-slate-500 mb-4 font-medium">
                  Update your details for GST invoices &amp; express Kolkata deliveries.
                </p>

                <form onSubmit={handleProfileFormSubmit} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>Full Name</span>
                        {hasMissingName && (
                          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" title="Name is required" />
                        )}
                      </label>
                    </div>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>Gmail / Email Address</span>
                        {hasMissingEmail && (
                          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" title="Email is required" />
                        )}
                      </label>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        Requires OTP verification
                      </span>
                    </div>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      placeholder="Enter your email (e.g. name@gmail.com)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>Mobile Number</span>
                        {hasMissingPhone && (
                          <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block animate-pulse" title="Mobile number is required" />
                        )}
                      </label>
                    </div>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Date of Birth (Optional)
                    </label>
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Used for exclusive birthday loyalty cashbacks and discounts.
                    </p>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* OTP VERIFICATION VIEW FOR EMAIL UPDATE */
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <KeyRound className="w-6 h-6" />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-black text-slate-900">Verify Your Gmail Address</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    We sent a 6-digit verification security code to:
                  </p>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{pendingEmail}</p>
                </div>

                {/* Simulated Live Toast Notice showing the OTP */}
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1">
                  <p className="font-extrabold text-amber-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-700" />
                    <span>Gmail Security OTP Dispatched</span>
                  </p>
                  <p className="text-slate-700 text-[11px]">
                    Your 6-digit verification code is:{' '}
                    <span className="font-black text-slate-950 bg-amber-200/80 px-1.5 py-0.5 rounded tracking-widest text-xs">
                      {generatedOtp}
                    </span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.4em] text-lg font-black px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-900 bg-white"
                      autoFocus
                    />
                  </div>

                  {otpError && (
                    <p className="text-xs text-red-600 font-bold text-center">{otpError}</p>
                  )}

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                    <span>
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Code expired?'}
                    </span>
                    <button
                      type="button"
                      disabled={otpTimer > 0}
                      onClick={() => sendOtpForEmail(pendingEmail)}
                      className={`font-bold ${
                        otpTimer > 0
                          ? 'text-slate-400 cursor-not-allowed'
                          : 'text-amber-600 hover:text-amber-700 cursor-pointer'
                      }`}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOtpStep(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs transition-all shadow-xs cursor-pointer"
                    >
                      Verify &amp; Save
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
