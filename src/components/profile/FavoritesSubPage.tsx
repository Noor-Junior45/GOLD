import React from 'react';
import { ArrowLeft, Heart, ShoppingBag, Zap, Plus } from 'lucide-react';
import { Product, CartItem } from '../../types';

interface FavoritesSubPageProps {
  favoriteProducts: Product[];
  onBack: () => void;
  onOpenShop: () => void;
  onClearAllFavorites: () => void;
  onToggleFavorite: (productId: string) => void;
  onAddToCart?: (product: Product) => void;
  onReorder: (items: CartItem[]) => void;
}

export const FavoritesSubPage: React.FC<FavoritesSubPageProps> = ({
  favoriteProducts,
  onBack,
  onOpenShop,
  onClearAllFavorites,
  onToggleFavorite,
  onAddToCart,
  onReorder
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 animate-in fade-in duration-200">
      {/* Sticky Header with Back Arrow Button */}
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center justify-between shadow-2xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
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
            onClick={onClearAllFavorites}
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
                    onClick={() => onToggleFavorite(product.id)}
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
};
