import React from 'react';
import { Home, Zap, Building2, Wrench } from 'lucide-react';

interface FloatingBottomNavProps {
  activeTab: string;
  activeCategory: string;
  onTabChange: (tab: string) => void;
  onSelectCategory: (category: string) => void;
}

const triggerHaptic = (pattern: number | number[] = 25) => {
  try {
    if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern);
    }
  } catch {
    // Ignore in browsers/sandboxes without vibration support
  }
};

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  activeTab,
  activeCategory,
  onTabChange,
  onSelectCategory,
}) => {
  const isHomeActive = activeTab === 'home' || (activeTab === 'catalog' && activeCategory === 'all');
  const isElectricalActive = activeTab === 'electrical' || (activeTab === 'catalog' && activeCategory === 'electrical');
  const isConstructionActive = activeTab === 'construction' || (activeTab === 'catalog' && activeCategory === 'construction');
  const isWiringActive = activeTab === 'services';

  return (
    <nav
      id="floating-liquid-bottom-navbar"
      aria-label="Bottom Navigation"
      className="fixed bottom-6 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[320px] sm:max-w-[370px]"
    >
      <div className="flex items-center justify-around gap-0.5 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-3xl backdrop-saturate-200 border border-white/60 shadow-[0_16px_40px_rgba(0,0,0,0.13),0_2px_10px_rgba(0,0,0,0.04),inset_0_1.5px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.03)] ring-1 ring-black/5 transition-all duration-300">
        {/* Home Button */}
        <button
          id="floating-nav-home"
          type="button"
          onClick={() => {
            triggerHaptic(25);
            onTabChange('home');
            onSelectCategory('all');
          }}
          title="Home"
          aria-label="Home"
          className={`flex-1 min-w-[58px] sm:min-w-[68px] flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 outline-none ${
            isHomeActive
              ? 'text-emerald-600 font-bold scale-[1.06]'
              : 'text-slate-700 hover:text-emerald-600 active:scale-95 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-0.5 transition-all ${isHomeActive ? 'stroke-[2.6] text-emerald-600' : 'stroke-[2]'}`} />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Home</span>
        </button>

        {/* Electrical Button */}
        <button
          id="floating-nav-electrical"
          type="button"
          onClick={() => {
            triggerHaptic(25);
            onTabChange('electrical');
            onSelectCategory('electrical');
          }}
          title="Electrical Supplies"
          aria-label="Electrical Supplies"
          className={`flex-1 min-w-[58px] sm:min-w-[68px] flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 outline-none ${
            isElectricalActive
              ? 'text-blue-600 font-bold scale-[1.06]'
              : 'text-slate-700 hover:text-blue-600 active:scale-95 font-medium'
          }`}
        >
          <Zap
            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-0.5 transition-all ${isElectricalActive ? 'stroke-[2.6] fill-blue-500 text-blue-600' : 'stroke-[2]'}`}
          />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Electrical</span>
        </button>

        {/* Construction Button */}
        <button
          id="floating-nav-construction"
          type="button"
          onClick={() => {
            triggerHaptic(25);
            onTabChange('construction');
            onSelectCategory('construction');
          }}
          title="Construction Materials"
          aria-label="Construction Materials"
          className={`flex-1 min-w-[60px] sm:min-w-[70px] flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 outline-none ${
            isConstructionActive
              ? 'text-amber-600 font-bold scale-[1.06]'
              : 'text-slate-700 hover:text-amber-600 active:scale-95 font-medium'
          }`}
        >
          <Building2 className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-0.5 transition-all ${isConstructionActive ? 'stroke-[2.6] text-amber-600' : 'stroke-[2]'}`} />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Construction</span>
        </button>

        {/* Wiring Button */}
        <button
          id="floating-nav-wiring"
          type="button"
          onClick={() => {
            triggerHaptic(25);
            onTabChange('services');
          }}
          title="Wiring & Electrical Services"
          aria-label="Wiring & Electrical Services"
          className={`flex-1 min-w-[58px] sm:min-w-[68px] flex flex-col items-center justify-center py-1.5 px-1 rounded-full transition-all duration-200 cursor-pointer bg-transparent border-0 outline-none ${
            isWiringActive
              ? 'text-rose-600 font-bold scale-[1.06]'
              : 'text-slate-700 hover:text-rose-600 active:scale-95 font-medium'
          }`}
        >
          <Wrench className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-0.5 transition-all ${isWiringActive ? 'stroke-[2.6] text-rose-600' : 'stroke-[2]'}`} />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Wiring</span>
        </button>
      </div>
    </nav>
  );
};
