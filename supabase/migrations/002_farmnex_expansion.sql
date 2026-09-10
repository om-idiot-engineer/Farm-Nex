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
