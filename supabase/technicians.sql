-- ============================================================================
-- BUILDNOW / GIRIRAJ POWER - TECHNICIANS & FIELD SPECIALISTS TABLE
-- Execute this script in your Supabase SQL Editor to manage technician profiles.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.technicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  badge_id TEXT UNIQUE NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 1,
  primary_sector TEXT NOT NULL,
  sub_sectors TEXT[] DEFAULT '{}',
  photo TEXT NOT NULL,
  rating NUMERIC(3,2) DEFAULT 5.00,
  reviews_count INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('verified', 'certified', 'master')),
  license_number TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'on_duty', 'busy')),
  status_text TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  emergency_support BOOLEAN DEFAULT false,
  service_areas TEXT[] DEFAULT '{}',
  working_hours TEXT DEFAULT '08:00 AM - 08:00 PM',
  starting_rate NUMERIC(10,2) DEFAULT 499.00,
  rate_unit TEXT DEFAULT 'base inspection visit',
  about TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  tools_carried TEXT[] DEFAULT '{}',
  recent_reviews JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  joined_date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Public can read all active technician profiles
CREATE POLICY "Public Read Technicians"
  ON public.technicians
  FOR SELECT
  USING (true);

-- Authenticated admins/service managers can insert/update technician profiles
CREATE POLICY "Admin Modify Technicians"
  ON public.technicians
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Index for fast querying by sector and status
CREATE INDEX IF NOT EXISTS idx_technicians_status ON public.technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_sector ON public.technicians(primary_sector);
CREATE INDEX IF NOT EXISTS idx_technicians_badge ON public.technicians(badge_id);

-- ============================================================================
-- SEED DATA: DEMO TECHNICIAN (Er. Rajesh Mukherjee)
-- ============================================================================

INSERT INTO public.technicians (
  id,
  name,
  title,
  badge_id,
  experience_years,
  primary_sector,
  sub_sectors,
  photo,
  rating,
  reviews_count,
  completed_jobs,
  verification_status,
  license_number,
  issuing_authority,
  status,
  status_text,
  phone,
  email,
  whatsapp,
  emergency_support,
  service_areas,
  working_hours,
  starting_rate,
  rate_unit,
  about,
  certifications,
  skills,
  tools_carried,
  recent_reviews,
  featured,
  joined_date
) VALUES (
  'tech-001',
  'Er. Rajesh Mukherjee',
  'Lead Electrical Engineer & Master Wireman',
  'BN-ELEC-2024-042',
  9,
  'Residential & Commercial Power Systems',
  ARRAY[
    'Whole-Building Rewiring',
    'Solar Hybrid Inverters',
    '3-Phase Industrial Panels',
    'Short Circuit Diagnostics',
    'Smart Switchgear Automation'
  ],
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80',
  4.94,
  142,
  680,
  'master',
  'WB-CEI-LIC-74892',
  'Govt. of West Bengal - Electrical Licensing Board',
  'available',
  'Available for site visits today',
  '+91 98302 44120',
  'rajesh.mukherjee@girirajpower.com',
  '+919830244120',
  true,
  ARRAY[
    'Salt Lake Sector V',
    'New Town Action Area I & II',
    'Rajarhat',
    'Kestopur',
    'Dum Dum',
    'Ballygunge',
    'Park Street',
    'Lake Town'
  ],
  '08:00 AM - 08:30 PM (24x7 Emergency Calls)',
  499.00,
  'base inspection / consultation',
  'Certified Class-1 Electrical Supervisor and Master Wireman with over 9 years of hands-on field experience across residential townships, high-rise real estate, and industrial power distribution systems in Greater Kolkata. Specializes in fault isolation, fire-safe conduit wiring, heavy load distribution panel commissioning, and rooftop solar grid synchronization.',
  '[
    {
      "title": "Class-1 Electrical Supervisor License (Grade A)",
      "issuer": "Chief Electrical Inspector, Govt. of West Bengal",
      "year": "2016",
      "verified": true,
      "credentialId": "WB-CEI-SUPER-8812"
    },
    {
      "title": "Certified Rooftop Solar Grid-Tied Specialist",
      "issuer": "National Institute of Solar Energy (NISE)",
      "year": "2019",
      "verified": true,
      "credentialId": "NISE-GRID-4190"
    },
    {
      "title": "Schneider Electric Certified Switchgear Engineer",
      "issuer": "Schneider Electric Training Institute",
      "year": "2021",
      "verified": true,
      "credentialId": "SE-SWG-IND-902"
    }
  ]'::jsonb,
  '[
    { "name": "3-Phase HT/LT Distribution & Load Balancing", "proficiency": 98, "experienceYears": 9 },
    { "name": "Short Circuit & Thermal Fault Diagnostics", "proficiency": 96, "experienceYears": 9 },
    { "name": "Conduit & Fire-Retardant Concealed Wiring", "proficiency": 95, "experienceYears": 8 },
    { "name": "Solar Hybrid Inverters & Lithium Storage", "proficiency": 92, "experienceYears": 6 },
    { "name": "Earth Pit Resistance Testing & Megger Audit", "proficiency": 94, "experienceYears": 8 }
  ]'::jsonb,
  ARRAY[
    'Fluke 117 True-RMS Industrial Multimeter',
    'FLIR E4 Compact Thermal Imaging Camera',
    'Megger MIT300 Insulation & Continuity Tester',
    'Greenlee Hydraulic Conduit Punch & Bender',
    '1000V Insulated VDE Precision Toolkit'
  ],
  '[
    {
      "id": "rev-01",
      "customerName": "Debabrata Sengupta",
      "area": "Salt Lake Sector II",
      "rating": 5,
      "date": "28 Aug 2026",
      "comment": "Er. Rajesh inspected our 3BHK flat after repeated MCB tripping. He identified a neutral leakage within 15 minutes using thermal scan. Highly professional and punctual.",
      "verifiedJob": true,
      "serviceType": "MCB & Neutral Fault Isolation"
    },
    {
      "id": "rev-02",
      "customerName": "Pooja Agarwal",
      "area": "New Town Action Area I",
      "rating": 5,
      "date": "19 Aug 2026",
      "comment": "Excellent work installing our 5kVA Solar Inverter and battery bank. Neat wiring and proper earthing test completed with official report.",
      "verifiedJob": true,
      "serviceType": "Solar Inverter Commissioning"
    },
    {
      "id": "rev-03",
      "customerName": "Anupam Roy",
      "area": "Rajarhat Expressway",
      "rating": 4.8,
      "date": "04 Aug 2026",
      "comment": "Very knowledgeable engineer with all government licenses. Guided us on load optimization for new AC connections. Highly recommended!",
      "verifiedJob": true,
      "serviceType": "Heavy Load AC Wiring & Phase Distribution"
    }
  ]'::jsonb,
  true,
  'March 2021'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  badge_id = EXCLUDED.badge_id,
  experience_years = EXCLUDED.experience_years,
  primary_sector = EXCLUDED.primary_sector,
  sub_sectors = EXCLUDED.sub_sectors,
  photo = EXCLUDED.photo,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  completed_jobs = EXCLUDED.completed_jobs,
  verification_status = EXCLUDED.verification_status,
  license_number = EXCLUDED.license_number,
  issuing_authority = EXCLUDED.issuing_authority,
  status = EXCLUDED.status,
  status_text = EXCLUDED.status_text,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  whatsapp = EXCLUDED.whatsapp,
  emergency_support = EXCLUDED.emergency_support,
  service_areas = EXCLUDED.service_areas,
  working_hours = EXCLUDED.working_hours,
  starting_rate = EXCLUDED.starting_rate,
  rate_unit = EXCLUDED.rate_unit,
  about = EXCLUDED.about,
  certifications = EXCLUDED.certifications,
  skills = EXCLUDED.skills,
  tools_carried = EXCLUDED.tools_carried,
  recent_reviews = EXCLUDED.recent_reviews,
  featured = EXCLUDED.featured,
  joined_date = EXCLUDED.joined_date,
  updated_at = NOW();
