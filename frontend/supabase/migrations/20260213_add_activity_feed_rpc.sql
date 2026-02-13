-- Function to get a unified feed of user activity (Page Views + Affiliate Clicks)
CREATE OR REPLACE FUNCTION public.get_recent_activity(limit_count int DEFAULT 50)
RETURNS TABLE (
  type text, -- 'view' or 'click'
  ip_address text,
  country text,
  detail text, -- path for views, target_url for clicks
  source text, -- referrer for views, page_path for clicks
  created_at timestamptz,
  device_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 
      'view'::text as type,
      pv.ip_address,
      pv.country,
      pv.path as detail,
      pv.referrer as source,
      pv.created_at,
      pv.device_type
    FROM public.page_views pv
    ORDER BY pv.created_at DESC
    LIMIT limit_count
  )
  UNION ALL
  (
    SELECT
      'click'::text as type,
      ac.ip_address,
      ac.country,
      ac.target_url as detail,
      ac.page_path as source,
      ac.created_at,
      ac.device_type
    FROM public.affiliate_clicks ac
    ORDER BY ac.created_at DESC
    LIMIT limit_count
  )
  ORDER BY created_at DESC
  LIMIT limit_count;
END;
$$;
