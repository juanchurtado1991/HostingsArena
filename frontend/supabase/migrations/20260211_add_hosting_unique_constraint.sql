-- Add unique constraint for Hosting Providers to allow upsert on (provider_name, plan_name)
ALTER TABLE hosting_providers ADD CONSTRAINT hosting_providers_unique_plan UNIQUE (provider_name, plan_name);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
