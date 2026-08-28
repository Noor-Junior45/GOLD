-- ==============================================================================
-- MIGRATION: 20260828_add_missing_tables.sql
-- Adds missing tables: user_profiles, saved_addresses, wiring_service_bookings, saved_upi_ids
-- Includes exact payload column mapping, foreign keys, sensible indexes, and RLS policies
-- ==============================================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  dob TEXT,
  wallet_balance NUMERIC(12, 2) DEFAULT 0,
  refund_balance NUMERIC(12, 2) DEFAULT 0,
  cashback_balance NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_select_policy'
  ) THEN
    CREATE POLICY "user_profiles_select_policy"
      ON public.user_profiles FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_insert_policy'
  ) THEN
    CREATE POLICY "user_profiles_insert_policy"
      ON public.user_profiles FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_update_policy'
  ) THEN
    CREATE POLICY "user_profiles_update_policy"
      ON public.user_profiles FOR UPDATE
      USING (auth.uid() = user_id OR auth.uid() IS NULL)
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'user_profiles_delete_policy'
  ) THEN
    CREATE POLICY "user_profiles_delete_policy"
      ON public.user_profiles FOR DELETE
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

-- 2. SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag TEXT NOT NULL DEFAULT 'home',
  tag_label TEXT,
  house_name TEXT,
  house_flat TEXT,
  building_road TEXT,
  landmark TEXT,
  area_name TEXT,
  pincode TEXT,
  area_data JSONB,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  formatted_exact_address TEXT,
  receiver_name TEXT,
  receiver_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for saved_addresses
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_addresses' AND policyname = 'saved_addresses_select_policy'
  ) THEN
    CREATE POLICY "saved_addresses_select_policy"
      ON public.saved_addresses FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_addresses' AND policyname = 'saved_addresses_insert_policy'
  ) THEN
    CREATE POLICY "saved_addresses_insert_policy"
      ON public.saved_addresses FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_addresses' AND policyname = 'saved_addresses_update_policy'
  ) THEN
    CREATE POLICY "saved_addresses_update_policy"
      ON public.saved_addresses FOR UPDATE
      USING (auth.uid() = user_id OR auth.uid() IS NULL)
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_addresses' AND policyname = 'saved_addresses_delete_policy'
  ) THEN
    CREATE POLICY "saved_addresses_delete_policy"
      ON public.saved_addresses FOR DELETE
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

-- 3. WIRING SERVICE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.wiring_service_bookings (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  service_category TEXT,
  project_type TEXT,
  approx_area_sq_ft NUMERIC,
  preferred_date TEXT,
  preferred_time_slot TEXT,
  site_address TEXT,
  area TEXT,
  pincode TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  estimated_price NUMERIC(12, 2),
  wire_grade TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for wiring_service_bookings
ALTER TABLE public.wiring_service_bookings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wiring_service_bookings' AND policyname = 'service_bookings_select_policy'
  ) THEN
    CREATE POLICY "service_bookings_select_policy"
      ON public.wiring_service_bookings FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wiring_service_bookings' AND policyname = 'service_bookings_insert_policy'
  ) THEN
    CREATE POLICY "service_bookings_insert_policy"
      ON public.wiring_service_bookings FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wiring_service_bookings' AND policyname = 'service_bookings_update_policy'
  ) THEN
    CREATE POLICY "service_bookings_update_policy"
      ON public.wiring_service_bookings FOR UPDATE
      USING (auth.uid() = user_id OR auth.uid() IS NULL)
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

-- 4. SAVED UPI IDS TABLE
CREATE TABLE IF NOT EXISTS public.saved_upi_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  upi_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT uq_user_upi UNIQUE (user_id, upi_id)
);

-- Enable RLS for saved_upi_ids
ALTER TABLE public.saved_upi_ids ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_upi_ids' AND policyname = 'saved_upi_select_policy'
  ) THEN
    CREATE POLICY "saved_upi_select_policy"
      ON public.saved_upi_ids FOR SELECT
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_upi_ids' AND policyname = 'saved_upi_insert_policy'
  ) THEN
    CREATE POLICY "saved_upi_insert_policy"
      ON public.saved_upi_ids FOR INSERT
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_upi_ids' AND policyname = 'saved_upi_update_policy'
  ) THEN
    CREATE POLICY "saved_upi_update_policy"
      ON public.saved_upi_ids FOR UPDATE
      USING (auth.uid() = user_id OR auth.uid() IS NULL)
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_upi_ids' AND policyname = 'saved_upi_delete_policy'
  ) THEN
    CREATE POLICY "saved_upi_delete_policy"
      ON public.saved_upi_ids FOR DELETE
      USING (auth.uid() = user_id OR auth.uid() IS NULL);
  END IF;
END $$;

-- 5. INDEXES FOR HIGH CONCURRENCY AND FILTERING
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON public.user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_user ON public.saved_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_pincode ON public.saved_addresses(pincode);
CREATE INDEX IF NOT EXISTS idx_service_bookings_user ON public.wiring_service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_status ON public.wiring_service_bookings(status);
CREATE INDEX IF NOT EXISTS idx_saved_upi_user ON public.saved_upi_ids(user_id);
