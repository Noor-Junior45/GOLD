import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ServicesSubPageProps {
  onBack: () => void;
}

export const ServicesSubPage: React.FC<ServicesSubPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-white text-black pb-20">
      <div className="border-b border-slate-200 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={onBack}
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
};
