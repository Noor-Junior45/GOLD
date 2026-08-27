-- ==============================================================================
-- GIRIRAJ POWER - SUPABASE ELECTRICAL PRODUCTS & REVIEWS SCHEMA (PART 1)
-- Run this entire script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable pgcrypto / uuid-ossp if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE `products` TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Electrical',
  subcategory TEXT NOT NULL, -- e.g. 'Fans', 'Wiring', 'Switches', 'MCBs', 'Lights', 'PVC Items'
  price NUMERIC NOT NULL CHECK (price >= 0),
  mrp NUMERIC NOT NULL CHECK (mrp >= price),
  discount_percent NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN mrp > 0 THEN ROUND(((mrp - price) / mrp) * 100) 
      ELSE 0 
    END
  ) STORED,
  description TEXT NOT NULL DEFAULT '',
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  rating_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for speedy listing queries & filter matching
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products (subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products (price);
CREATE INDEX IF NOT EXISTS idx_products_rating_avg ON public.products (rating_avg DESC);

-- 3. CREATE `reviews` TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews (created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Products RLS: Public Read-only from client (Writes allowed via Service Role / Admin)
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products"
  ON public.products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service Role Admin Full Access Products" ON public.products;
CREATE POLICY "Service Role Admin Full Access Products"
  ON public.products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Reviews RLS:
-- Anyone (even logged out) can SELECT reviews
DROP POLICY IF EXISTS "Public Read Reviews" ON public.reviews;
CREATE POLICY "Public Read Reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Only authenticated users can INSERT a review, and only for their own user_id
DROP POLICY IF EXISTS "Authenticated User Insert Own Review" ON public.reviews;
CREATE POLICY "Authenticated User Insert Own Review"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own review
DROP POLICY IF EXISTS "Users Update Own Review" ON public.reviews;
CREATE POLICY "Users Update Own Review"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own review
DROP POLICY IF EXISTS "Users Delete Own Review" ON public.reviews;
CREATE POLICY "Users Delete Own Review"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. TRIGGER & FUNCTION: RECALCULATE rating_avg & rating_count AUTOMATICALLY
CREATE OR REPLACE FUNCTION public.recalculate_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_product_id UUID;
  new_avg NUMERIC(3, 2);
  new_count INTEGER;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    target_product_id := OLD.product_id;
  ELSE
    target_product_id := NEW.product_id;
  END IF;

  -- Calculate new aggregate rating and count
  SELECT 
    COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
    COUNT(*)
  INTO 
    new_avg,
    new_count
  FROM public.reviews
  WHERE product_id = target_product_id;

  -- Update products table
  UPDATE public.products
  SET 
    rating_avg = new_avg,
    rating_count = new_count,
    updated_at = NOW()
  WHERE id = target_product_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to reviews table for INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS trigger_recalculate_product_rating ON public.reviews;
CREATE TRIGGER trigger_recalculate_product_rating
AFTER INSERT OR UPDATE OF rating, product_id OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_product_rating();

-- ==============================================================================
-- 6. SAMPLE SEED DATA (Electrical Products for Kolkata Quick-Commerce)
-- ==============================================================================
INSERT INTO public.products (
  id, name, brand, category, subcategory, price, mrp, description, specifications, stock_quantity, image_urls, rating_avg, rating_count
) VALUES
(
  'e1000000-0000-0000-0000-000000000001',
  'RR Kabel FR-LS Flame Retardant 0.75 Sqmm Copper House Wire (200 Metres)',
  'RR Kabel',
  'Electrical',
  'Wiring',
  3065,
  3200,
  'Premium 100% electrolytic grade multi-strand copper wire with Flame Retardant Low Smoke (FR-LS) insulation. Certified for domestic and industrial wiring.',
  '{
    "General": {
      "Brand": "RR Kabel",
      "Model Name": "Superex FR-LS",
      "Color": "Red / Blue / Black / Yellow",
      "Type": "Flexible Copper Multi-Strand Wire"
    },
    "Specifications": {
      "Conductor Size": "0.75 Sq mm",
      "Coil Length": "200 Metres",
      "Voltage Rating": "1100 Volts",
      "Insulation Type": "FR-LS PVC",
      "ISI Certified": "Yes (IS 694)"
    },
    "Warranty": {
      "Warranty Summary": "Manufacturer Genuine Replacement Guarantee",
      "Covered in Warranty": "Manufacturing Defect"
    }
  }'::jsonb,
  85,
  ARRAY[
    'https://images.unsplash.com/photo-1558223616-e5d79faebdd6?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544724559-562244955743?q=80&w=800&auto=format&fit=crop'
  ],
  4.8,
  124
),
(
  'e1000000-0000-0000-0000-000000000002',
  'Havells Crabtree Athena 6A 1-Way Modular Switch (Arctic White)',
  'Havells',
  'Electrical',
  'Switches',
  145,
  195,
  'Sleek modern Crabtree Athena modular switch engineered with silver alloy contacts for smooth, spark-free switching and fire-resistant polycarbonate body.',
  '{
    "General": {
      "Brand": "Havells Crabtree",
      "Series": "Athena",
      "Color": "Arctic White",
      "Type": "Modular Rocker Switch"
    },
    "Specifications": {
      "Current Rating": "6 Ampere",
      "Voltage Rating": "240V AC",
      "No of Modules": "1 Module",
      "Contact Material": "Silver Cadmium Oxide",
      "Material": "Polycarbonate UV Resistant"
    },
    "Warranty": {
      "Warranty Summary": "2 Years Manufacturer Warranty",
      "Covered in Warranty": "Mechanism failure"
    }
  }'::jsonb,
  120,
  ARRAY[
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop'
  ],
  4.7,
  89
),
(
  'e1000000-0000-0000-0000-000000000003',
  'Schneider Electric Easy9 32A C-Curve Double Pole MCB (10kA)',
  'Schneider',
  'Electrical',
  'MCBs',
  480,
  620,
  'Schneider Electric Easy9 double pole miniature circuit breaker designed for comprehensive short-circuit and overload protection for domestic main panels.',
  '{
    "General": {
      "Brand": "Schneider Electric",
      "Range": "Easy9",
      "Poles": "Double Pole (2P)",
      "Tripping Curve": "C Curve"
    },
    "Specifications": {
      "Current Rating": "32 Ampere",
      "Breaking Capacity": "10 kA",
      "Operating Voltage": "415V AC",
      "Mounting": "DIN Rail Standard 35mm"
    },
    "Warranty": {
      "Warranty Summary": "1 Year Manufacturer Guarantee",
      "Covered in Warranty": "Factory defects"
    }
  }'::jsonb,
  45,
  ARRAY[
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581092335397-9583fe92d232?q=80&w=800&auto=format&fit=crop'
  ],
  4.9,
  152
),
(
  'e1000000-0000-0000-0000-000000000004',
  'Havells Festiva 1200mm High Speed Decorative Ceiling Fan (Gold Mist)',
  'Havells',
  'Electrical',
  'Fans',
  2499,
  3350,
  'Powerful 1200mm sweep ceiling fan with 100% pure copper motor, aerodynamic metallic finish blades, and superior air delivery of 230 CMM.',
  '{
    "General": {
      "Brand": "Havells",
      "Model": "Festiva Decorative",
      "Color": "Gold Mist",
      "Type": "Ceiling Fan"
    },
    "Specifications": {
      "Sweep Size": "1200 mm (48 inch)",
      "Motor Speed": "390 RPM",
      "Air Delivery": "230 CMM",
      "Power Consumption": "74 Watts",
      "Blades": "3 Aerodynamic Ribbed Blades"
    },
    "Warranty": {
      "Warranty Summary": "2 Years Comprehensive On-Site Warranty",
      "Covered in Warranty": "Motor & Electrical components"
    }
  }'::jsonb,
  30,
  ARRAY[
    'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop'
  ],
  4.6,
  210
),
(
  'e1000000-0000-0000-0000-000000000005',
  'Philips Stellar Bright 12W B22 Cool Daylight LED Bulb (Pack of 4)',
  'Philips',
  'Electrical',
  'Lights',
  449,
  640,
  'Energy-efficient 12W LED bulb pack emitting 1200 Lumens crystal-clear cool daylight (6500K). Features EyeComfort technology with no glare or flicker.',
  '{
    "General": {
      "Brand": "Philips",
      "Pack": "Pack of 4",
      "Base Type": "B22 (Pin Type)",
      "Color Temperature": "6500K (Cool Daylight)"
    },
    "Specifications": {
      "Wattage": "12 Watts",
      "Luminous Flux": "1200 Lumens",
      "Surge Protection": "Up to 4kV",
      "Lifetime": "25,000 Operating Hours"
    },
    "Warranty": {
      "Warranty Summary": "1 Year Manufacturer Replacement Warranty",
      "Covered in Warranty": "Driver/LED failure"
    }
  }'::jsonb,
  95,
  ARRAY[
    'https://images.unsplash.com/photo-1550985616-10810253b84d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop'
  ],
  4.8,
  340
),
(
  'e1000000-0000-0000-0000-000000000006',
  'Polycab 25mm Heavy Duty PVC Electrical Conduit Pipe (3 Metre Length)',
  'Polycab',
  'Electrical',
  'PVC Items',
  95,
  120,
  'Unplasticized rigid PVC electrical conduit pipe with high impact resistance and smooth interior for friction-free house wiring installations.',
  '{
    "General": {
      "Brand": "Polycab",
      "Material": "Heavy Mechanical Grade uPVC",
      "Color": "Ivory White",
      "Type": "Rigid Electrical Conduit"
    },
    "Specifications": {
      "Outer Diameter": "25 mm",
      "Length": "3 Metres",
      "Fire Rating": "Self-Extinguishing (FR)",
      "Standard": "IS:9537 Part 3"
    },
    "Warranty": {
      "Warranty Summary": "100% Genuine Polycab Guarantee"
    }
  }'::jsonb,
  200,
  ARRAY[
    'https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800&auto=format&fit=crop'
  ],
  4.5,
  64
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  mrp = EXCLUDED.mrp,
  specifications = EXCLUDED.specifications,
  image_urls = EXCLUDED.image_urls,
  subcategory = EXCLUDED.subcategory;
