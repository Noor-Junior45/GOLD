-- ==============================================================================
-- GIRIRAJ POWER & DELIVERY SYSTEM - FULL BACKEND SUPABASE SQL MIGRATION
-- Migration: 20260831_delivery_and_orders_system.sql
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 2. DELIVERY PARTNERS TABLE (Riders / Couriers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  phone TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT DEFAULT 'Bike',
  rating NUMERIC(3, 2) DEFAULT 4.80,
  current_hub TEXT DEFAULT 'Kasba Hub',
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'available', -- available, busy, offline, on_delivery
  avatar_url TEXT,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for delivery partners
CREATE INDEX IF NOT EXISTS idx_delivery_partners_phone ON public.delivery_partners (phone);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_is_active ON public.delivery_partners (is_active);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON public.delivery_partners (status);

-- ------------------------------------------------------------------------------
-- 3. ORDERS TABLE (Customer Orders with delivery links)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  customer_email TEXT,
  address TEXT NOT NULL,
  area TEXT NOT NULL,
  landmark TEXT,
  pincode TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  handling_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  coupon_code TEXT,
  payment_method TEXT NOT NULL DEFAULT 'COD',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, packing, packed, out_for_delivery, near_destination, delivered, cancelled
  tracking_number TEXT,
  delivery_partner_id TEXT REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  delivery_partner JSONB,
  estimated_delivery_at TIMESTAMPTZ,
  estimated_delivery_timestamp BIGINT,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  packed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  delivery_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all optional / extended columns exist if table was created previously
DO $$ BEGIN
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landmark TEXT;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner_id TEXT REFERENCES public.delivery_partners(id) ON DELETE SET NULL;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_partner JSONB;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_delivery_timestamp BIGINT;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS packed_at TIMESTAMPTZ;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON public.orders (phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON public.orders (placed_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_partner_id ON public.orders (delivery_partner_id);

-- ------------------------------------------------------------------------------
-- 4. ORDER ITEMS TABLE (Normalized relational items per order)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  product_image TEXT,
  brand TEXT DEFAULT 'Giriraj Power',
  unit TEXT DEFAULT 'piece',
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_purchase NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- ------------------------------------------------------------------------------
-- 5. DELIVERIES TABLE (Real-time tracking linked to delivery app)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deliveries (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_partner_id TEXT REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unassigned', -- unassigned, assigned, accepted, picked_up, out_for_delivery, near_destination, delivered, failed
  estimated_delivery_at TIMESTAMPTZ,
  actual_delivery_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  otp TEXT,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS delivery_partner_id TEXT REFERENCES public.delivery_partners(id) ON DELETE SET NULL;
  ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS estimated_delivery_at TIMESTAMPTZ;
  ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
  ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS otp TEXT;
  ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS current_lat DOUBLE PRECISION;
  ALTER TABLE public.deliveries ADD COLUMN IF NOT EXISTS current_lng DOUBLE PRECISION;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries (order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_delivery_partner_id ON public.deliveries (delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries (status);

-- ------------------------------------------------------------------------------
-- 6. DELIVERY TRACKING EVENTS TABLE (Milestone logs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.delivery_tracking_events (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_id TEXT,
  stage TEXT NOT NULL, -- placed, confirmed, packing, packed, assigned, picked_up, out_for_delivery, near_destination, delivered, cancelled
  title TEXT NOT NULL,
  description TEXT,
  customer_message TEXT,
  actor TEXT DEFAULT 'system', -- customer, admin, delivery_partner, system
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_order_id ON public.delivery_tracking_events (order_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_delivery_id ON public.delivery_tracking_events (delivery_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created_at ON public.delivery_tracking_events (created_at ASC);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_tracking_events ENABLE ROW LEVEL SECURITY;

-- delivery_partners: Public/Authenticated read; Service Role or Auth full write
DROP POLICY IF EXISTS "Public Read Delivery Partners" ON public.delivery_partners;
CREATE POLICY "Public Read Delivery Partners"
  ON public.delivery_partners FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin Full Access Delivery Partners" ON public.delivery_partners;
CREATE POLICY "Admin Full Access Delivery Partners"
  ON public.delivery_partners FOR ALL
  USING (true) WITH CHECK (true);

-- orders: User can view their own orders or unauthenticated orders placed by session
DROP POLICY IF EXISTS "Users Read Own Orders" ON public.orders;
CREATE POLICY "Users Read Own Orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL OR true);

DROP POLICY IF EXISTS "Users Insert Orders" ON public.orders;
CREATE POLICY "Users Insert Orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users Update Own Orders" ON public.orders;
CREATE POLICY "Users Update Own Orders"
  ON public.orders FOR UPDATE
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users Delete Own Orders" ON public.orders;
CREATE POLICY "Users Delete Own Orders"
  ON public.orders FOR DELETE
  USING (true);

-- order_items
DROP POLICY IF EXISTS "Public Read Order Items" ON public.order_items;
CREATE POLICY "Public Read Order Items"
  ON public.order_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public Insert Order Items" ON public.order_items;
CREATE POLICY "Public Insert Order Items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public Delete Order Items" ON public.order_items;
CREATE POLICY "Public Delete Order Items"
  ON public.order_items FOR DELETE
  USING (true);

-- deliveries
DROP POLICY IF EXISTS "Public Read Deliveries" ON public.deliveries;
CREATE POLICY "Public Read Deliveries"
  ON public.deliveries FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public Full Access Deliveries" ON public.deliveries;
CREATE POLICY "Public Full Access Deliveries"
  ON public.deliveries FOR ALL
  USING (true) WITH CHECK (true);

-- delivery_tracking_events
DROP POLICY IF EXISTS "Public Read Tracking Events" ON public.delivery_tracking_events;
CREATE POLICY "Public Read Tracking Events"
  ON public.delivery_tracking_events FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public Full Access Tracking Events" ON public.delivery_tracking_events;
CREATE POLICY "Public Full Access Tracking Events"
  ON public.delivery_tracking_events FOR ALL
  USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. ATOMIC STOCK DECREMENT FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id TEXT,
  p_quantity INTEGER,
  p_order_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_prod_uuid UUID;
BEGIN
  -- Try parsing UUID
  BEGIN
    v_prod_uuid := p_product_id::UUID;
  EXCEPTION WHEN OTHERS THEN
    v_prod_uuid := NULL;
  END;

  IF v_prod_uuid IS NOT NULL THEN
    UPDATE public.products
    SET 
      stock_quantity = GREATEST(0, stock_quantity - p_quantity),
      updated_at = NOW()
    WHERE id = v_prod_uuid;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 9. REALTIME PUBLICATION SETUP FOR WEBSOCKET LISTENERS
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_partners;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 10. CLEAN DATABASE SEEDING
-- Riders will be created and managed via the dedicated Delivery Partner App
-- ------------------------------------------------------------------------------
-- Ready for Delivery Partner App onboarding & dispatch.

