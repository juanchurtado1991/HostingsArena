-- Migration: Add account credentials to affiliate_partners
ALTER TABLE affiliate_partners 
ADD COLUMN IF NOT EXISTS account_email text,
ADD COLUMN IF NOT EXISTS account_password text;
