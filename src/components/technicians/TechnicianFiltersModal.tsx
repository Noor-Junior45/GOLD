import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { hapticLight, hapticSelection } from '../../utils/haptics';

export interface TechnicianFilterState {
  sectors: string[];
  minExperience?: number;
  masterOnly: boolean;
  availableOnly: boolean;
  emergencyOnly: boolean;
  tools: string[];
  areas: string[];
  minRating?: number;
}

interface TechnicianFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TechnicianFilterState;
  onApplyFilters: (filters: TechnicianFilterState) => void;
  onResetFilters: () => void;
  totalResultsCount: number;
}

export const TechnicianFiltersModal: React.FC<TechnicianFiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  totalResultsCount
}) => {
  const [draft, setDraft] = useState<TechnicianFilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraft(filters);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const toggleSector = (sectorKey: string) => {
    hapticLight();
    setDraft((prev) => {
      const exists = prev.sectors.includes(sectorKey);
      return {
        ...prev,
        sectors: exists
          ? prev.sectors.filter((s) => s !== sectorKey)
          : [...prev.sectors, sectorKey]
      };
    });
  };

  const toggleTool = (toolKey: string) => {
    hapticLight();
    setDraft((prev) => {
      const exists = prev.tools.includes(toolKey);
      return {
        ...prev,
        tools: exists
          ? prev.tools.filter((t) => t !== toolKey)
          : [...prev.tools, toolKey]
      };
    });
  };

  const toggleArea = (areaKey: string) => {
    hapticLight();
    setDraft((prev) => {
      const exists = prev.areas.includes(areaKey);
      return {
        ...prev,
        areas: exists
          ? prev.areas.filter((a) => a !== areaKey)
          : [...prev.areas, areaKey]
      };
    });
  };

  const handleApply = () => {
    hapticSelection();
    onApplyFilters(draft);
    onClose();
  };

  const handleReset = () => {
    hapticLight();
    const empty: TechnicianFilterState = {
      sectors: [],
      minExperience: undefined,
      masterOnly: false,
      availableOnly: false,
      emergencyOnly: false,
      tools: [],
      areas: [],
      minRating: undefined
    };
    setDraft(empty);
    onResetFilters();
    onClose();
  };

  const hasDraftFilters =
    draft.sectors.length > 0 ||
    draft.minExperience !== undefined ||
    draft.masterOnly ||
    draft.availableOnly ||
    draft.emergencyOnly ||
    draft.tools.length > 0 ||
    draft.areas.length > 0 ||
    draft.minRating !== undefined;

  const SECTOR_OPTIONS = [
    { key: 'residential', label: 'Residential & Township' },
    { key: 'solar', label: 'Solar & Renewable' },
    { key: 'industrial', label: 'Industrial & Switchgear' },
    { key: 'emergency', label: '24x7 Emergency' }
  ];

  const EXP_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: '5+ Years', value: 5 },
    { label: '8+ Years', value: 8 },
    { label: '10+ Years', value: 10 }
  ];

  const TOOL_OPTIONS = [
    { key: 'thermal', label: 'Thermal Scanner' },
    { key: 'megger', label: 'Megger / Earth Tester' },
    { key: 'tdr', label: 'TDR Fault Locator' },
    { key: 'pyranometer', label: 'Solar Pyranometer' },
    { key: 'clamp', label: 'True RMS Clamp Meter' }
  ];

  const AREA_OPTIONS = [
    { key: 'saltlake', label: 'Salt Lake / Sector V' },
    { key: 'newtown', label: 'New Town / Rajarhat' },
    { key: 'south', label: 'South Kolkata' },
    { key: 'central', label: 'Central Kolkata' },
    { key: 'howrah', label: 'Howrah / Hooghly' }
  ];

  const RATING_OPTIONS = [
    { label: 'Any', value: undefined },
    { label: '4.8★ & Above', value: 4.8 },
    { label: '4.9★ & Above', value: 4.9 }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-white sm:bg-black/50 sm:backdrop-blur-xs">
        {/* Backdrop for desktop click outside */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            hapticLight();
            onClose();
          }}
          className="hidden sm:block fixed inset-0"
        />

        {/* Side Drawer Panel on Laptop / Full Page on Mobile */}
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full h-full sm:max-w-md bg-white shadow-2xl z-10 flex flex-col overflow-hidden"
        >
          {/* Sticky Header (Identical clean format to electricals) */}
          <div className="sticky top-0 z-20 bg-white px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-black text-slate-900">Filters</h2>
              {hasDraftFilters && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black">
                  Active
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent"
              title="Close Filters"
              aria-label="Close Filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body: Single independent smooth scroll */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 space-y-6">
            {/* 1. Working Sector / Specialization (2-Column Grid of Simple Pill Buttons) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Specialization
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  {draft.sectors.length > 0 ? `${draft.sectors.length} selected` : 'All'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {SECTOR_OPTIONS.map((sec) => {
                  const isSelected = draft.sectors.includes(sec.key);
                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => toggleSector(sec.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                          : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 active:bg-slate-200'
                      }`}
                    >
                      <span className="line-clamp-1 break-words">{sec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Government Licensing & Verification (Clean 2-Column Grid or Simple Toggles) */}
            <div className="space-y-2.5">
              <div className="border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Licensing & Duty Status
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {/* Master Wireman License */}
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setDraft((p) => ({ ...p, masterOnly: !p.masterOnly }));
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                    draft.masterOnly
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 active:bg-slate-200'
                  }`}
                >
                  <span className="line-clamp-1 break-words">Master License Only</span>
                </button>

                {/* Available Today */}
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setDraft((p) => ({ ...p, availableOnly: !p.availableOnly }));
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                    draft.availableOnly
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 active:bg-slate-200'
                  }`}
                >
                  <span className="line-clamp-1 break-words">Available Today</span>
                </button>

                {/* 24x7 Emergency */}
                <button
                  type="button"
                  onClick={() => {
                    hapticLight();
                    setDraft((p) => ({ ...p, emergencyOnly: !p.emergencyOnly }));
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                    draft.emergencyOnly
                      ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                      : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 active:bg-slate-200'
                  }`}
                >
                  <span className="line-clamp-1 break-words">24x7 Emergency Standby</span>
                </button>
              </div>
            </div>

            {/* 3. Field Experience (Clean Pills) */}
            <div className="space-y-2.5">
              <div className="border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Minimum Experience
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {EXP_OPTIONS.map((opt) => {
                  const isSelected = draft.minExperience === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        hapticLight();
                        setDraft((p) => ({ ...p, minExperience: opt.value }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                          : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Diagnostic Equipment (2-Column Grid of Simple Pill Buttons) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Equipment Carried
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  {draft.tools.length > 0 ? `${draft.tools.length} selected` : 'All'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {TOOL_OPTIONS.map((tool) => {
                  const isSelected = draft.tools.includes(tool.key);
                  return (
                    <button
                      key={tool.key}
                      type="button"
                      onClick={() => toggleTool(tool.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                          : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 active:bg-slate-200'
                      }`}
                    >
                      <span className="line-clamp-1 break-words">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Service Area Coverage (2-Column Grid of Simple Pill Buttons) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Service Area
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  {draft.areas.length > 0 ? `${draft.areas.length} selected` : 'All'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {AREA_OPTIONS.map((area) => {
                  const isSelected = draft.areas.includes(area.key);
                  return (
                    <button
                      key={area.key}
                      type="button"
                      onClick={() => toggleArea(area.key)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold shadow-2xs'
                          : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80 active:bg-slate-200'
                      }`}
                    >
                      <span className="line-clamp-1 break-words">{area.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Customer Rating (Clean Pills) */}
            <div className="space-y-2.5">
              <div className="border-b border-slate-100 pb-1.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Customer Rating
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {RATING_OPTIONS.map((opt) => {
                  const isSelected = draft.minRating === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => {
                        hapticLight();
                        setDraft((p) => ({ ...p, minRating: opt.value }));
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-600 font-bold shadow-2xs'
                          : 'bg-slate-50/80 hover:bg-slate-100/90 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions (Identical to electricals page) */}
          <div className="sticky bottom-0 z-20 bg-white px-5 py-3 sm:py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 shadow-lg">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer border-0 bg-transparent px-3 py-2 rounded-lg"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-xs transition-all cursor-pointer border-0 text-center active:scale-98"
            >
              Apply Filters ({totalResultsCount})
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
