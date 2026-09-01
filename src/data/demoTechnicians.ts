import { Technician } from '../types/technician';

export const DEMO_TECHNICIANS: Technician[] = [
  {
    id: 'tech-001',
    name: 'Er. Rajesh Mukherjee',
    title: 'Lead Electrical Engineer & Master Wireman',
    badgeId: 'BN-ELEC-2024-042',
    experienceYears: 9,
    primarySector: 'Residential & Commercial Power Systems',
    subSectors: [
      'Whole-Building Rewiring',
      'Solar Hybrid Inverters',
      '3-Phase Industrial Panels',
      'Short Circuit Diagnostics',
      'Smart Switchgear Automation'
    ],
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
    rating: 4.94,
    reviewsCount: 142,
    completedJobs: 680,
    verificationStatus: 'master',
    licenseNumber: 'WB-CEI-LIC-74892',
    issuingAuthority: 'Govt. of West Bengal - Electrical Licensing Board',
    status: 'available',
    statusText: 'Available for site visits today',
    phone: '+91 98302 44120',
    email: 'rajesh.mukherjee@girirajpower.com',
    whatsapp: '+919830244120',
    emergencySupport: true,
    serviceAreas: [
      'Salt Lake Sector V',
      'New Town Action Area I & II',
      'Rajarhat',
      'Kestopur',
      'Dum Dum',
      'Ballygunge',
      'Park Street',
      'Lake Town'
    ],
    workingHours: '08:00 AM - 08:30 PM (24x7 Emergency Calls)',
    startingRate: 499,
    rateUnit: 'base inspection / consultation',
    about:
      'Certified Class-1 Electrical Supervisor and Master Wireman with over 9 years of hands-on field experience across residential townships, high-rise real estate, and industrial power distribution systems in Greater Kolkata. Specializes in fault isolation, fire-safe conduit wiring, heavy load distribution panel commissioning, and rooftop solar grid synchronization.',
    aiDescription:
      '9+ years master electrical supervisor specialized in whole-building rewiring, 3-phase industrial panels, and solar hybrid inverter setups across Greater Kolkata with Class-1 licensing.',
    certifications: [
      {
        title: 'Class-1 Electrical Supervisor License (Grade A)',
        issuer: 'Chief Electrical Inspector, Govt. of West Bengal',
        year: '2016',
        verified: true,
        credentialId: 'WB-CEI-SUPER-8812'
      },
      {
        title: 'Certified Rooftop Solar Grid-Tied Specialist',
        issuer: 'National Institute of Solar Energy (NISE)',
        year: '2019',
        verified: true,
        credentialId: 'NISE-GRID-4190'
      },
      {
        title: 'Schneider Electric Certified Switchgear Engineer',
        issuer: 'Schneider Electric Training Institute',
        year: '2021',
        verified: true,
        credentialId: 'SE-SWG-IND-902'
      }
    ],
    skills: [
      { name: '3-Phase HT/LT Distribution & Load Balancing', proficiency: 98, experienceYears: 9 },
      { name: 'Short Circuit & Thermal Fault Diagnostics', proficiency: 96, experienceYears: 9 },
      { name: 'Conduit & Fire-Retardant Concealed Wiring', proficiency: 95, experienceYears: 8 },
      { name: 'Solar Hybrid Inverters & Lithium Storage', proficiency: 92, experienceYears: 6 },
      { name: 'Earth Pit Resistance Testing & Megger Audit', proficiency: 94, experienceYears: 8 }
    ],
    toolsCarried: [
      'Fluke 117 True-RMS Industrial Multimeter',
      'FLIR E4 Compact Thermal Imaging Camera',
      'Megger MIT300 Insulation & Continuity Tester',
      'Greenlee Hydraulic Conduit Punch & Bender',
      '1000V Insulated VDE Precision Toolkit'
    ],
    recentReviews: [
      {
        id: 'rev-01',
        customerName: 'Debabrata Sengupta',
        area: 'Salt Lake Sector II',
        rating: 5,
        date: '28 Aug 2026',
        comment:
          'Er. Rajesh inspected our 3BHK flat after repeated MCB tripping. He identified a neutral leakage within 15 minutes using thermal scan. Highly professional and punctual.',
        verifiedJob: true,
        serviceType: 'MCB & Neutral Fault Isolation'
      },
      {
        id: 'rev-02',
        customerName: 'Pooja Agarwal',
        area: 'New Town Action Area I',
        rating: 5,
        date: '19 Aug 2026',
        comment:
          'Excellent work installing our 5kVA Solar Inverter and battery bank. Neat wiring and proper earthing test completed with official report.',
        verifiedJob: true,
        serviceType: 'Solar Inverter Commissioning'
      },
      {
        id: 'rev-03',
        customerName: 'Anupam Roy',
        area: 'Rajarhat Expressway',
        rating: 4.8,
        date: '04 Aug 2026',
        comment:
          'Very knowledgeable engineer with all government licenses. Guided us on load optimization for new AC connections. Highly recommended!',
        verifiedJob: true,
        serviceType: 'Heavy Load AC Wiring & Phase Distribution'
      }
    ],
    featured: true,
    joinedDate: 'March 2021'
  },
  {
    id: 'tech-002',
    name: 'Er. Subhashis Das',
    title: 'Industrial Automation & Switchgear Specialist',
    badgeId: 'BN-IND-2024-019',
    experienceYears: 7,
    primarySector: 'Industrial Panels & Automation',
    subSectors: [
      'PLC & Relay Panels',
      'VFD Drive Calibration',
      'Factory Power Factor Correction',
      'Diesel Generator AMF Panels'
    ],
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    rating: 4.88,
    reviewsCount: 96,
    completedJobs: 430,
    verificationStatus: 'certified',
    licenseNumber: 'WB-CEI-LIC-62104',
    issuingAuthority: 'Govt. of West Bengal - Electrical Licensing Board',
    status: 'on_duty',
    statusText: 'On site in Sector V (Available from 03:00 PM)',
    phone: '+91 98311 77390',
    email: 'subhashis.das@girirajpower.com',
    whatsapp: '+919831177390',
    emergencySupport: true,
    serviceAreas: [
      'Sector V IT Hub',
      'Taratala Industrial Estate',
      'Kasba Industrial Estate',
      'Howrah Industrial Belt'
    ],
    workingHours: '09:00 AM - 07:00 PM',
    startingRate: 699,
    rateUnit: 'industrial inspection visit',
    about:
      'Industrial electrical engineer with 7+ years expertise in commercial machinery switchgear, DG synchronization, Automatic Mains Failure (AMF) panels, and power factor correction capacitors (APFC).',
    aiDescription:
      '7+ years industrial automation specialist expert in PLC relay panels, VFD drive calibration, DG synchronization, and commercial machine switchgear diagnostics.',
    certifications: [
      {
        title: 'Industrial Electrical Safety & Switchgear Certificate',
        issuer: 'National Safety Council of India',
        year: '2018',
        verified: true,
        credentialId: 'NSCI-ELEC-4011'
      }
    ],
    skills: [
      { name: 'APFC Capacitor Panel Optimization', proficiency: 94, experienceYears: 7 },
      { name: 'AMF Panel & DG Interlocking', proficiency: 92, experienceYears: 7 },
      { name: 'Motor Starter & VFD Commissioning', proficiency: 90, experienceYears: 6 }
    ],
    toolsCarried: [
      'Power Quality & Harmonics Analyzer',
      'Clamp-on Earth Resistance Tester',
      'Calibrated Phase Angle Meter'
    ],
    recentReviews: [
      {
        id: 'rev-04',
        customerName: 'Kalyan Dey',
        area: 'Sector V IT Park',
        rating: 5,
        date: '15 Aug 2026',
        comment:
          'Resolved our server room UPS back-feed issue swiftly. Clear documentation provided.',
        verifiedJob: true,
        serviceType: 'Server Room Power Audit'
      }
    ],
    featured: false,
    joinedDate: 'July 2022'
  },
  {
    id: 'tech-003',
    name: 'Er. Amitava Sen',
    title: 'Certified Rooftop Solar & Hybrid Inverter Engineer',
    badgeId: 'BN-SOLAR-2024-031',
    experienceYears: 6,
    primarySector: 'Solar & Renewable Power',
    subSectors: [
      'On-Grid & Hybrid Solar Systems',
      'Lithium LiFePO4 Battery Integration',
      'Net-Metering CEI Approvals',
      'Solar String Inverter Synchronization'
    ],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    rating: 4.96,
    reviewsCount: 114,
    completedJobs: 390,
    verificationStatus: 'master',
    licenseNumber: 'WB-CEI-SOLAR-41992',
    issuingAuthority: 'Govt. of West Bengal & MNRE Certified',
    status: 'available',
    statusText: 'Available today for solar site survey',
    phone: '+91 98320 88214',
    email: 'amitava.sen@girirajpower.com',
    whatsapp: '+919832088214',
    emergencySupport: false,
    serviceAreas: [
      'New Town Action Area I, II & III',
      'Salt Lake',
      'Rajarhat',
      'Kalyani Expressway',
      'Sonarpur'
    ],
    workingHours: '08:30 AM - 06:30 PM',
    startingRate: 599,
    rateUnit: 'solar site audit & feasibility check',
    about:
      'Govt. & NISE certified Solar PV System Engineer with 6+ years specializing in rooftop on-grid, off-grid, and hybrid solar power plants. Handled over 300+ successful net-metering synchronization projects across residential villas and commercial townships.',
    aiDescription:
      '6+ years NISE certified rooftop solar engineer handling on-grid & hybrid solar plants, net-metering approvals, and LiFePO4 battery commissioning.',
    certifications: [
      {
        title: 'Master Solar PV Engineer & Net-Metering Specialist',
        issuer: 'National Institute of Solar Energy (NISE)',
        year: '2020',
        verified: true,
        credentialId: 'NISE-SOLAR-8012'
      }
    ],
    skills: [
      { name: 'Solar PV String Design & Simulation', proficiency: 98, experienceYears: 6 },
      { name: 'Hybrid Inverters & Lithium Storage', proficiency: 96, experienceYears: 6 },
      { name: 'WBSEDCL Net-Metering CEI Liaison', proficiency: 92, experienceYears: 5 }
    ],
    toolsCarried: [
      'Solar Irradiance Pyranometer',
      'High Voltage DC Clamp Meter',
      'Thermal Imaging Scanner'
    ],
    recentReviews: [
      {
        id: 'rev-05',
        customerName: 'Somenath Roy',
        area: 'New Town Action Area II',
        rating: 5,
        date: '22 Aug 2026',
        comment:
          'Flawless 10kW rooftop solar installation with neat conduit laying and quick net-metering paperwork.',
        verifiedJob: true,
        serviceType: '10kW On-Grid Solar Installation'
      }
    ],
    featured: true,
    joinedDate: 'January 2023'
  },
  {
    id: 'tech-004',
    name: 'Er. Sandip Banerjee',
    title: '24x7 Emergency Electrical Breakdown Specialist',
    badgeId: 'BN-EMERG-2024-009',
    experienceYears: 11,
    primarySector: '24x7 Emergency & Fault Isolation',
    subSectors: [
      'Short Circuit Diagnostics',
      'Transformer & Substation Tripping',
      'Burnt Cable Joint Splicing',
      'Immediate Power Restoration'
    ],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    rating: 4.98,
    reviewsCount: 220,
    completedJobs: 890,
    verificationStatus: 'master',
    licenseNumber: 'WB-CEI-LIC-33901',
    issuingAuthority: 'Govt. of West Bengal - Electrical Licensing Board',
    status: 'available',
    statusText: 'On Emergency Standby (30-min response)',
    phone: '+91 98300 55921',
    email: 'sandip.banerjee@girirajpower.com',
    whatsapp: '+919830055921',
    emergencySupport: true,
    serviceAreas: [
      'All Kolkata & Salt Lake',
      'Howrah Central',
      'Ballygunge',
      'Alipore',
      'Behala'
    ],
    workingHours: '24 Hours Emergency Dispatch',
    startingRate: 499,
    rateUnit: 'emergency dispatch & diagnosis',
    about:
      'Senior Master Wireman with 11+ years handling critical commercial, hospital, and residential emergency power outages, short circuit fires, neutral failure isolation, and heavy switchgear breakdown restoration.',
    aiDescription:
      '11+ years emergency breakdown wireman providing rapid 30-minute dispatch for short circuit diagnosis, substation tripping, and 24x7 emergency power restoration.',
    certifications: [
      {
        title: 'Senior Master Wireman & High Voltage Supervisor',
        issuer: 'Govt. of West Bengal Electrical Licensing Board',
        year: '2014',
        verified: true,
        credentialId: 'WB-CEI-MASTER-1044'
      }
    ],
    skills: [
      { name: 'Rapid Short Circuit & Earth Leakage Tracing', proficiency: 99, experienceYears: 11 },
      { name: 'HT/LT Substation Emergency Tripping Fix', proficiency: 97, experienceYears: 11 },
      { name: 'Underground Cable Fault Pinpointing', proficiency: 95, experienceYears: 10 }
    ],
    toolsCarried: [
      'TDR Underground Cable Fault Locator',
      'Fluke Industrial Thermal Imager',
      'Megger Insulation & Continuity Tester'
    ],
    recentReviews: [
      {
        id: 'rev-06',
        customerName: 'Vikram Chordia',
        area: 'Ballygunge Circular Rd',
        rating: 5,
        date: '29 Aug 2026',
        comment:
          'Arrived within 35 minutes at 11 PM during a thunderstorm when our main switchboard caught spark. Resolved in 40 minutes safely.',
        verifiedJob: true,
        serviceType: 'Midnight Main Switchboard Repair'
      }
    ],
    featured: true,
    joinedDate: 'November 2020'
  }
];
