-- Enable RLS and add policies for scraper_status and providers
-- Fixes "Empty Dashboard" issue in Production

-- 1. Scraper Status (Dashboard only)
ALTER TABLE scraper_status ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admins) to view status
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON scraper_status;
CREATE POLICY "Enable read access for authenticated users" ON scraper_status
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow service_role to do everything (Scrapers use service_role, so they bypass RLS, but just in case)
-- (Service role bypasses RLS by default, so explicit policy not strictly needed but good for clarity if using client)

-- 2. Hosting Providers (Public + Dashboard)
ALTER TABLE hosting_providers ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON hosting_providers;
CREATE POLICY "Enable read access for all users" ON hosting_providers
    FOR SELECT
    TO public
    USING (true);

-- 3. VPN Providers (Public + Dashboard)
ALTER TABLE vpn_providers ENABLE ROW LEVEL SECURITY;

-- Public read access
DROP POLICY IF EXISTS "Enable read access for all users" ON vpn_providers;
CREATE POLICY "Enable read access for all users" ON vpn_providers
    FOR SELECT
    TO public
    USING (true);

-- Reload schema
NOTIFY pgrst, 'reload schema';
