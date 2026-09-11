-- 003_social_trust_messaging.sql

-- Expand Enums
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'fpo';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'consumer';

ALTER TYPE public.trade_status ADD VALUE IF NOT EXISTS 'matched';
ALTER TYPE public.trade_status ADD VALUE IF NOT EXISTS 'trade_confirmed';
ALTER TYPE public.trade_status ADD VALUE IF NOT EXISTS 'pickup_scheduled';
ALTER TYPE public.trade_status ADD VALUE IF NOT EXISTS 'pickup_completed';
ALTER TYPE public.trade_status ADD VALUE IF NOT EXISTS 'payment_confirmed';
ALTER TYPE public.trade_status ADD VALUE IF NOT EXISTS 'completed';

-- Column Additions
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS business_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE public.community_posts
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

ALTER TABLE public.post_media
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Missing RLS for post_media
CREATE POLICY "Users can upload media to their posts" ON public.post_media
    FOR INSERT WITH CHECK (
        post_id IN (SELECT id FROM public.community_posts WHERE user_id = public.get_current_user_id())
    );

-- 1. verification_requests
CREATE TABLE IF NOT EXISTS public.verification_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. post_likes
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 3. connections
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(requester_id, recipient_id)
);

-- 4. conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    context_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    kind TEXT DEFAULT 'text' CHECK (kind IN ('text', 'offer', 'counter_offer', 'acceptance', 'system')),
    offer_data JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own verification requests" ON public.verification_requests
    FOR SELECT USING (user_id = public.get_current_user_id() OR public.is_admin());
CREATE POLICY "Users can create verification requests" ON public.verification_requests
    FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
CREATE POLICY "Admins can update verification requests" ON public.verification_requests
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Public read post likes" ON public.post_likes FOR SELECT USING (TRUE);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (user_id = public.get_current_user_id());
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (user_id = public.get_current_user_id());

CREATE POLICY "Participants can view connections" ON public.connections
    FOR SELECT USING (requester_id = public.get_current_user_id() OR recipient_id = public.get_current_user_id() OR status = 'accepted');
CREATE POLICY "Users can request connection" ON public.connections
    FOR INSERT WITH CHECK (requester_id = public.get_current_user_id());
CREATE POLICY "Recipients can update connection status" ON public.connections
    FOR UPDATE USING (recipient_id = public.get_current_user_id() OR requester_id = public.get_current_user_id());

CREATE POLICY "Participants can view conversations" ON public.conversations
    FOR SELECT USING (participant1_id = public.get_current_user_id() OR participant2_id = public.get_current_user_id());
CREATE POLICY "Users can start conversations" ON public.conversations
    FOR INSERT WITH CHECK (participant1_id = public.get_current_user_id() OR participant2_id = public.get_current_user_id());
CREATE POLICY "Participants can update conversations" ON public.conversations
    FOR UPDATE USING (participant1_id = public.get_current_user_id() OR participant2_id = public.get_current_user_id());

CREATE POLICY "Participants can view messages" ON public.messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE participant1_id = public.get_current_user_id() OR participant2_id = public.get_current_user_id()
        )
    );
CREATE POLICY "Participants can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = public.get_current_user_id() AND
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE participant1_id = public.get_current_user_id() OR participant2_id = public.get_current_user_id()
        )
    );
CREATE POLICY "Recipients can mark as read" ON public.messages
    FOR UPDATE USING (
        sender_id != public.get_current_user_id() AND
        conversation_id IN (
            SELECT id FROM public.conversations 
            WHERE participant1_id = public.get_current_user_id() OR participant2_id = public.get_current_user_id()
        )
    );
