import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X } from 'lucide-react';
import { hapticLight, hapticSelection } from '../../utils/haptics';

export type TechnicianSortOption =
  | 'price_asc'
  | 'price_desc'
  | 'top_rated'
  | 'nearest'
  | 'recommended';

interface TechnicianSortModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: TechnicianSortOption;
  onSelectSort: (sort: TechnicianSortOption) => void;
}

export const TechnicianSortModal: React.FC<TechnicianSortModalProps> = ({
  isOpen,
  onClose,
  selectedSort,
  onSelectSort
}) => {
  if (!isOpen) return null;

  // Simple, clean price & ranking options without descriptions or icons
  const PRICE_SORT_OPTIONS: {
    id: TechnicianSortOption;
    label: string;
  }[] = [
    {
      id: 'price_asc',
      label: 'Price: Low to High'
    },
    {
      id: 'price_desc',
      label: 'Price: High to Low'
    },
    {
      id: 'top_rated',
      label: 'Top Rated'
    },
    {
      id: 'nearest',
      label: 'Technician Nearest Him'
    }
  ];

  const handleSelect = (option: TechnicianSortOption) => {
    hapticSelection();
    onSelectSort(option);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Subtle backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            hapticLight();
            onClose();
          }}
          className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity"
        />

        {/* Short, Small Clean Dropdown Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -6 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="fixed top-20 sm:top-24 right-3 sm:right-6 md:right-12 z-50 w-56 sm:w-60 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 overflow-hidden"
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Price Filter
            </span>
            <button
              type="button"
              onClick={() => {
                hapticLight();
                onClose();
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent"
              aria-label="Close sort dropdown"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simple Button Options */}
          <div className="py-1 space-y-0.5">
            {PRICE_SORT_OPTIONS.map((opt) => {
              const isSelected = selectedSort === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border-0 ${
                    isSelected
                      ? 'bg-blue-50 text-blue-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
