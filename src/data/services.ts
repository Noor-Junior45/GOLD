export interface ServiceCategoryOption {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  basePrice: number;
  ratePerSqFt?: number;
  estimatedHours: string;
  badge: string;
  iconName: string;
  includes: string[];
  recommendedFor: string;
}

/**
 * Cleared wiring services list - ready for custom service package configuration.
 */
export const WIRING_SERVICES: ServiceCategoryOption[] = [];

export const TIME_SLOTS: string[] = [
  '09:00 AM - 12:00 PM',
  '12:00 PM - 03:00 PM',
  '03:00 PM - 06:00 PM',
  '06:00 PM - 09:00 PM'
];
