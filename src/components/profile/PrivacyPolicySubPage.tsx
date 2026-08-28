import React from 'react';
import { LegalView } from '../LegalViews';

interface PrivacyPolicySubPageProps {
  onBack: () => void;
}

export const PrivacyPolicySubPage: React.FC<PrivacyPolicySubPageProps> = ({ onBack }) => {
  return <LegalView onBack={onBack} type="privacy" />;
};
