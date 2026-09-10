-- Farm-Nex Database Schema (SIH 2026 Problem Statement 26033)
-- Fully compatible with Supabase PostgreSQL and Row-Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('farmer', 'buyer', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE crop_listing_status AS ENUM ('listed', 'matched', 'in_transit', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE match_status AS ENUM ('proposed', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trade_status AS ENUM ('contracted', 'in_transit', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE community_tag AS ENUM ('question', 'market', 'machinery', 'expert_verified');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES

-- Users table (mirrored/linked to auth.users or standalone with uuid)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE, -- linked to Supabase auth.users.id when using Supabase Auth
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'farmer',
    language_pref TEXT NOT NULL DEFAULT 'hi', -- 'hi' or 'en'
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Farmer Profiles
CREATE TABLE IF NOT EXISTS public.farmer_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    fpo_name TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Buyer Profiles
CREATE TABLE IF NOT EXISTS public.buyer_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    gst_verified BOOLEAN NOT NULL DEFAULT FALSE,
    location TEXT,
    lat FLOAT8,
    lng FLOAT8,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crop Listings (created by farmers)
CREATE TABLE IF NOT EXISTS public.crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    commodity TEXT NOT NULL, -- 'soybean', 'wheat', 'cotton'
    quantity NUMERIC NOT NULL CHECK (quantity > 0), -- in quintals
    quality_grade TEXT NOT NULL DEFAULT 'Grade A',
    harvest_date DATE NOT NULL,
    location TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    expected_price NUMERIC NOT NULL CHECK (expected_price > 0), -- per quintal (INR)
    photo_url TEXT,
    status crop_listing_status NOT NULL DEFAULT 'listed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Demand Posts (created by bulk buyers)
CREATE TABLE IF NOT EXISTS public.demand_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    commodity TEXT NOT NULL,
    quantity_needed NUMERIC NOT NULL CHECK (quantity_needed > 0),
    quality_grade TEXT NOT NULL DEFAULT 'Grade A',
    offered_price NUMERIC NOT NULL CHECK (offered_price > 0),
    location TEXT NOT NULL,
    lat FLOAT8 NOT NULL,
    lng FLOAT8 NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Matches (computations between listings & demands)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES public.crop_listings(id) ON DELETE CASCADE,
    demand_id UUID NOT NULL REFERENCES public.demand_posts(id) ON DELETE CASCADE,
    matching_score NUMERIC NOT NULL CHECK (matching_score >= 0 AND matching_score <= 100),
    net_realization_estimate NUMERIC NOT NULL,
    logistics_cost_estimate NUMERIC NOT NULL,
    status match_status NOT NULL DEFAULT 'proposed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(listing_id, demand_id)
);

-- Trade Agreements (contractualized accepted matches)
CREATE TABLE IF NOT EXISTS public.trade_agreements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE RESTRICT,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price > 0),
    delivery_date DATE NOT NULL,
    status trade_status NOT NULL DEFAULT 'contracted',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Market Prices (historical Mandi records)
CREATE TABLE IF NOT EXISTS public.market_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    commodity TEXT NOT NULL,
    region TEXT NOT NULL,
    date DATE NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0),
    source TEXT NOT NULL DEFAULT 'Agmarknet',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_market_prices_commodity_region ON public.market_prices(commodity, region, date);

-- Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tag community_tag NOT NULL DEFAULT 'question',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demand_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current authenticated user id in public.users
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RLS: users
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth_id = auth.uid());

CREATE POLICY "Users can insert during registration" ON public.users
    FOR INSERT WITH CHECK (auth_id = auth.uid() OR auth_id IS NULL);

-- RLS: farmer_profiles
CREATE POLICY "Public can view farmer profiles" ON public.farmer_profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "Farmers can edit their own profile" ON public.farmer_profiles
    FOR ALL USING (user_id = public.get_current_user_id() OR public.is_admin());

-- RLS: buyer_profiles
CREATE POLICY "Public can view buyer profiles" ON public.buyer_profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "Buyers can edit their own profile" ON public.buyer_profiles
    FOR ALL USING (user_id = public.get_current_user_id() OR public.is_admin());

-- RLS: crop_listings
CREATE POLICY "Anyone can view active crop listings" ON public.crop_listings
    FOR SELECT USING (TRUE);

CREATE POLICY "Farmers can insert their own listings" ON public.crop_listings
    FOR INSERT WITH CHECK (farmer_id = public.get_current_user_id());

CREATE POLICY "Farmers can update/delete their own listings" ON public.crop_listings
    FOR UPDATE USING (farmer_id = public.get_current_user_id() OR public.is_admin());

-- RLS: demand_posts
CREATE POLICY "Anyone can view active demand posts" ON public.demand_posts
    FOR SELECT USING (TRUE);

CREATE POLICY "Buyers can insert their own demands" ON public.demand_posts
    FOR INSERT WITH CHECK (buyer_id = public.get_current_user_id());

CREATE POLICY "Buyers can update/delete their own demands" ON public.demand_posts
    FOR UPDATE USING (buyer_id = public.get_current_user_id() OR public.is_admin());

-- RLS: matches
CREATE POLICY "Participants and admins can view matches" ON public.matches
    FOR SELECT USING (
        public.is_admin() OR
        listing_id IN (SELECT id FROM public.crop_listings WHERE farmer_id = public.get_current_user_id()) OR
        demand_id IN (SELECT id FROM public.demand_posts WHERE buyer_id = public.get_current_user_id())
    );

CREATE POLICY "System/Service role or participants can update matches" ON public.matches
    FOR UPDATE USING (
        public.is_admin() OR
        listing_id IN (SELECT id FROM public.crop_listings WHERE farmer_id = public.get_current_user_id()) OR
        demand_id IN (SELECT id FROM public.demand_posts WHERE buyer_id = public.get_current_user_id())
    );

-- RLS: trade_agreements
CREATE POLICY "Participants can view their trade agreements" ON public.trade_agreements
    FOR SELECT USING (
        public.is_admin() OR
        match_id IN (
            SELECT m.id FROM public.matches m
            JOIN public.crop_listings l ON m.listing_id = l.id
            JOIN public.demand_posts d ON m.demand_id = d.id
            WHERE l.farmer_id = public.get_current_user_id() OR d.buyer_id = public.get_current_user_id()
        )
    );

-- RLS: market_prices
CREATE POLICY "Market prices are public read-only" ON public.market_prices
    FOR SELECT USING (TRUE);

CREATE POLICY "Only admin/service role can modify market prices" ON public.market_prices
    FOR ALL USING (public.is_admin());

-- RLS: community_posts
CREATE POLICY "Community posts are readable by all" ON public.community_posts
    FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create community posts" ON public.community_posts
    FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "Authors can update their community posts" ON public.community_posts
    FOR UPDATE USING (user_id = public.get_current_user_id() OR public.is_admin());
-- 002_farmnex_expansion.sql

-- 1. Create Crops Table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_en TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cereal', 'pulse', 'oilseed', 'cash_crop', 'vegetable', 'fruit', 'spice', 'other')),
    icon TEXT,
    common_units TEXT DEFAULT 'quintal',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed crops (partial list, more to be seeded in application layer)
INSERT INTO public.crops (id, name_en, name_hi, category, icon) VALUES 
('c0000000-0000-0000-0000-000000000001', 'Soybean', 'सोयाबीन', 'oilseed', 'soybean_icon'),
('c0000000-0000-0000-0000-000000000002', 'Wheat', 'गेहूं', 'cereal', 'wheat_icon'),
('c0000000-0000-0000-0000-000000000003', 'Cotton', 'कपास', 'cash_crop', 'cotton_icon'),
('c0000000-0000-0000-0000-000000000004', 'Maize', 'मक्का', 'cereal', 'maize_icon'),
('c0000000-0000-0000-0000-000000000005', 'Mustard', 'सरसों', 'oilseed', 'mustard_icon');

-- 2. Modify Community Posts (Adding photos)
CREATE TABLE IF NOT EXISTS public.post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    alt_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Modify crop_listings and demand_posts
-- Add crop_id (FK to crops) and origin_post_id (FK to community_posts)
ALTER TABLE public.crop_listings 
ADD COLUMN crop_id UUID REFERENCES public.crops(id),
ADD COLUMN origin_post_id UUID REFERENCES public.community_posts(id);

-- Migration logic to map existing string 'commodity' to 'crop_id'
UPDATE public.crop_listings SET crop_id = 'c0000000-0000-0000-0000-000000000001' WHERE commodity = 'soybean';
UPDATE public.crop_listings SET crop_id = 'c0000000-0000-0000-0000-000000000002' WHERE commodity = 'wheat';
UPDATE public.crop_listings SET crop_id = 'c0000000-0000-0000-0000-000000000003' WHERE commodity = 'cotton';

ALTER TABLE public.demand_posts 
ADD COLUMN crop_id UUID REFERENCES public.crops(id),
ADD COLUMN origin_post_id UUID REFERENCES public.community_posts(id);

UPDATE public.demand_posts SET crop_id = 'c0000000-0000-0000-0000-000000000001' WHERE commodity = 'soybean';
UPDATE public.demand_posts SET crop_id = 'c0000000-0000-0000-0000-000000000002' WHERE commodity = 'wheat';
UPDATE public.demand_posts SET crop_id = 'c0000000-0000-0000-0000-000000000003' WHERE commodity = 'cotton';

-- 4. Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

-- 5. Digital Trade Agreement Additions
ALTER TABLE public.trade_agreements 
ADD COLUMN quality_spec JSONB,
ADD COLUMN payment_status TEXT DEFAULT 'Not Started' CHECK (payment_status IN ('Not Started', 'Marked Paid by Buyer', 'Confirmed Received by Farmer', 'Disputed')),
ADD COLUMN delivery_confirmed_by_farmer_at TIMESTAMPTZ,
ADD COLUMN delivery_confirmed_by_buyer_at TIMESTAMPTZ;

-- Event log for Trade Agreements
CREATE TABLE IF NOT EXISTS public.trade_agreement_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_agreement_id UUID NOT NULL REFERENCES public.trade_agreements(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id),
    event_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Disputes
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trade_agreement_id UUID NOT NULL REFERENCES public.trade_agreements(id) ON DELETE CASCADE,
    raiser_id UUID NOT NULL REFERENCES public.users(id),
    against_id UUID NOT NULL REFERENCES public.users(id),
    reason_category TEXT NOT NULL CHECK (reason_category IN ('quality_mismatch', 'quantity_mismatch', 'non_payment', 'non_delivery', 'other')),
    explanation TEXT NOT NULL,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 7. Ratings (Bidirectional)
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rater_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ratee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    trade_agreement_id UUID REFERENCES public.trade_agreements(id) ON DELETE CASCADE,
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    payment_or_reliability_score INTEGER CHECK (payment_or_reliability_score >= 1 AND payment_or_reliability_score <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_ratings_trade_rater ON public.ratings(trade_agreement_id, rater_id);

-- 8. Market Prices changes
-- NOTE: market_prices already has source. But wait, I should verify the schema.
-- According to schema.sql: "source TEXT NOT NULL DEFAULT 'Agmarknet'".
-- I will add fetched_at.
ALTER TABLE public.market_prices
ADD COLUMN fetched_at TIMESTAMPTZ DEFAULT NOW();

-- Setup RLS for new tables
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_agreement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Crops are public read-only" ON public.crops FOR SELECT USING (TRUE);
CREATE POLICY "Post media public read" ON public.post_media FOR SELECT USING (TRUE);
CREATE POLICY "Post comments public read" ON public.post_comments FOR SELECT USING (TRUE);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "Trade events viewable by participants" ON public.trade_agreement_events
    FOR SELECT USING (
        public.is_admin() OR
        trade_agreement_id IN (
            SELECT ta.id FROM public.trade_agreements ta
            JOIN public.matches m ON ta.match_id = m.id
            JOIN public.crop_listings l ON m.listing_id = l.id
            JOIN public.demand_posts d ON m.demand_id = d.id
            WHERE l.farmer_id = public.get_current_user_id() OR d.buyer_id = public.get_current_user_id()
        )
    );

CREATE POLICY "Disputes viewable by participants" ON public.disputes
    FOR SELECT USING (raiser_id = public.get_current_user_id() OR against_id = public.get_current_user_id() OR public.is_admin());

CREATE POLICY "Ratings viewable by all" ON public.ratings FOR SELECT USING (TRUE);
CREATE POLICY "Users can create ratings" ON public.ratings FOR INSERT WITH CHECK (rater_id = public.get_current_user_id());
