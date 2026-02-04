-- ==========================================
-- HOSTING ARENA - COMPLETE DATABASE SCHEMA
-- ==========================================
-- Includes: Scrapers Data, Blog System, User Profiles, Newsletter
-- Run this in Supabase SQL Editor

-- ==========================================
-- 1. USERS & PROFILES (Extends Auth)
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text default 'editor', -- 'admin' or 'editor'
  created_at timestamp with time zone default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'editor');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ==========================================
-- 2. SCRAPED DATA (VPNs & Hosting)
-- ==========================================
create table if not exists public.vpn_providers (
  id uuid default gen_random_uuid() primary key,
  provider_name text not null unique,
  website_url text,
  last_updated timestamp with time zone default now(),
  
  -- Metrics
  pricing_monthly numeric,
  pricing_yearly numeric,
  money_back_days integer,
  avg_speed_mbps numeric,
  server_count integer,
  
  -- Rich Data (JSONB for flexibility with new scraper fields)
  features jsonb, -- protocol list, streaming services
  raw_data jsonb
);

create table if not exists public.hosting_providers (
  id uuid default gen_random_uuid() primary key,
  provider_name text not null,
  plan_name text not null,
  provider_type text, -- Shared, VPS, Dedicated
  website_url text,
  last_updated timestamp with time zone default now(),
  
  -- Metrics
  pricing_monthly numeric,
  renewal_price numeric,
  storage_gb numeric,
  bandwidth text,
  
  -- Scores
  performance_grade text, -- 'A+', 'A', 'B'
  support_score numeric,
  
  -- Rich Data
  features jsonb, -- ssl, domain, email
  raw_data jsonb,
  
  unique(provider_name, plan_name)
);

-- ==========================================
-- 3. BLOG & REVIEWS (CMS System)
-- ==========================================
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  slug text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text not null unique,
  content text, -- Markdown or HTML
  excerpt text,
  cover_image_url text,
  
  -- Metadata
  author_id uuid references public.profiles(id),
  category_id uuid references public.categories(id),
  
  -- Status & Editorial Workflow
  status text default 'draft', -- 'published', 'draft', 'archived', 'needs_review'
  published_at timestamp with time zone,
  last_human_review_at timestamp with time zone,
  needs_update boolean default false,
  
  -- Strategy
  tier text default '3', -- '1' (Head-to-head), '2' (Long-tail), '3' (Info)
  
  -- AI Generation Data
  is_ai_generated boolean default false,
  ai_quality_score integer, -- 0-100 score
  ai_feedback jsonb, -- e.g. ["Missing internal links", "Low keyword density"]
  
  -- SEO
  seo_title text,
  seo_description text,
  target_keywords text[], -- Keywords the post targets
  
  -- Relation to Providers (For Reviews)
  related_provider_name text, -- e.g. "NordVPN" to link comparison data
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ==========================================
-- 4. MARKETING (Newsletter)
-- ==========================================
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  source text default 'website_footer',
  is_active boolean default true,
  subscribed_at timestamp with time zone default now()
);


-- ==========================================
-- 5. SECURITY (Row Level Security)
-- ==========================================
alter table public.profiles enable row level security;
alter table public.vpn_providers enable row level security;
alter table public.hosting_providers enable row level security;
alter table public.posts enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- READ POLICIES (Public can read content)
create policy "Public can read vpn data" on public.vpn_providers for select using (true);
create policy "Public can read hosting data" on public.hosting_providers for select using (true);
create policy "Public can read published posts" on public.posts for select using (status = 'published');
create policy "Public can read categories" on public.categories for select using (true);

-- WRITE POLICIES (Only Admins/Service Role can write)
-- Note: Service Role (GitHub Actions) bypasses RLS automatically.
-- Below is for Dashboard users.

create policy "Admins can do everything" on public.posts 
  for all using (
    auth.uid() in (select id from public.profiles where role = 'admin')
  );

create policy "Users can read own profile" on public.profiles 
  for select using (auth.uid() = id);

-- Newsletter: Public can insert (Subscribe), Admins can view
create policy "Public can subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "Admins can view subscribers" on public.newsletter_subscribers for select using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- ==========================================
-- 6. ADMIN DASHBOARD (Tasks & Analytics)
-- ==========================================
create table if not exists public.admin_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  priority text default 'medium', -- 'high', 'medium', 'low'
  status text default 'pending', -- 'pending', 'in_progress', 'done'
  type text default 'general', -- 'review_post', 'approve_sponsor', 'tech_check'
  
  assigned_to uuid references public.profiles(id),
  due_date timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

create table if not exists public.daily_analytics (
  id uuid default gen_random_uuid() primary key,
  date date not null unique default CURRENT_DATE,
  
  -- Traffic
  visitors_count integer default 0,
  pageviews_count integer default 0,
  
  -- Business
  affiliate_clicks integer default 0,
  conversions_count integer default 0,
  revenue_usd numeric(10, 2) default 0.00,
  
  -- Growth
  new_subscribers_count integer default 0,
  
  created_at timestamp with time zone default now()
);

-- RLS for Dashboard
alter table public.admin_tasks enable row level security;
alter table public.daily_analytics enable row level security;

-- Only Admins can access these
create policy "Admins manage tasks" on public.admin_tasks for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

create policy "Admins manage analytics" on public.daily_analytics for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

-- ==========================================
-- 7. OPERATIONS & SYSTEM (Final Additions)
-- ==========================================

-- A. System Flags (Crisis Protocol)
create table if not exists public.system_settings (
  key text primary key, -- e.g. 'maintenance_mode', 'scraper_alert'
  value jsonb, -- { "enabled": true, "message": "Updating data..." }
  updated_at timestamp with time zone default now()
);

-- B. Affiliate Management (Centralized Links)
create table if not exists public.affiliate_partners (
  id uuid default gen_random_uuid() primary key,
  provider_name text not null, -- Links to provider tables
  network text, -- 'CJ', 'Impact', 'ShareASale', 'Direct'
  affiliate_link text not null,
  commission_rate text, -- e.g. "$50 CPA" or "20% RevShare"
  cookie_days integer,
  status text default 'active', -- 'active', 'pending', 'rejected'
  last_verified_at timestamp with time zone
);

-- C. Outreach CRM (For Backlinks)
create table if not exists public.outreach_campaigns (
  id uuid default gen_random_uuid() primary key,
  target_site text not null,
  contact_email text,
  status text default 'prospect', -- 'prospect', 'contacted', 'negotiating', 'won', 'lost'
  strategy text, -- 'broken_link', 'guest_post', 'partnership'
  notes text,
  last_contacted_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.system_settings enable row level security;
alter table public.affiliate_partners enable row level security;
alter table public.outreach_campaigns enable row level security;

-- Policies (Public read settings, Admins write all)
create policy "Public read settings" on public.system_settings for select using (true);
create policy "Admins write settings" on public.system_settings for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

create policy "Admins manage affiliates" on public.affiliate_partners for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);

create policy "Admins manage outreach" on public.outreach_campaigns for all using (
  auth.uid() in (select id from public.profiles where role = 'admin')
);
