export interface ProductColorOption {
  name: string;
  label: string;
  shortRole: string;
  hex: string;
  twBg: string;
  twRing: string;
  description: string;
  standard?: string;
}

export type WireColorOption = ProductColorOption;

// Indian Standard Wire Colors (IS 694 / IS 732)
export const INDIAN_STANDARD_WIRE_COLORS: ProductColorOption[] = [
  {
    name: 'Red',
    label: 'Red (Live / Phase R)',
    shortRole: 'Phase (R)',
    hex: '#DC2626',
    twBg: 'bg-red-600',
    twRing: 'ring-red-600',
    description: 'IS 694 Standard: Live / Phase conductor in single-phase & 3-phase circuits.',
    standard: 'IS 694'
  },
  {
    name: 'Black',
    label: 'Black (Neutral N)',
    shortRole: 'Neutral (N)',
    hex: '#0F172A',
    twBg: 'bg-slate-950',
    twRing: 'ring-slate-950',
    description: 'IS 694 Standard: Neutral return conductor for AC electrical circuits.',
    standard: 'IS 694'
  },
  {
    name: 'Green',
    label: 'Green (Earth / Ground E)',
    shortRole: 'Earth (E)',
    hex: '#16A34A',
    twBg: 'bg-green-600',
    twRing: 'ring-green-600',
    description: 'IS 694 Standard: Safety protective earth grounding conductor.',
    standard: 'IS 694'
  },
  {
    name: 'Yellow',
    label: 'Yellow (Phase Y)',
    shortRole: 'Phase (Y)',
    hex: '#EAB308',
    twBg: 'bg-yellow-500',
    twRing: 'ring-yellow-500',
    description: 'IS 694 Standard: Y-Phase in 3-phase wiring & secondary switch live loops.',
    standard: 'IS 694'
  },
  {
    name: 'Blue',
    label: 'Blue (Phase B)',
    shortRole: 'Phase (B)',
    hex: '#2563EB',
    twBg: 'bg-blue-600',
    twRing: 'ring-blue-600',
    description: 'IS 694 Standard: B-Phase in 3-phase wiring & dedicated lighting loops.',
    standard: 'IS 694'
  },
  {
    name: 'White',
    label: 'White / Grey (Inverter / UPS)',
    shortRole: 'Inverter / UPS',
    hex: '#F1F5F9',
    twBg: 'bg-slate-200',
    twRing: 'ring-slate-400',
    description: 'Indian Residential Standard: Dedicated Inverter / UPS emergency backup phase.',
    standard: 'IS 732'
  }
];

// Indian Standard & Commercial Pipe / Conduit Colors
export const PIPE_COLOR_OPTIONS: ProductColorOption[] = [
  {
    name: 'Ivory / White',
    label: 'Ivory / White (Standard Clean Conduit)',
    shortRole: 'Standard (White)',
    hex: '#F8FAFC',
    twBg: 'bg-slate-100',
    twRing: 'ring-slate-400',
    description: 'Standard residential & commercial concealed or exposed conduit wiring (IS 9537 Part 3).',
    standard: 'IS 9537'
  },
  {
    name: 'Black',
    label: 'Black (UV Resistant / Heavy Duty)',
    shortRole: 'UV Proof (Black)',
    hex: '#0F172A',
    twBg: 'bg-slate-950',
    twRing: 'ring-slate-950',
    description: 'Outdoor weather-proof, industrial slab casting & high UV sunlight-resistant conduit.',
    standard: 'IS 9537'
  },
  {
    name: 'Grey',
    label: 'Grey (Medium / Heavy Slab Casting)',
    shortRole: 'Casting (Grey)',
    hex: '#64748B',
    twBg: 'bg-slate-500',
    twRing: 'ring-slate-600',
    description: 'High impact resistance for RCC concrete ceiling slab embedding and wall chasing.',
    standard: 'IS 9537'
  },
  {
    name: 'Blue',
    label: 'Blue (Data / Low Voltage)',
    shortRole: 'Data/Telecom (Blue)',
    hex: '#2563EB',
    twBg: 'bg-blue-600',
    twRing: 'ring-blue-600',
    description: 'Dedicated identification conduit for CAT6 internet, telephone, and CCTV cabling.',
    standard: 'Commercial'
  },
  {
    name: 'Red / Orange',
    label: 'Red / Orange (Fire Safety & Alarm)',
    shortRole: 'Fire Alarm (Red)',
    hex: '#EA580C',
    twBg: 'bg-orange-600',
    twRing: 'ring-orange-600',
    description: 'Mandatory color-coded conduit pathway for fire alarm systems and emergency backup power.',
    standard: 'Fire Code'
  },
  {
    name: 'Yellow',
    label: 'Yellow (Solar DC / Alert Pathways)',
    shortRole: 'Solar / Alert (Yellow)',
    hex: '#EAB308',
    twBg: 'bg-yellow-500',
    twRing: 'ring-yellow-500',
    description: 'Solar rooftop DC cable protection and caution safety conduit routes.',
    standard: 'MNRE Std'
  }
];

export function isWireProduct(product?: {
  name?: string;
  subCategory?: string;
  subcategory?: string;
  category?: string;
  tags?: string[];
}): boolean {
  if (!product) return false;
  const name = (product.name || '').toLowerCase();
  const sub = (product.subCategory || product.subcategory || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());

  return (
    sub === 'wire' ||
    sub === 'wiring' ||
    sub === 'cables' ||
    sub.includes('wire') ||
    sub.includes('cable') ||
    name.includes('wire') ||
    name.includes('frls') ||
    name.includes('fr ls') ||
    name.includes('sqmm') ||
    name.includes('cable') ||
    tags.includes('wire') ||
    tags.includes('cable')
  );
}

export function isPipeProduct(product?: {
  name?: string;
  subCategory?: string;
  subcategory?: string;
  category?: string;
  tags?: string[];
  specs?: Record<string, any>;
  specifications?: Record<string, any>;
}): boolean {
  if (!product) return false;
  const name = (product.name || '').toLowerCase();
  const sub = (product.subCategory || product.subcategory || '').toLowerCase();
  const tags = (product.tags || []).map((t) => t.toLowerCase());

  return (
    sub.includes('pipe') ||
    sub.includes('conduit') ||
    sub.includes('plumbing') ||
    name.includes('pipe') ||
    name.includes('conduit') ||
    name.includes('casing') ||
    name.includes('dalda') ||
    name.includes('dada') ||
    name.includes('cpvc') ||
    name.includes('upvc') ||
    name.includes('pvc pipe') ||
    tags.includes('pipe') ||
    tags.includes('conduit') ||
    tags.includes('dalda') ||
    tags.includes('dalda pipe') ||
    tags.includes('dada')
  );
}

/**
 * Returns the relevant color options for any given product
 */
export function getProductColorOptions(product?: {
  name?: string;
  subCategory?: string;
  subcategory?: string;
  category?: string;
  tags?: string[];
  specs?: Record<string, any>;
  specifications?: Record<string, any>;
}): ProductColorOption[] {
  if (!product) return [];

  // Check if explicit colors are declared in specs
  const specs = product.specs || product.specifications || {};
  const explicitColorStr =
    specs['Available Colors'] ||
    specs['Available Colours'] ||
    specs['Colors'] ||
    specs['Colours'] ||
    specs['Color'] ||
    specs['Colour'];

  if (isWireProduct(product)) {
    return INDIAN_STANDARD_WIRE_COLORS;
  }

  if (isPipeProduct(product)) {
    return PIPE_COLOR_OPTIONS;
  }

  if (typeof explicitColorStr === 'string' && explicitColorStr.trim()) {
    const rawNames = explicitColorStr.split(/[,/|]+/).map((s) => s.trim()).filter(Boolean);
    if (rawNames.length > 0) {
      return rawNames.map((name) => {
        const matched = [...PIPE_COLOR_OPTIONS, ...INDIAN_STANDARD_WIRE_COLORS].find(
          (c) => c.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(c.name.toLowerCase())
        );
        return (
          matched || {
            name,
            label: name,
            shortRole: name,
            hex: name.toLowerCase().includes('black') ? '#0F172A' : name.toLowerCase().includes('white') ? '#F8FAFC' : '#94A3B8',
            twBg: 'bg-slate-200',
            twRing: 'ring-slate-400',
            description: `${name} color variant`
          }
        );
      });
    }
  }

  return [];
}

export function getDefaultProductColor(product?: {
  name?: string;
  subCategory?: string;
  subcategory?: string;
  category?: string;
  tags?: string[];
  specs?: Record<string, any>;
  specifications?: Record<string, any>;
  selectedColor?: string;
}): string {
  if (product?.selectedColor) return product.selectedColor;
  if (isWireProduct(product)) return 'Red';
  if (isPipeProduct(product)) return 'Ivory / White';
  const opts = getProductColorOptions(product);
  return opts.length > 0 ? opts[0].name : '';
}
