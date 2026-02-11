-- Add free_ssl and other potentially missing columns to hosting_providers
-- Using IF NOT EXISTS to avoid errors if they already exist

ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS free_ssl BOOLEAN DEFAULT FALSE;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS money_back_days INTEGER DEFAULT 0;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS inodes INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS storage_type TEXT;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS cpu_cores INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS ram_mb INTEGER;
ALTER TABLE hosting_providers ADD COLUMN IF NOT EXISTS bandwidth TEXT;

-- Reload schema cache (functionality depends on permissions, but ALTER TABLE usually triggers it)
NOTIFY pgrst, 'reload schema';
