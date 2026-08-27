import React from 'react';

interface WiringServicesProps {
  currentArea?: any;
  onBookService?: any;
  userPhone?: string | null;
  onBack?: () => void;
}

export const WiringServices: React.FC<WiringServicesProps> = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-28 flex items-center justify-center min-h-[50vh]">
      <h1 className="text-2xl sm:text-3xl font-medium text-black">
        Coming Soon
      </h1>
    </div>
  );
};

