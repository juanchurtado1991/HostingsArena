-- 1. Add columns to page_views for deeper analysis
ALTER TABLE IF EXISTS public.page_views
ADD COLUMN IF NOT EXISTS device_type text, -- 'mobile', 'desktop', 'tablet', 'bot'
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text;

-- 2. Create affiliate_clicks table for CTR and revenue tracking
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid default gen_random_uuid() primary key,
  provider_name text not null, -- e.g. "Bluehost"
  target_url text, -- The actual affiliate link clicked
  page_path text, -- Where the click happened (e.g. "/hosting/bluehost")
  position text, -- e.g. "sticky_bar", "hero", "comparison_table"
  
  -- User Context
  ip_address text,
  country text,
  user_agent text,
  device_type text,
  
  -- Session Context
  session_id text, -- Optional: to link with page_views if we add sessions later
  
  created_at timestamp with time zone default now()
);

-- 3. RLS Policies
ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Admins can read all clicks
CREATE POLICY "Admins read clicks" ON public.affiliate_clicks
  FOR SELECT USING (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Public (Anonymous) can insert clicks (via API)
CREATE POLICY "Public insert clicks" ON public.affiliate_clicks
  FOR INSERT WITH CHECK (true);
