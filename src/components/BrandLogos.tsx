import React from 'react';

export interface BrandItem {
  id: string;
  name: string;
  category: 'Electrical' | 'Construction' | 'Tools & Hardware';
  segment: string;
  badge: string;
  tagline: string;
  targetRoute: string;
  renderLogo: () => React.ReactNode;
}

export const OFFICIAL_BRANDS: BrandItem[] = [
  {
    id: 'rr-kabel',
    name: 'RR Kabel',
    category: 'Electrical',
    segment: 'Wires & FRLS Cables',
    badge: 'Authorized Direct',
    tagline: 'German Technology Wires',
    targetRoute: '/electrical?subcategory=Wires%20%26%20Cables',
    renderLogo: () => (
      <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="32" height="32" rx="8" fill="#E11D24" />
        <path d="M10 12h8c2.5 0 4.5 1.5 4.5 4s-2 4-4.5 4h-4v8h-4V12zm4 5h3.5c1 0 2-.5 2-1.5s-1-1.5-2-1.5H14v3zm5.5 4.5l4.5 6.5h-4.5l-3.5-5.5h3.5z" fill="#FFFFFF" />
        <text x="42" y="24" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#0F1B2D" letterSpacing="-0.5">
          RR KÄBEL
        </text>
        <text x="43" y="33" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="7" fill="#E11D24" letterSpacing="0.8">
          WIRES &amp; CABLES
        </text>
      </svg>
    )
  },
  {
    id: 'polycab',
    name: 'Polycab',
    category: 'Electrical',
    segment: 'Cables, Fans & Lighting',
    badge: 'Direct Wholesale',
    tagline: 'Connection Zindagi Ka',
    targetRoute: '/electrical?subcategory=Wires%20%26%20Cables',
    renderLogo: () => (
      <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="18" cy="20" r="15" fill="#E31837" />
        <path d="M11 20l7-10 7 10-7 10-7-10z" fill="#FFFFFF" />
        <circle cx="18" cy="20" r="3.5" fill="#E31837" />
        <text x="42" y="25" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="17" fill="#0F1B2D" letterSpacing="-0.3">
          POLYCAB
        </text>
        <text x="43" y="33" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="7" fill="#64748B" letterSpacing="0.5">
          INDIA LIMITED
        </text>
      </svg>
    )
  },
  {
    id: 'schneider',
    name: 'Schneider Electric',
    category: 'Electrical',
    segment: 'Modular Switches & MCBs',
    badge: 'OEM Partner',
    tagline: 'Life Is On Switchgear',
    targetRoute: '/electrical?subcategory=Switches',
    renderLogo: () => (
      <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#3DCD58" />
        <path d="M16 11l-5 9h6l-3 9 8-11h-6l5-7h-5z" fill="#FFFFFF" />
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="13" fill="#0F1B2D" letterSpacing="-0.2">
          Schneider
        </text>
        <text x="36" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="10" fill="#009639" letterSpacing="0.5">
          Electric
        </text>
      </svg>
    )
  },
  {
    id: 'havells',
    name: 'Havells',
    category: 'Electrical',
    segment: 'Lighting, MCBs & Fans',
    badge: 'Authorized Stockist',
    tagline: 'Making A Difference',
    targetRoute: '/electrical?subcategory=Lights',
    renderLogo: () => (
      <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#D32F2F" />
        <path d="M9 13v14h4v-5h6v5h4V13h-4v5h-6v-5H9z" fill="#FFFFFF" />
        <text x="36" y="26" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="17" fill="#0F1B2D" letterSpacing="-0.5">
          HAVELLS
        </text>
        <text x="37" y="34" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="7" fill="#D32F2F" letterSpacing="0.4">
          GENUINE CERTIFIED
        </text>
      </svg>
    )
  },
  {
    id: 'anchor',
    name: 'Anchor by Panasonic',
    category: 'Electrical',
    segment: 'Wiring Accessories & ROMA',
    badge: 'Direct Supply',
    tagline: 'ROMA Modular Technology',
    targetRoute: '/electrical?subcategory=Switches',
    renderLogo: () => (
      <svg viewBox="0 0 160 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="20" r="14" fill="#004098" />
        <path d="M16 10v12M11 16l5-5 5 5M10 24c1.5 2 3.5 3 6 3s4.5-1 6-3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="14" fill="#0F1B2D">
          ANCHOR
        </text>
        <text x="36" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="9" fill="#004098">
          by Panasonic
        </text>
      </svg>
    )
  },
  {
    id: 'finolex',
    name: 'Finolex',
    category: 'Electrical',
    segment: 'Flame Retardant Wires',
    badge: 'Authorized Stock',
    tagline: 'Pure Copper Conductor',
    targetRoute: '/electrical?subcategory=Wires%20%26%20Cables',
    renderLogo: () => (
      <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#C8102E" />
        <path d="M8 20c2-5 8-5 10 0s8 5 10 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <text x="36" y="26" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="17" fill="#0F1B2D" letterSpacing="-0.4">
          Finolex
        </text>
        <text x="37" y="34" fontFamily="system-ui, sans-serif" fontWeight="600" fontSize="7" fill="#C8102E" letterSpacing="0.4">
          WIRES THAT NEVER FAIL
        </text>
      </svg>
    )
  },
  {
    id: 'ultratech',
    name: 'UltraTech Cement',
    category: 'Construction',
    segment: 'OPC 53 & PPC Ready',
    badge: 'Direct Depot Rates',
    tagline: "The Engineer's Choice",
    targetRoute: '/construction',
    renderLogo: () => (
      <svg viewBox="0 0 150 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#FFCC00" />
        <path d="M7 12h18v16H7z" fill="#1C1C1C" />
        <path d="M11 16l5 8 5-8" stroke="#FFCC00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="14" fill="#1C1C1C" letterSpacing="-0.3">
          UltraTech
        </text>
        <text x="36" y="32" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="9" fill="#D97706" letterSpacing="0.6">
          CEMENT
        </text>
      </svg>
    )
  },
  {
    id: 'tata-tiscon',
    name: 'Tata Tiscon',
    category: 'Construction',
    segment: 'Fe 550D TMT Rebars',
    badge: 'Authorized TMT Hub',
    tagline: 'Super Ductile Steel',
    targetRoute: '/construction',
    renderLogo: () => (
      <svg viewBox="0 0 150 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="20" r="14" fill="#005A9C" />
        <path d="M9 14h14M16 14v12" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="13" fill="#0F1B2D" letterSpacing="-0.2">
          TATA TISCON
        </text>
        <text x="36" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="9" fill="#005A9C" letterSpacing="0.5">
          550D REBARS
        </text>
      </svg>
    )
  },
  {
    id: 'astral',
    name: 'Astral Pipes',
    category: 'Construction',
    segment: 'CPVC, UPVC & Drainage',
    badge: 'Official Distributor',
    tagline: 'Pipes & Fittings Leader',
    targetRoute: '/construction?subcategory=Plumbing%20%26%20Pipes',
    renderLogo: () => (
      <svg viewBox="0 0 145 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#0077C8" />
        <circle cx="16" cy="20" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <path d="M16 12v8l5 3" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        <text x="36" y="22" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#0F1B2D" letterSpacing="-0.4">
          ASTRAL
        </text>
        <text x="37" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="8" fill="#0077C8" letterSpacing="0.6">
          PIPES &amp; TANKS
        </text>
      </svg>
    )
  },
  {
    id: 'dr-fixit',
    name: 'Dr. Fixit',
    category: 'Construction',
    segment: 'Waterproofing & Additives',
    badge: 'Stockist Hub',
    tagline: '101 LW+ & Raincoat',
    targetRoute: '/construction',
    renderLogo: () => (
      <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="20" r="14" fill="#FFD200" />
        <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6-6-2.7-6-6zm4 0h4m-2-2v4" stroke="#003399" strokeWidth="2" strokeLinecap="round" />
        <text x="36" y="23" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="16" fill="#003399" letterSpacing="-0.3">
          Dr. Fixit
        </text>
        <text x="37" y="33" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="8" fill="#D97706" letterSpacing="0.5">
          WATERPROOFING
        </text>
      </svg>
    )
  },
  {
    id: 'asian-paints',
    name: 'Asian Paints',
    category: 'Construction',
    segment: 'Wall Putty, Primers & Paints',
    badge: 'Direct Supply',
    tagline: 'Tractor Emulsion & Apex',
    targetRoute: '/construction',
    renderLogo: () => (
      <svg viewBox="0 0 155 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="13" height="13" rx="3" fill="#E11D24" />
        <rect x="17" y="6" width="13" height="13" rx="3" fill="#FFCC00" />
        <rect x="2" y="21" width="13" height="13" rx="3" fill="#0077C8" />
        <rect x="17" y="21" width="13" height="13" rx="3" fill="#00A651" />
        <text x="36" y="21" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="14" fill="#0F1B2D" letterSpacing="-0.3">
          asianpaints
        </text>
        <text x="37" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="8" fill="#E11D24" letterSpacing="0.5">
          PUTTY &amp; PAINTS
        </text>
      </svg>
    )
  },
  {
    id: 'centuryply',
    name: 'CenturyPly',
    category: 'Construction',
    segment: 'Plywood, Boards & Laminates',
    badge: 'ISI Certified',
    tagline: 'Sainik 710 Waterproof',
    targetRoute: '/construction',
    renderLogo: () => (
      <svg viewBox="0 0 150 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#00843D" />
        <path d="M16 11l-7 18h14l-7-18z" fill="#FFFFFF" />
        <circle cx="16" cy="22" r="2.5" fill="#E31837" />
        <text x="36" y="22" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="14" fill="#0F1B2D" letterSpacing="-0.2">
          CENTURYPLY
        </text>
        <text x="37" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="8" fill="#00843D" letterSpacing="0.5">
          PLYWOOD &amp; BOARDS
        </text>
      </svg>
    )
  },
  {
    id: 'bosch',
    name: 'Bosch',
    category: 'Tools & Hardware',
    segment: 'Drills, Grinders & Power Tools',
    badge: '100% Genuine Tools',
    tagline: 'Professional Heavy Duty',
    targetRoute: '/construction?subcategory=Power%20Tools',
    renderLogo: () => (
      <svg viewBox="0 0 140 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="20" r="14" fill="#EA1C24" />
        <circle cx="16" cy="20" r="8" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
        <line x1="8" y1="20" x2="24" y2="20" stroke="#FFFFFF" strokeWidth="2.5" />
        <text x="36" y="26" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="18" fill="#0F1B2D" letterSpacing="0.5">
          BOSCH
        </text>
      </svg>
    )
  },
  {
    id: 'supreme',
    name: 'Supreme',
    category: 'Construction',
    segment: 'PVC Drainage & Underground',
    badge: 'Authorized Stockist',
    tagline: 'Total Piping Solutions',
    targetRoute: '/construction?subcategory=Plumbing%20%26%20Pipes',
    renderLogo: () => (
      <svg viewBox="0 0 145 40" className="h-7 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="28" height="28" rx="6" fill="#E31837" />
        <path d="M10 24c0-2 2-3 6-3s6-1 6-3-2-3-6-3-6 1-6 3" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="36" y="22" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="15" fill="#0F1B2D" letterSpacing="-0.2">
          Supreme
        </text>
        <text x="37" y="32" fontFamily="system-ui, sans-serif" fontWeight="700" fontSize="8" fill="#E31837" letterSpacing="0.5">
          PIPES &amp; FITTINGS
        </text>
      </svg>
    )
  }
];
