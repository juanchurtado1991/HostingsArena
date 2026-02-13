-- Add ip_address column to page_views table for better analytics
ALTER TABLE IF EXISTS public.page_views 
ADD COLUMN IF NOT EXISTS ip_address text;

-- Add comment
COMMENT ON COLUMN public.page_views.ip_address IS 'Visitor IP address for geo-location and unique visitor tracking';
