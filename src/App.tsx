import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Product, CartItem, KolkataArea, SavedAddress, Order, WiringServiceBooking, UserProfile } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { KOLKATA_AREAS } from './data/kolkataAreas';
import { Header } from './components/Header';
import { LocationModal } from './components/LocationModal';
import { DeviceLocationPromptModal } from './components/DeviceLocationPromptModal';
import { LoginPage } from './components/LoginPage';
import { ProfileView } from './components/ProfileView';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WiringServices } from './components/WiringServices';
import { CartView } from './components/CartView';
import { MapsGroundingAssistant } from './components/MapsGroundingAssistant';
import { OrderHistoryView } from './components/OrderHistoryView';
import { Footer } from './components/Footer';
import { LegalView } from './components/LegalViews';
import { ResetPassword } from './components/ResetPassword';
import { ElectricalListingPage } from './components/electrical/ElectricalListingPage';
import { supabase } from './lib/supabaseClient';
import { ProductDetailPage } from './components/electrical/ProductDetailPage';
import { ConstructionPage } from './components/ConstructionPage';
import { HomePage } from './components/HomePage';
import { FloatingBottomNav } from './components/FloatingBottomNav';
import { InstallAppModal } from './components/InstallAppModal';
import { SEOHead } from './components/SEOHead';
import {
  trackPageView,
  trackAddToCart as trackGAAddToCart,
  trackRemoveFromCart as trackGARemoveFromCart,
  trackProductView,
  initShareReferralTracker
} from './utils/analytics';
import { hapticLight, hapticMedium, hapticWarning } from './utils/haptics';
import {
  fetchCartItemsFromSupabase,
  syncCartItemToSupabase,
  removeCartItemFromSupabase,
  clearCartInSupabase
} from './services/cartService';
import {
  getSavedUserProfile,
  subscribeToOrders,
  subscribeToAddresses,
  ACTIVE_SAVED_ADDRESS_KEY,
  onAuthStateChange,
  getInitialAuthSession,
  fetchProductsFromSupabase,
  fetchUserProfileFromSupabase,
  safeGetItem,
  safeSetItem,
  getUserScopeKeyFromUser,
  setActiveUserScope
} from './services/supabaseService';
import { useVersionCheck } from './hooks/useVersionCheck';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import { initPushNotifications } from './services/pushNotificationService';
import { showToast } from './utils/toast';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide native splash screen once React component mounts
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(() => {});
    }
  }, []);

  // Silent Background Version Check & Cache Invalidation (no popups, no blinking reloads)
  useVersionCheck({
    intervalMs: 60000,
    onMismatch: () => {
      // Silently refresh products from Supabase in the background
      fetchProductsFromSupabase()
        .then((freshProducts) => {
          if (freshProducts && freshProducts.length > 0) {
            setProducts(freshProducts);
          }
        })
        .catch(() => {});
    }
  });

  // State Management
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [currentArea, setCurrentArea] = useState<KolkataArea>(KOLKATA_AREAS[3]); // Default: Salt Lake Sector V
  const [activeSavedAddress, setActiveSavedAddress] = useState<SavedAddress | null>(() => {
    try {
      const stored = safeGetItem(ACTIVE_SAVED_ADDRESS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const getActiveTabFromLocation = (): 'home' | 'catalog' | 'services' | 'orders' | 'profile' | 'cart' | 'privacy' | 'terms' | 'electrical' | 'construction' => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/electrical')) return 'electrical';
    if (path.startsWith('/construction')) return 'construction';
    if (path === '/privacy' || path === '/privacy-policy') return 'privacy';
    if (path === '/terms' || path === '/terms-of-service') return 'terms';
    if (path === '/services') return 'services';
    if (path === '/orders') return 'orders';
    if (path === '/profile') return 'profile';
    if (path === '/cart') return 'cart';
    return 'home';
  };

  const activeTab = getActiveTabFromLocation();
  const [activeCategory, setActiveCategory] = useState<string>(() => {
    if (location.pathname.startsWith('/electrical')) return 'electrical';
    if (location.pathname.startsWith('/construction')) return 'construction';
    return 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals & Panels
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDeviceLocationPromptOpen, setIsDeviceLocationPromptOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedProductQuickView, setSelectedProductQuickView] = useState<Product | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getSavedUserProfile());
  const [userPhone, setUserPhone] = useState<string | null>(() => getSavedUserProfile()?.phone || null);
  const [userName, setUserName] = useState<string>(() => getSavedUserProfile()?.name || '');

  // Initialize stored user profile, auth listener, live orders & saved addresses
  useEffect(() => {
    let unsubscribeOrders: (() => void) | null = null;
    let unsubscribeAddresses: (() => void) | null = null;

    const setupUserSubscriptions = () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeAddresses) unsubscribeAddresses();

      unsubscribeOrders = subscribeToOrders((allOrders) => {
        setOrders(allOrders);
      });

      unsubscribeAddresses = subscribeToAddresses((allAddrs) => {
        setSavedAddresses(allAddrs);
      });

      fetchCartItemsFromSupabase()
        .then((dbCart) => {
          if (dbCart !== null) {
            setCartItems(dbCart);
          }
        })
        .catch(console.warn);
    };

    // Initial session check
    getInitialAuthSession().then(({ session, user }) => {
      if (user) {
        const scope = getUserScopeKeyFromUser(user);
        if (scope) {
          setActiveUserScope(scope);
        }
        const userMeta = user.user_metadata || {};
        const local = getSavedUserProfile(scope || undefined);
        const phone = user.phone || userMeta.phone || local?.phone || '';
        const name = userMeta.full_name || userMeta.name || local?.name || (user.email ? user.email.split('@')[0] : 'Customer');
        const email = user.email || local?.email || '';
        const photoURL = userMeta.avatar_url || userMeta.picture || local?.photoURL || undefined;
        const dob = userMeta.dob || userMeta.birth_date || userMeta.date_of_birth || local?.dob || '';
        const prof: UserProfile = {
          id: user.id,
          phone,
          name,
          email,
          emailVerified: !!user.email_confirmed_at || !!user.confirmed_at || local?.emailVerified || true,
          photoURL,
          dob,
          walletBalance: local?.walletBalance || 0,
          refundBalance: local?.refundBalance || 0,
          cashbackBalance: local?.cashbackBalance || 0
        };
        setUserProfile(prof);
        fetchUserProfileFromSupabase(user.id)
          .then((cloudProf) => {
            if (cloudProf) {
              const merged: UserProfile = {
                ...prof,
                ...cloudProf,
                id: user.id,
                name: cloudProf.name || prof.name,
                phone: cloudProf.phone || prof.phone,
                email: cloudProf.email || prof.email,
                dob: cloudProf.dob || prof.dob,
                photoURL: cloudProf.photoURL || prof.photoURL,
                walletBalance: cloudProf.walletBalance ?? prof.walletBalance,
                refundBalance: cloudProf.refundBalance ?? prof.refundBalance,
                cashbackBalance: cloudProf.cashbackBalance ?? prof.cashbackBalance,
              };
              setUserProfile(merged);
              if (scope) {
                safeSetItem(`giriraj_profile_${scope}`, JSON.stringify(merged));
              }
              if (merged.phone) {
                setUserPhone(merged.phone);
              }
              if (merged.name) {
                setUserName(merged.name);
              }
            }
          })
          .catch((err) => {
            console.debug('[Supabase] Background profile fetch skipped/failed:', err);
          });
        setUserPhone(phone || null);
        setUserName(name);
        setupUserSubscriptions();
      } else {
        setUserProfile(null);
        setUserPhone(null);
        setUserName('');
        setOrders([]);
        setSavedAddresses([]);
      }
    }).finally(() => {
      setIsAuthLoading(false);
      // Clean up OAuth tokens from URL if returning from Supabase redirect
      if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch {
          // ignore
        }
      }
    });

    const unsubAuth = onAuthStateChange((event, session, user) => {
      if (user) {
        const scope = getUserScopeKeyFromUser(user);
        if (scope) {
          setActiveUserScope(scope);
        }
        const userMeta = user.user_metadata || {};
        const local = getSavedUserProfile(scope || undefined);
        const phone = user.phone || userMeta.phone || local?.phone || '';
        const name = userMeta.full_name || userMeta.name || local?.name || (user.email ? user.email.split('@')[0] : 'Customer');
        const email = user.email || local?.email || '';
        const photoURL = userMeta.avatar_url || userMeta.picture || local?.photoURL || undefined;
        const dob = userMeta.dob || userMeta.birth_date || userMeta.date_of_birth || local?.dob || '';
        const prof: UserProfile = {
          id: user.id,
          phone,
          name,
          email,
          emailVerified: !!user.email_confirmed_at || !!user.confirmed_at || local?.emailVerified || true,
          photoURL,
          dob,
          walletBalance: local?.walletBalance || 0,
          refundBalance: local?.refundBalance || 0,
          cashbackBalance: local?.cashbackBalance || 0
        };
        setUserProfile(prof);
        fetchUserProfileFromSupabase(user.id)
          .then((cloudProf) => {
            if (cloudProf) {
              const merged: UserProfile = {
                ...prof,
                ...cloudProf,
                id: user.id,
                name: cloudProf.name || prof.name,
                phone: cloudProf.phone || prof.phone,
                email: cloudProf.email || prof.email,
                dob: cloudProf.dob || prof.dob,
                photoURL: cloudProf.photoURL || prof.photoURL,
                walletBalance: cloudProf.walletBalance ?? prof.walletBalance,
                refundBalance: cloudProf.refundBalance ?? prof.refundBalance,
                cashbackBalance: cloudProf.cashbackBalance ?? prof.cashbackBalance,
              };
              setUserProfile(merged);
              if (scope) {
                safeSetItem(`giriraj_profile_${scope}`, JSON.stringify(merged));
              }
              if (merged.phone) {
                setUserPhone(merged.phone);
              }
              if (merged.name) {
                setUserName(merged.name);
              }
            }
          })
          .catch((err) => {
            console.debug('[Supabase] Background profile fetch skipped/failed:', err);
          });
        setUserPhone(phone || null);
        setUserName(name);
        setupUserSubscriptions();
      } else {
        setActiveUserScope(null);
        setUserProfile(null);
        setUserPhone(null);
        setUserName('');
        setOrders([]);
        setSavedAddresses([]);
        setCartItems([]);
      }
    });

    const handleLogoutEvent = () => {
      setUserProfile(null);
      setUserPhone(null);
      setUserName('');
      setOrders([]);
      setSavedAddresses([]);
      setCartItems([]);
    };
    window.addEventListener('giriraj_user_logged_out', handleLogoutEvent);

    // Initial default subscriptions for guests
    unsubscribeOrders = subscribeToOrders((allOrders) => {
      setOrders(allOrders);
    });

    unsubscribeAddresses = subscribeToAddresses((allAddrs) => {
      setSavedAddresses(allAddrs);
      if (allAddrs.length > 0) {
        setActiveSavedAddress((curr) => {
          if (curr && allAddrs.some((a) => a.id === curr.id)) {
            return curr;
          }
          const defaultAddr = allAddrs[0];
          try {
            localStorage.setItem(ACTIVE_SAVED_ADDRESS_KEY, JSON.stringify(defaultAddr));
          } catch {}
          if (defaultAddr.area) {
            setCurrentArea(defaultAddr.area);
          }
          return defaultAddr;
        });
      }
    });

    // Load live catalog directly from Supabase (Strict Database Mode)
    fetchProductsFromSupabase()
      .then((data) => {
        if (data && data.length > 0) setProducts(data);
      })
      .catch(console.warn);

    // Real-time listener: updates automatically whenever products table changes in Supabase
    const prodChannel = supabase
      .channel('app_products_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          fetchProductsFromSupabase()
            .then((data) => {
              if (data && data.length > 0) {
                setProducts(data);
              }
            })
            .catch(console.warn);
        }
      )
      .subscribe();

    return () => {
      unsubAuth();
      supabase.removeChannel(prodChannel);
      window.removeEventListener('giriraj_user_logged_out', handleLogoutEvent);
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeAddresses) unsubscribeAddresses();
    };
  }, []);

  // Deep Link Listener for Native Capacitor App (buildnow://product/:id, etc.)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleDeepUrl = (urlStr: string) => {
      try {
        if (!urlStr) return;

        // Check if OAuth callback with tokens or auth code
        if (urlStr.includes('#access_token') || urlStr.includes('?access_token') || urlStr.includes('code=')) {
          // If Supabase redirected back via custom scheme (buildnow://login#access_token=...)
          const hashIdx = urlStr.indexOf('#');
          if (hashIdx !== -1) {
            const hash = urlStr.substring(hashIdx + 1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              }).catch((e) => console.warn('Supabase setSession from deep link notice:', e));
            }
          }
          navigate('/orders');
          return;
        }

        let path = '';
        if (urlStr.startsWith('buildnow://')) {
          const raw = urlStr.replace('buildnow://', '');
          path = raw.startsWith('/') ? raw : `/${raw}`;
        } else {
          const parsed = new URL(urlStr);
          path = parsed.pathname;
        }

        const cleanPath = path.replace(/\/+$/, '');
        const segments = cleanPath.split('/').filter(Boolean);

        // Case 1: Product deep link e.g. buildnow://product/:id
        if (segments.includes('product')) {
          const prodIdx = segments.indexOf('product');
          const productId = segments[prodIdx + 1];
          if (productId) {
            navigate(`/product/${encodeURIComponent(productId)}`);
            return;
          }
        }

        // Case 2: Standard route deep links (e.g. buildnow://electrical, buildnow://orders, etc.)
        if (segments.length > 0) {
          navigate(`/${segments.join('/')}`);
        }
      } catch (err) {
        console.warn('Error handling deep link URL:', err, urlStr);
      }
    };

    // Listen for runtime deep link events (app already open or resumed from background)
    const listenerPromise = CapApp.addListener('appUrlOpen', (data) => {
      handleDeepUrl(data.url);
    });

    // Check cold-start launch URL
    CapApp.getLaunchUrl()
      .then((launchData) => {
        if (launchData?.url) {
          handleDeepUrl(launchData.url);
        }
      })
      .catch((err) => console.warn('Capacitor getLaunchUrl notice:', err));

    return () => {
      listenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  }, [navigate]);

  // Initialize @capacitor/push-notifications for real-time order status updates & alerts
  useEffect(() => {
    initPushNotifications((targetPath, orderId) => {
      if (orderId) {
        navigate(`/orders?orderId=${encodeURIComponent(orderId)}`);
      } else if (targetPath) {
        navigate(targetPath);
      }
    }).catch((err) => console.warn('Push notification init notice:', err));

    const handleForegroundPush = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { title, body } = customEvent.detail || {};
      if (title) {
        showToast(`${title}: ${body || 'Order status update received'}`, 'success', 5000);
      }
    };

    window.addEventListener('giriraj:order-push-received', handleForegroundPush);
    return () => {
      window.removeEventListener('giriraj:order-push-received', handleForegroundPush);
    };
  }, [navigate]);

  // Check device location permission on app open; if not granted/closed, show bottom popup
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem('buildnow_device_loc_prompt_dismissed');
      if (dismissed === 'true') return;
    } catch {}

    const timer = setTimeout(async () => {
      try {
        if ('permissions' in navigator && navigator.permissions?.query) {
          const status = await navigator.permissions.query({ name: 'geolocation' });
          if (status.state !== 'granted') {
            setIsDeviceLocationPromptOpen(true);
          }
          status.onchange = () => {
            if (status.state === 'granted') {
              setIsDeviceLocationPromptOpen(false);
            }
          };
        } else {
          setIsDeviceLocationPromptOpen(true);
        }
      } catch {
        setIsDeviceLocationPromptOpen(true);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const handleCloseDeviceLocationPrompt = () => {
    setIsDeviceLocationPromptOpen(false);
    try {
      sessionStorage.setItem('buildnow_device_loc_prompt_dismissed', 'true');
    } catch {}
  };

  // Global Scroll Reset, GA4 Page View, and Shared Link Referral detection on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    initShareReferralTracker(location.pathname, location.search);
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  // Cart Helpers
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleAddToCart = (product: Product) => {
    const productCol = product.selectedColor || undefined;
    hapticMedium();
    trackGAAddToCart(product, 1, productCol);
    setCartItems((prev) => {
      const existing = prev.find(
        (i) =>
          i.product.id === product.id &&
          (i.selectedColor || i.product.selectedColor) === productCol
      );
      const newQty = existing ? Math.min(100, existing.quantity + 1) : 1;
      syncCartItemToSupabase(product.id, newQty, productCol).catch(() => {});
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id &&
          (i.selectedColor || i.product.selectedColor) === productCol
            ? { ...i, quantity: newQty }
            : i
        );
      }
      return [...prev, { product, quantity: 1, selectedColor: productCol }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number, color?: string) => {
    if (delta > 0) {
      hapticLight();
    } else {
      hapticLight();
    }
    setCartItems((prev) => {
      return prev
        .map((i) => {
          const matchColor = color !== undefined ? (i.selectedColor || i.product.selectedColor) === color : true;
          if (i.product.id === productId && matchColor) {
            const newQty = i.quantity + delta;
            if (delta > 0) {
              trackGAAddToCart(i.product, delta, i.selectedColor);
            } else if (delta < 0) {
              trackGARemoveFromCart(i.product, Math.abs(delta));
            }
            if (newQty <= 0) {
              hapticWarning();
              removeCartItemFromSupabase(productId).catch(() => {});
              return null; // remove from cart when reaching 0
            }
            syncCartItemToSupabase(productId, Math.min(100, newQty), color).catch(() => {});
            return { ...i, quantity: Math.min(100, newQty) };
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveCartItem = (productId: string, color?: string) => {
    hapticWarning();
    removeCartItemFromSupabase(productId).catch(() => {});
    setCartItems((prev) => {
      const itemToRemove = prev.find(
        (i) =>
          i.product.id === productId &&
          (color === undefined || (i.selectedColor || i.product.selectedColor) === color)
      );
      if (itemToRemove) {
        trackGARemoveFromCart(itemToRemove.product, itemToRemove.quantity);
      }
      return prev.filter(
        (i) =>
          !(
            i.product.id === productId &&
            (color === undefined || (i.selectedColor || i.product.selectedColor) === color)
          )
      );
    });
  };

  const handleClearCart = () => {
    hapticWarning();
    clearCartInSupabase().catch(() => {});
    setCartItems([]);
  };

  const handleUpdateItemColor = (productId: string, oldColor: string | undefined, newColor: string) => {
    setCartItems((prev) => {
      const existingNewColorIndex = prev.findIndex(
        (i) => i.product.id === productId && (i.selectedColor || i.product.selectedColor) === newColor
      );

      const targetItemIndex = prev.findIndex(
        (i) => i.product.id === productId && (i.selectedColor || i.product.selectedColor) === oldColor
      );

      if (targetItemIndex === -1) return prev;

      const targetItem = prev[targetItemIndex];

      // If item with newColor already exists in cart, merge quantities
      if (existingNewColorIndex !== -1 && existingNewColorIndex !== targetItemIndex) {
        const mergedQty = Math.min(100, prev[existingNewColorIndex].quantity + targetItem.quantity);
        syncCartItemToSupabase(productId, mergedQty, newColor).catch(() => {});
        return prev
          .filter((_, idx) => idx !== targetItemIndex)
          .map((item, idx) =>
            idx === (existingNewColorIndex > targetItemIndex ? existingNewColorIndex - 1 : existingNewColorIndex)
              ? { ...item, quantity: mergedQty, selectedColor: newColor }
              : item
          );
      }

      // Otherwise just change the color of the target item
      syncCartItemToSupabase(productId, targetItem.quantity, newColor).catch(() => {});
      return prev.map((item, idx) =>
        idx === targetItemIndex
          ? {
              ...item,
              selectedColor: newColor,
              product: {
                ...item.product,
                selectedColor: newColor
              }
            }
          : item
      );
    });
  };

  // Header Tab change handler with react-router navigation
  const handleTabChange = (tab: string) => {
    if (tab === 'home') {
      navigate('/');
    } else if (tab === 'electrical') {
      navigate('/electrical');
    } else if (tab === 'construction') {
      navigate('/construction');
    } else if (tab === 'services') {
      navigate('/services');
    } else if (tab === 'orders') {
      navigate('/orders');
    } else if (tab === 'profile') {
      navigate('/profile');
    } else if (tab === 'cart') {
      navigate('/cart');
    } else if (tab === 'privacy') {
      navigate('/privacy');
    } else if (tab === 'terms') {
      navigate('/terms');
    }
  };

  const handleCategorySelect = (cat: string) => {
    hapticLight();
    setActiveCategory(cat);
    if (cat === 'electrical') {
      navigate('/electrical');
    } else if (cat === 'construction') {
      navigate('/construction');
    } else {
      navigate('/');
    }
  };

  const isAuthenticated = Boolean(userProfile?.id || userProfile?.email || userProfile?.phone || userPhone);

  const handleAuthSuccess = async (phone: string, name: string, email?: string) => {
    const photo = safeGetItem('giriraj_user_photo') || undefined;
    let finalPhone = phone || '';
    let finalName = name || '';

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const cloudProf = await fetchUserProfileFromSupabase(user.id);
        if (cloudProf) {
          if (cloudProf.phone) finalPhone = cloudProf.phone;
          if (cloudProf.name) finalName = cloudProf.name;
          setUserProfile(cloudProf);
          setUserPhone(cloudProf.phone || null);
          setUserName(cloudProf.name || '');
          navigate('/');
          return;
        }
      }
    } catch {}

    const prof: UserProfile = {
      id: userProfile?.id,
      phone: finalPhone,
      name: finalName || 'Customer',
      email: email || '',
      emailVerified: Boolean(email),
      photoURL: photo,
      dob: userProfile?.dob || safeGetItem('giriraj_user_dob') || ''
    };
    setUserProfile(prof);
    setUserPhone(finalPhone || null);
    setUserName(finalName || '');
    navigate('/');
  };

  // 1. If auth session is still checking on app launch, show brand loading screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <SEOHead />
        <div className="flex flex-col items-center space-y-3 animate-pulse">
          <img
            src="/buildnow.png"
            alt="BuildNow Logo"
            className="w-16 h-16 object-contain rounded-2xl shadow-sm border border-slate-200 bg-white p-1"
          />
          <div className="text-3xl font-bold font-bodoni flex items-center justify-center">
            <span className="text-slate-950">Build</span>
            <span className="text-[#00875a]">Now</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold">Starting secure session...</p>
        </div>
      </div>
    );
  }

  // 2. If user is NOT logged in, require login first before accessing store & features
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex flex-col text-slate-900 selection:bg-yellow-400 selection:text-black">
        <SEOHead />
        <main className="flex-1">
          <Routes>
            {/* Standalone Legal & Policy Pages */}
            <Route path="/about" element={<LegalView onBack={() => navigate('/login')} type="about" />} />
            <Route path="/about-us" element={<LegalView onBack={() => navigate('/login')} type="about" />} />
            <Route path="/faqs" element={<LegalView onBack={() => navigate('/login')} type="faqs" />} />
            <Route path="/faq" element={<LegalView onBack={() => navigate('/login')} type="faqs" />} />
            <Route path="/refund-policy" element={<LegalView onBack={() => navigate('/login')} type="refund" />} />
            <Route path="/refunds" element={<LegalView onBack={() => navigate('/login')} type="refund" />} />
            <Route path="/shipping-policy" element={<LegalView onBack={() => navigate('/login')} type="shipping" />} />
            <Route path="/shipping" element={<LegalView onBack={() => navigate('/login')} type="shipping" />} />
            <Route path="/privacy" element={<LegalView onBack={() => navigate('/login')} type="privacy" />} />
            <Route path="/privacy-policy" element={<LegalView onBack={() => navigate('/login')} type="privacy" />} />
            <Route path="/terms" element={<LegalView onBack={() => navigate('/login')} type="terms" />} />
            <Route path="/terms-of-service" element={<LegalView onBack={() => navigate('/login')} type="terms" />} />
            <Route path="/reset-password" element={<ResetPassword onOpenAuth={() => navigate('/login')} />} />
            
            {/* All other routes (home, catalog, cart, profile, etc.) require login */}
            <Route path="*" element={<LoginPage onAuthSuccess={handleAuthSuccess} />} />
          </Routes>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900 selection:bg-yellow-400 selection:text-black">
      {/* Dynamic SEO Meta & Structured Data Manager */}
      <SEOHead />
      
      {/* Top Header - Hidden when viewing profile */}
      {location.pathname !== '/profile' && (
        <Header
          currentArea={currentArea}
          activeAddress={activeSavedAddress}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={cartCount}
          cartTotal={cartTotal}
          onOpenCart={() => navigate('/cart')}
          userPhone={userPhone}
          userName={userName}
          userPhoto={userProfile?.photoURL}
          userProfile={userProfile}
          onOpenAuth={() => navigate('/profile')}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeCategory={activeCategory}
          onSelectCategory={handleCategorySelect}
          onOpenInstallApp={() => setIsInstallModalOpen(true)}
        />
      )}

      {/* Main App Content View with Routes */}
      <main className="flex-1 pb-20 sm:pb-24">
        <Routes>
          {/* FLIPKART-STYLE ELECTRICAL LISTING PAGE */}
          <Route
            path="/electrical"
            element={
              <ElectricalListingPage
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                cartItems={cartItems}
                onOpenCart={() => navigate('/cart')}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            }
          />

          {/* FLIPKART-STYLE PRODUCT DETAIL PAGES */}
          <Route
            path="/electrical/product/:id"
            element={
              <ProductDetailPage
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
                onOpenCart={() => navigate('/cart')}
                userProfile={userProfile}
                onOpenAuth={() => navigate('/login')}
              />
            }
          />
          <Route
            path="/construction/product/:id"
            element={
              <ProductDetailPage
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
                onOpenCart={() => navigate('/cart')}
                userProfile={userProfile}
                onOpenAuth={() => navigate('/login')}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetailPage
                onAddToCart={handleAddToCart}
                cartItems={cartItems}
                onOpenCart={() => navigate('/cart')}
                userProfile={userProfile}
                onOpenAuth={() => navigate('/login')}
              />
            }
          />

          {/* DEDICATED CONSTRUCTION MATERIALS PAGE */}
          <Route
            path="/construction"
            element={
              <ConstructionPage
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                cartItems={cartItems}
                onOpenCart={() => navigate('/cart')}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenProductQuickView={(prod) => {
                  setSelectedProductQuickView(prod);
                  trackProductView(prod);
                }}
              />
            }
          />

          {/* CART VIEW */}
          <Route
            path="/cart"
            element={
              <CartView
                items={cartItems}
                onUpdateQuantity={handleUpdateCartQuantity}
                onUpdateItemColor={handleUpdateItemColor}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
                currentArea={currentArea}
                activeAddress={activeSavedAddress}
                savedAddresses={savedAddresses}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                userPhone={userPhone}
                userProfile={userProfile}
                onOpenAuth={() => navigate('/login')}
                onAddToCart={handleAddToCart}
                onOrderPlaced={(newOrder) => {
                  navigate('/orders');
                }}
                onContinueShopping={() => navigate('/electrical')}
              />
            }
          />

          {/* PROFILE VIEW */}
          <Route
            path="/profile"
            element={
              <ProfileView
                userProfile={userProfile}
                orders={orders}
                savedAddresses={savedAddresses}
                allProducts={products}
                onBack={() => navigate('/')}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                onSelectAddress={(addr) => {
                  setActiveSavedAddress(addr);
                  setCurrentArea(addr.area);
                }}
                onAddToCart={handleAddToCart}
                onReorder={(reorderItems) => {
                  reorderItems.forEach((item) => {
                    handleAddToCart(item.product);
                  });
                  navigate('/cart');
                }}
                onOpenShop={() => navigate('/electrical')}
                onOpenServices={() => navigate('/services')}
                onProfileUpdated={(updated) => {
                  setUserProfile(updated);
                  setUserPhone(updated.phone || null);
                  setUserName(updated.name || '');
                }}
                onLogout={() => {
                  setUserProfile(null);
                  setUserPhone(null);
                  setUserName('');
                  navigate('/');
                }}
              />
            }
          />

          {/* SERVICES VIEW */}
          <Route
            path="/services"
            element={
              <WiringServices
                currentArea={currentArea}
                onBookService={(booking: WiringServiceBooking) => {
                  console.log('Wiring service booked', booking);
                }}
                userPhone={userPhone}
                onBack={() => navigate('/')}
              />
            }
          />

          {/* ORDERS VIEW */}
          <Route
            path="/orders"
            element={
              <OrderHistoryView
                orders={orders}
                onOpenShop={() => navigate('/electrical')}
              />
            }
          />

          {/* LEGAL & COMPANY VIEWS */}
          <Route path="/about" element={<LegalView onBack={() => navigate('/')} type="about" />} />
          <Route path="/about-us" element={<LegalView onBack={() => navigate('/')} type="about" />} />
          <Route path="/faqs" element={<LegalView onBack={() => navigate('/')} type="faqs" />} />
          <Route path="/faq" element={<LegalView onBack={() => navigate('/')} type="faqs" />} />
          <Route path="/refund-policy" element={<LegalView onBack={() => navigate('/')} type="refund" />} />
          <Route path="/refunds" element={<LegalView onBack={() => navigate('/')} type="refund" />} />
          <Route path="/shipping-policy" element={<LegalView onBack={() => navigate('/')} type="shipping" />} />
          <Route path="/shipping" element={<LegalView onBack={() => navigate('/')} type="shipping" />} />
          <Route path="/privacy" element={<LegalView onBack={() => navigate('/')} type="privacy" />} />
          <Route path="/privacy-policy" element={<LegalView onBack={() => navigate('/')} type="privacy" />} />
          <Route path="/terms" element={<LegalView onBack={() => navigate('/')} type="terms" />} />
          <Route path="/terms-of-service" element={<LegalView onBack={() => navigate('/')} type="terms" />} />

          {/* PASSWORD RESET */}
          <Route path="/reset-password" element={<ResetPassword onOpenAuth={() => navigate('/login')} />} />

          {/* AUTH REDIRECTS WHEN ALREADY LOGGED IN */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />

          {/* HOME / DEFAULT ROUTE - MODERN WHOLESALE B2B & B2C HOME */}
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateCartQuantity}
                cartItems={cartItems}
                onNavigateCategory={(categoryName) => {
                  if (categoryName.toLowerCase().includes('wire') || categoryName.toLowerCase().includes('switch') || categoryName.toLowerCase().includes('electric')) {
                    setActiveCategory('electrical');
                    navigate('/electrical');
                  } else {
                    setActiveCategory('construction');
                    navigate('/construction');
                  }
                }}
                onOpenProductQuickView={(prod) => {
                  setSelectedProductQuickView(prod);
                  trackProductView(prod);
                }}
              />
            }
          />
        </Routes>
      </main>

      {/* Row 11: Company, Policy & Contact Footer (Hidden on Electrical and Construction pages) */}
      {(location.pathname === '/' ||
        location.pathname.startsWith('/about') ||
        location.pathname.startsWith('/faq') ||
        location.pathname.startsWith('/refund') ||
        location.pathname.startsWith('/shipping') ||
        location.pathname.startsWith('/privacy') ||
        location.pathname.startsWith('/terms')) && (
        <Footer
          onOpenInstallApp={() => setIsInstallModalOpen(true)}
        />
      )}

      {/* Floating Liquid Glass Bottom Navigation (Visible on discovery & catalog views: Home, Electrical, Construction, and Wiring/Services) */}
      {(location.pathname === '/' ||
        location.pathname === '/electrical' ||
        location.pathname === '/construction' ||
        location.pathname === '/services' ||
        location.pathname.startsWith('/services')) &&
        !selectedProductQuickView && (
        <FloatingBottomNav
          activeTab={activeTab}
          activeCategory={activeCategory}
          onTabChange={handleTabChange}
          onSelectCategory={handleCategorySelect}
        />
      )}

      {/* Modals & Slide-Overs */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
      <DeviceLocationPromptModal
        isOpen={isDeviceLocationPromptOpen}
        onClose={handleCloseDeviceLocationPrompt}
        savedAddresses={savedAddresses}
        currentArea={currentArea}
        activeAddress={activeSavedAddress}
        onSelectArea={(area, addr) => {
          setCurrentArea(area);
          if (addr) {
            setActiveSavedAddress(addr);
          } else {
            setActiveSavedAddress(null);
          }
          handleCloseDeviceLocationPrompt();
        }}
        onOpenManualSearch={() => {
          handleCloseDeviceLocationPrompt();
          setIsLocationModalOpen(true);
        }}
      />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentArea={currentArea}
        activeAddress={activeSavedAddress}
        userProfile={userProfile}
        userPhone={userPhone}
        onSelectArea={(area, addr) => {
          setCurrentArea(area);
          if (addr) {
            setActiveSavedAddress(addr);
          } else {
            setActiveSavedAddress(null);
          }
        }}
      />

      <ProductDetailModal
        product={selectedProductQuickView}
        onClose={() => setSelectedProductQuickView(null)}
        quantityInCart={
          selectedProductQuickView
            ? cartItems.find((i) => i.product.id === selectedProductQuickView.id)?.quantity || 0
            : 0
        }
        onAddToCart={handleAddToCart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onOpenAuth={() => navigate('/auth')}
      />

      <MapsGroundingAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        currentArea={currentArea}
      />

    </div>
  );
}
