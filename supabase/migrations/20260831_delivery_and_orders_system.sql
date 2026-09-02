-- ==============================================================================
-- GIRIRAJ POWER — DELIVERY SYSTEM
-- Migration: 20260831_delivery_and_orders_system.sql
-- NOTE: This file was corrected after review. The original version included
-- RLS policies (USING (true), auth.uid() = user_id OR user_id IS NULL) on
-- `orders`/`order_items` that would have let unauthenticated requests read,
-- write, and delete any customer's order data. Those tables already exist
-- in production with correct owner/admin-scoped RLS — do not redefine them
-- here. This migration only covers the delivery-tracking tables, which are
-- new and match this schema.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DELIVERY PARTNERS (Riders / Couriers)
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  phone TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT DEFAULT 'Bike',
  rating NUMERIC(3,2) DEFAULT 4.80,
  current_hub TEXT DEFAULT 'Kasba Hub',
  is_active BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'available',
  avatar_url TEXT,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_phone ON public.delivery_partners(phone);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_status ON public.delivery_partners(status);
ALTER TABLE public.delivery_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read delivery partners" ON public.delivery_partners;
CREATE POLICY "Public read delivery partners" ON public.delivery_partners
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage delivery partners" ON public.delivery_partners;
CREATE POLICY "Admins manage delivery partners" ON public.delivery_partners
  FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 2. DELIVERIES (order_id is UUID — matches public.orders.id, NOT text)
CREATE TABLE IF NOT EXISTS public.deliveries (
  id TEXT PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_partner_id TEXT REFERENCES public.delivery_partners(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'unassigned',
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
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON public.deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own deliveries" ON public.deliveries;
CREATE POLICY "Users view own deliveries" ON public.deliveries
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = deliveries.order_id AND (o.user_id = auth.uid() OR private.is_admin()))
  );

DROP POLICY IF EXISTS "Admins manage deliveries" ON public.deliveries;
CREATE POLICY "Admins manage deliveries" ON public.deliveries
  FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 3. DELIVERY TRACKING EVENTS
CREATE TABLE IF NOT EXISTS public.delivery_tracking_events (
  id TEXT PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_id TEXT,
  stage TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  customer_message TEXT,
  actor TEXT DEFAULT 'system',
  location_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracking_events_order_id ON public.delivery_tracking_events(order_id);
ALTER TABLE public.delivery_tracking_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own tracking events" ON public.delivery_tracking_events;
CREATE POLICY "Users view own tracking events" ON public.delivery_tracking_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = delivery_tracking_events.order_id AND (o.user_id = auth.uid() OR private.is_admin()))
  );

DROP POLICY IF EXISTS "Admins manage tracking events" ON public.delivery_tracking_events;
CREATE POLICY "Admins manage tracking events" ON public.delivery_tracking_events
  FOR ALL TO authenticated
  USING (private.is_admin()) WITH CHECK (private.is_admin());

-- 4. REALTIME PUBLICATION (safe to re-run; errors are swallowed if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_tracking_events;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
