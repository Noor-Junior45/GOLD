-- ============================================================================
-- SUPABASE DATABASE SCHEMA: cart_items and saved_items tables
-- Giriraj Power E-Commerce & Wiring Application
-- ============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE cart_items TABLE
-- Stores user cart rows with foreign keys to auth.users and public.products
CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    selected_color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_product UNIQUE (user_id, product_id)
);

-- Add index for fast querying by user
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;

-- RLS Policies: users can only view, add, update, and delete their own cart items
CREATE POLICY "Users can view their own cart items" 
    ON public.cart_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" 
    ON public.cart_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
    ON public.cart_items FOR UPDATE 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
    ON public.cart_items FOR DELETE 
    USING (auth.uid() = user_id);


-- 3. CREATE saved_items TABLE (Save for later / Wishlist)
CREATE TABLE IF NOT EXISTS public.saved_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_saved_product UNIQUE (user_id, product_id)
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_product_id ON public.saved_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can insert their own saved items" ON public.saved_items;
DROP POLICY IF EXISTS "Users can delete their own saved items" ON public.saved_items;

-- RLS Policies: users can only view, add, and delete their own saved items
CREATE POLICY "Users can view their own saved items" 
    ON public.saved_items FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items" 
    ON public.saved_items FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items" 
    ON public.saved_items FOR DELETE 
    USING (auth.uid() = user_id);
