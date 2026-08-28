import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { UserProfile } from '../../types';
import { HelpCenterChat } from '../HelpCenterChat';

interface HelpCenterSubPageProps {
  userProfile: UserProfile | null;
  onBack: () => void;
}

export const HelpCenterSubPage: React.FC<HelpCenterSubPageProps> = ({
  userProfile,
  onBack
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <div className="bg-white border-b border-slate-200 px-4 py-3.5 flex items-center gap-3 shadow-2xs">
        <button
          onClick={onBack}
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
};
