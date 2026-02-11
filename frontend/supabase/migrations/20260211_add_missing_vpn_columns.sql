-- Add missing columns to vpn_providers for enriched data
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS pricing_yearly NUMERIC;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS pricing_2year NUMERIC;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS pricing_3year NUMERIC;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS protocols JSONB DEFAULT '[]';
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS jurisdiction TEXT;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS simultaneous_connections INTEGER;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS encryption_type TEXT;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS has_kill_switch BOOLEAN DEFAULT TRUE;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS server_count INTEGER;

-- Reload
NOTIFY pgrst, 'reload schema';
