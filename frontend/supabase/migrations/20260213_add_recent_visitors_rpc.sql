-- Function to get recent visitors for the real-time feed
CREATE OR REPLACE FUNCTION public.get_recent_visitors(limit_count int DEFAULT 50)
RETURNS TABLE (
  ip_address text,
  country text,
  path text,
  referrer text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.ip_address,
    pv.country,
    pv.path,
    pv.referrer,
    pv.created_at
  FROM public.page_views pv
  ORDER BY pv.created_at DESC
  LIMIT limit_count;
END;
$$;
