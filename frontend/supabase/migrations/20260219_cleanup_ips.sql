-- Delete historical analytics data for the ignored IPs

DELETE FROM page_views 
WHERE ip_address IN ('190.150.105.226', '190.53.30.25');

DELETE FROM affiliate_clicks 
WHERE ip_address IN ('190.150.105.226', '190.53.30.25');
