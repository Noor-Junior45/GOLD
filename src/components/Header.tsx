import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, ShoppingBag, User, ChevronDown, Home, Briefcase, Building2, MapPin, Wrench, Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { KolkataArea, SavedAddress, UserProfile } from '../types';
import { detectQueryCategory } from '../utils/searchHelper';

interface HeaderProps {
  currentArea: KolkataArea;
  activeAddress?: SavedAddress | null;
  onOpenLocationModal: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  cartCount?: number;
  cartTotal?: number;
  onOpenCart?: () => void;
  userPhone: string | null;
  userName?: string;
  userPhoto?: string;
  userProfile?: UserProfile | null;
  onOpenAuth: () => void;
  onOpenAiAssistant?: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenWishlist?: () => void;
  onOpenInstallApp?: () => void;
}

function getHeaderDisplayLocation(currentArea: KolkataArea | null, activeAddress?: SavedAddress | null): { houseNameOnly: string; tag?: string } {
  if (activeAddress && activeAddress.houseName) {
    return {
      houseNameOnly: activeAddress.houseName,
      tag: activeAddress.tag
    };
  }

  if (activeAddress && activeAddress.houseFlat) {
    return {
      houseNameOnly: activeAddress.houseFlat,
      tag: activeAddress.tag
    };
  }

  if (!currentArea || !currentArea.name) {
    return { houseNameOnly: 'Select Location' };
  }

  const shortName = currentArea.exactStreet || currentArea.name.split('/')[0].split('(')[0].trim();
  return {
    houseNameOnly: shortName
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentArea,
  activeAddress,
  onOpenLocationModal,
  searchQuery = '',
  onSearchChange,
  cartCount = 0,
  cartTotal = 0,
  onOpenCart,
  userPhone,
  userName,
  userPhoto,
  userProfile,
  onOpenAuth,
  activeTab,
  onTabChange,
  activeCategory,
  onSelectCategory,
  onOpenInstallApp
}) => {
  const [imgError, setImgError] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const locationInfo = getHeaderDisplayLocation(currentArea, activeAddress);

  // Show All Filters button strictly on Electrical, Construction, and Wiring/Services pages (Hidden on Home and others)
  const currentPath = location.pathname.toLowerCase();
  const showFilterBtn =
    activeTab === 'electrical' ||
    activeTab === 'construction' ||
    activeTab === 'services' ||
    currentPath.startsWith('/electrical') ||
    currentPath.startsWith('/construction') ||
    currentPath.startsWith('/services');

  // Instant Enter key handler for search input - navigates directly without delay
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const q = (searchQuery || '').trim();
    if (!q) return;

    // Detect target store category (electrical or construction) immediately
    const targetCategory = detectQueryCategory(q);
    const targetPath = targetCategory === 'construction' ? '/construction' : '/electrical';
    const targetUrl = `${targetPath}?q=${encodeURIComponent(q)}`;

    // Sync active category & close mobile search
    onSelectCategory(targetCategory);
    onTabChange(targetCategory);
    setIsMobileSearchOpen(false);

    // Direct instant navigation to targeted store page
    navigate(targetUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // Check login state from profile, phone, name, email or photo
  const effectiveName = userProfile?.name || userName || '';
  const effectiveEmail = userProfile?.email || '';
  const effectivePhone = userProfile?.phone || userPhone || '';
  const effectivePhoto = userProfile?.photoURL || userPhoto || '';

  const isLoggedIn = Boolean(
    userProfile?.id ||
    userProfile?.email ||
    userProfile?.phone ||
    effectivePhone ||
    (effectiveName && effectiveName !== 'Kolkata Customer' && effectiveName.trim() !== '') ||
    effectiveEmail ||
    effectivePhoto
  );

  const getInitials = (name?: string, phone?: string | null, email?: string) => {
    if (name && name !== 'Kolkata Customer' && name !== 'Customer' && name.trim()) {
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
    return 'BN';
  };

  const handleCartClick = () => {
    if (onOpenCart) {
      onOpenCart();
    } else {
      onTabChange('cart');
    }
  };

  const accountDisplayLabel = effectiveName || effectiveEmail || effectivePhone || 'Account';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-2xs">
      {/* Main Brand & Action Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Title & Location Header */}
          <div className="flex items-center shrink-0">
            {/* Brand Title & Below-Logo Exact Location Selector */}
            <div className="flex flex-col justify-center text-left">
              <button
                onClick={() => onTabChange('home')}
                className="text-lg sm:text-xl font-black tracking-tight leading-none flex items-center text-left cursor-pointer focus:outline-none font-sf-pro"
              >
                <span className="text-black">Build</span>
                <span className="text-[#00875a]">Now</span>
              </button>

              {/* Saved Address House Name Only / Location Selector */}
              <button
                onClick={onOpenLocationModal}
                className="flex items-center gap-1.5 text-xs font-normal text-slate-700 hover:text-black transition-colors text-left cursor-pointer group leading-none mt-1 focus:outline-none max-w-[200px] sm:max-w-[320px] truncate"
                title="View full address or change location"
              >
                {activeAddress?.tag === 'home' && (
                  <Home className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                )}
                {activeAddress?.tag === 'work' && (
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                )}
                {activeAddress?.tag === 'hotel' && (
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                {!activeAddress && (
                  <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
                <span className="truncate text-slate-700 group-hover:text-slate-900 font-normal text-[12px] sm:text-[13px]">
                  {locationInfo.houseNameOnly}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 shrink-0 transition-transform group-hover:translate-y-0.5" />
              </button>
            </div>
          </div>

          {/* Right Action Icons: Cart Button, Profile Button */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Cart Button (Borderless, icon only with badge, no circular/oval background) */}
            <button
              id="top-navbar-cart-btn"
              onClick={handleCartClick}
              className={`relative p-1.5 sm:p-2 flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent ${
                activeTab === 'cart'
                  ? 'text-amber-600'
                  : 'text-slate-800 hover:text-amber-600'
              }`}
              title="View Cart"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
            </button>

            {/* User Profile / Login Button */}
            <button
              id="user-profile-avatar-btn"
              onClick={() => {
                if (isLoggedIn) {
                  onTabChange('profile');
                } else {
                  onOpenAuth();
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all hover:shadow-2xs active:scale-95 cursor-pointer overflow-hidden relative"
              title={isLoggedIn ? `Account: ${accountDisplayLabel} (Click to open Profile)` : 'Sign in / Sign up'}
              aria-label={isLoggedIn ? `Profile: ${accountDisplayLabel}` : 'Sign in'}
            >
              {isLoggedIn ? (
                effectivePhoto && !imgError ? (
                  <img
                    src={effectivePhoto}
                    alt={accountDisplayLabel}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-xs font-black text-amber-950 bg-amber-400 w-full h-full rounded-full flex items-center justify-center border border-amber-500 shadow-inner">
                    {getInitials(effectiveName, effectivePhone, effectiveEmail)}
                  </span>
                )
              ) : (
                <User className="w-5 h-5 text-slate-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Fixed Liquid Glass Search Bar + Right-side All Filters Button (Visible strictly on Electrical, Construction & Wiring, NOT on Home) */}
      <div className="border-t border-slate-100/80 bg-gradient-to-b from-white/80 to-white/95 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="max-w-3xl mx-auto w-full flex items-center gap-2 sm:gap-3">
          {/* Reduced Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 group" role="search">
            <div className="relative flex items-center w-full rounded-full backdrop-blur-xl bg-slate-100/80 hover:bg-slate-100/95 focus-within:bg-white border border-slate-200/80 focus-within:border-[#00875a]/50 focus-within:ring-2 focus-within:ring-[#00875a]/20 shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus-within:shadow-[0_4px_20px_rgba(0,135,90,0.12)] transition-all duration-200">
              {/* Google-style Magnifying Glass Icon */}
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#00875a] pointer-events-none transition-colors">
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
              </div>

              <input
                id="universal-search-input"
                type="search"
                value={searchQuery || ''}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products, electrical cables, switches, brands..."
                className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm pl-9 sm:pl-10 pr-8 sm:pr-9 py-1.5 sm:py-2 rounded-full focus:outline-none"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange && onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </form>

          {/* Right Side: All Filters Button & Sort / Relevance Button (Only visible on Electrical, Construction, and Wiring pages; Hidden on Home) */}
          {showFilterBtn && (
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {/* All Filters Button (Borderless, icon only, no circular/oval background) */}
              <button
                id="top-navbar-all-filters-btn"
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-all-filters'));
                }}
                className="p-1.5 sm:p-2 flex items-center justify-center text-slate-700 hover:text-amber-600 border-0 bg-transparent transition-colors active:scale-95 cursor-pointer"
                title="All Filters"
                aria-label="All Filters"
              >
                <SlidersHorizontal className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-600 hover:text-amber-700 shrink-0" strokeWidth={2.2} />
              </button>

              {/* Sort / Relevance Button (Borderless, icon only, no circular/oval background) */}
              <button
                id="top-navbar-relevance-sort-btn"
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-sort-dropdown'));
                }}
                className="p-1.5 sm:p-2 flex items-center justify-center text-slate-700 hover:text-blue-600 border-0 bg-transparent transition-colors active:scale-95 cursor-pointer"
                title="Sort & Relevance"
                aria-label="Sort and Relevance"
              >
                <ArrowUpDown className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-blue-600 hover:text-blue-700 shrink-0" strokeWidth={2.2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
