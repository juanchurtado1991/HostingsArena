-- Add dashboard_url and account_phone columns to affiliate_partners table

ALTER TABLE affiliate_partners
ADD COLUMN IF NOT EXISTS dashboard_url TEXT,
ADD COLUMN IF NOT EXISTS account_phone TEXT;
