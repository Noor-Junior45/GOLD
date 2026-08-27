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
      className="fixed bottom-7 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[310px] sm:max-w-[360px]"
    >
      <div className="flex items-center justify-between gap-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-2xl bg-white/95 sm:bg-white/95 border border-slate-200/90 shadow-[0_10px_28px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] ring-1 ring-black/5 transition-all duration-300">
        {/* Home Button (Soft Green when active, Pure Black when inactive) */}
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
          className={`w-[62px] sm:w-[70px] flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent ${
            isHomeActive
              ? 'text-emerald-600 font-bold scale-105'
              : 'text-slate-950 hover:text-emerald-600 active:scale-95 font-semibold'
          }`}
        >
          <Home className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-1 transition-transform ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[2.2]'}`} />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Home</span>
        </button>

        {/* Divider 1 */}
        <div className="w-[1px] h-6 sm:h-7 bg-slate-300 shrink-0" aria-hidden="true" />

        {/* Electrical Button (Vibrant Blue when active, Pure Black when inactive) */}
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
          className={`w-[62px] sm:w-[70px] flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent ${
            isElectricalActive
              ? 'text-blue-600 font-bold scale-105'
              : 'text-slate-950 hover:text-blue-600 active:scale-95 font-semibold'
          }`}
        >
          <Zap
            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-1 transition-transform ${isElectricalActive ? 'stroke-[2.5] fill-blue-600' : 'stroke-[2.2]'}`}
          />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Electrical</span>
        </button>

        {/* Divider 2 */}
        <div className="w-[1px] h-6 sm:h-7 bg-slate-300 shrink-0" aria-hidden="true" />

        {/* Construction Button (Yellow / Amber when active, Pure Black when inactive) */}
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
          className={`w-[64px] sm:w-[72px] flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent ${
            isConstructionActive
              ? 'text-amber-500 font-bold scale-105'
              : 'text-slate-950 hover:text-amber-500 active:scale-95 font-semibold'
          }`}
        >
          <Building2 className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-1 transition-transform ${isConstructionActive ? 'stroke-[2.5]' : 'stroke-[2.2]'}`} />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Construction</span>
        </button>

        {/* Divider 3 */}
        <div className="w-[1px] h-6 sm:h-7 bg-slate-300 shrink-0" aria-hidden="true" />

        {/* Wiring Button (Red when active, Pure Black when inactive) */}
        <button
          id="floating-nav-wiring"
          type="button"
          onClick={() => {
            triggerHaptic(25);
            onTabChange('services');
          }}
          title="Wiring & Electrical Services"
          aria-label="Wiring & Electrical Services"
          className={`w-[62px] sm:w-[70px] flex flex-col items-center justify-center py-1.5 sm:py-2 px-0.5 rounded-full transition-all duration-200 cursor-pointer bg-transparent ${
            isWiringActive
              ? 'text-red-600 font-bold scale-105'
              : 'text-slate-950 hover:text-red-600 active:scale-95 font-semibold'
          }`}
        >
          <Wrench className={`w-5 h-5 sm:w-5.5 sm:h-5.5 mb-1 transition-transform ${isWiringActive ? 'stroke-[2.5]' : 'stroke-[2.2]'}`} />
          <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight whitespace-nowrap">Wiring</span>
        </button>
      </div>
    </nav>
  );
};
