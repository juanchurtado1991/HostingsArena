-- Add slug column to hosting and vpn providers
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE vpn_providers ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hosting_slug ON hosting_providers(slug);
CREATE INDEX IF NOT EXISTS idx_vpn_slug ON vpn_providers(slug);

-- Reload schema
NOTIFY pgrst, 'reload schema';
