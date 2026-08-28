import React from 'react';
import { LegalView } from '../LegalViews';

interface TermsOfServiceSubPageProps {
  onBack: () => void;
}

export const TermsOfServiceSubPage: React.FC<TermsOfServiceSubPageProps> = ({ onBack }) => {
  return <LegalView onBack={onBack} type="terms" />;
};
