-- RPC to get affiliate click summary
CREATE OR REPLACE FUNCTION get_affiliate_click_summary(days_back int)
RETURNS TABLE (
  today_clicks bigint,
  week_clicks bigint,
  month_clicks bigint
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM affiliate_clicks WHERE created_at >= CURRENT_DATE),
    (SELECT count(*) FROM affiliate_clicks WHERE created_at >= (CURRENT_DATE - INTERVAL '7 days')),
    (SELECT count(*) FROM affiliate_clicks WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days'));
END;
$$;

-- RPC to get clicks per provider
CREATE OR REPLACE FUNCTION get_clicks_by_provider(days_back int)
RETURNS TABLE (
  provider_name text,
  click_count bigint
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.provider_name,
    count(*) as click_count
  FROM affiliate_clicks ac
  WHERE ac.created_at >= (CURRENT_DATE - (days_back || ' days')::interval)
  GROUP BY ac.provider_name
  ORDER BY click_count DESC
  LIMIT 10;
END;
$$;

-- RPC to get daily click traffic
CREATE OR REPLACE FUNCTION get_daily_clicks(days_back int)
RETURNS TABLE (
  date date,
  count bigint
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    created_at::date as date,
    count(*) as count
  FROM affiliate_clicks
  WHERE created_at >= (CURRENT_DATE - (days_back || ' days')::interval)
  GROUP BY date
  ORDER BY date ASC;
END;
$$;
