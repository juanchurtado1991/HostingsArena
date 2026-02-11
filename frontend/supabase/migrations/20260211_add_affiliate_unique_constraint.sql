-- Ensure provider_name is unique for upsert support
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_partners_provider_name_key'
    ) THEN
        ALTER TABLE affiliate_partners ADD CONSTRAINT affiliate_partners_provider_name_key UNIQUE (provider_name);
    END IF;
END $$;
