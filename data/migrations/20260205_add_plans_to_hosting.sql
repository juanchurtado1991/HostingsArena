-- Migration: Add 'plans' and 'hidden_fees' columns to hosting_providers
-- Date: 2026-02-05
-- Purpose: Store detailed plan arrays and hidden fees structure for deep comparisons

ALTER TABLE public.hosting_providers 
ADD COLUMN IF NOT EXISTS plans jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.hosting_providers 
ADD COLUMN IF NOT EXISTS hidden_fees jsonb DEFAULT '{}'::jsonb;

-- Comment on columns for clarity
COMMENT ON COLUMN public.hosting_providers.plans IS 'Array of HostingPlan objects (name, price, limits)';
COMMENT ON COLUMN public.hosting_providers.hidden_fees IS 'Structure containing setup fees, renewal spikes, and upsells';

-- Verify RLS is still enabled (safe check)
ALTER TABLE public.hosting_providers ENABLE ROW LEVEL SECURITY;
