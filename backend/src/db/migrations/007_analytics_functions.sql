-- ═══════════════════════════════════════════════════════════
-- ANALYTICS HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════
-- SQL functions for aggregating analytics data
-- ═══════════════════════════════════════════════════════════

-- Function: Get top pages
CREATE OR REPLACE FUNCTION get_top_pages(
  p_website_id UUID,
  p_start_date TIMESTAMP,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  page_url TEXT,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wa.page_url,
    COUNT(*)::BIGINT as views
  FROM website_analytics wa
  WHERE wa.website_id = p_website_id
    AND wa.visited_at >= p_start_date
  GROUP BY wa.page_url
  ORDER BY views DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top referrers
CREATE OR REPLACE FUNCTION get_top_referrers(
  p_website_id UUID,
  p_start_date TIMESTAMP,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  referrer TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wa.referrer,
    COUNT(*)::BIGINT as count
  FROM website_analytics wa
  WHERE wa.website_id = p_website_id
    AND wa.visited_at >= p_start_date
    AND wa.referrer IS NOT NULL
    AND wa.referrer != ''
    AND wa.referrer != 'direct'
  GROUP BY wa.referrer
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get top countries
CREATE OR REPLACE FUNCTION get_top_countries(
  p_website_id UUID,
  p_start_date TIMESTAMP,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  country VARCHAR(2),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wa.visitor_country,
    COUNT(*)::BIGINT as count
  FROM website_analytics wa
  WHERE wa.website_id = p_website_id
    AND wa.visited_at >= p_start_date
    AND wa.visitor_country IS NOT NULL
    AND wa.visitor_country != 'XX'
  GROUP BY wa.visitor_country
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get analytics timeline
CREATE OR REPLACE FUNCTION get_analytics_timeline(
  p_website_id UUID,
  p_start_date TIMESTAMP
)
RETURNS TABLE (
  date DATE,
  views BIGINT,
  visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(wa.visited_at) as date,
    COUNT(*)::BIGINT as views,
    COUNT(DISTINCT wa.visitor_ip)::BIGINT as visitors
  FROM website_analytics wa
  WHERE wa.website_id = p_website_id
    AND wa.visited_at >= p_start_date
  GROUP BY DATE(wa.visited_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get realtime stats (last 24 hours)
CREATE OR REPLACE FUNCTION get_realtime_stats(
  p_website_id UUID
)
RETURNS TABLE (
  total_views BIGINT,
  unique_visitors BIGINT,
  online_now BIGINT,
  top_page TEXT,
  top_referrer TEXT
) AS $$
DECLARE
  v_top_page TEXT;
  v_top_referrer TEXT;
BEGIN
  -- Get top page
  SELECT page_url INTO v_top_page
  FROM website_analytics
  WHERE website_id = p_website_id
    AND visited_at >= NOW() - INTERVAL '24 hours'
  GROUP BY page_url
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  -- Get top referrer
  SELECT referrer INTO v_top_referrer
  FROM website_analytics
  WHERE website_id = p_website_id
    AND visited_at >= NOW() - INTERVAL '24 hours'
    AND referrer != 'direct'
  GROUP BY referrer
  ORDER BY COUNT(*) DESC
  LIMIT 1;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT visitor_ip)::BIGINT as unique_visitors,
    COUNT(CASE WHEN visited_at >= NOW() - INTERVAL '5 minutes' THEN 1 END)::BIGINT as online_now,
    COALESCE(v_top_page, 'No data') as top_page,
    COALESCE(v_top_referrer, 'direct') as top_referrer
  FROM website_analytics
  WHERE website_id = p_website_id
    AND visited_at >= NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get device breakdown
CREATE OR REPLACE FUNCTION get_device_breakdown(
  p_website_id UUID,
  p_start_date TIMESTAMP
)
RETURNS TABLE (
  device_type VARCHAR(20),
  count BIGINT,
  percentage NUMERIC(5,2)
) AS $$
DECLARE
  total_count BIGINT;
BEGIN
  -- Get total count
  SELECT COUNT(*) INTO total_count
  FROM website_analytics
  WHERE website_id = p_website_id
    AND visited_at >= p_start_date;

  -- Return breakdown
  RETURN QUERY
  SELECT
    wa.device_type,
    COUNT(*)::BIGINT as count,
    ROUND((COUNT(*)::NUMERIC / NULLIF(total_count, 0)) * 100, 2) as percentage
  FROM website_analytics wa
  WHERE wa.website_id = p_website_id
    AND wa.visited_at >= p_start_date
  GROUP BY wa.device_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get browser breakdown
CREATE OR REPLACE FUNCTION get_browser_breakdown(
  p_website_id UUID,
  p_start_date TIMESTAMP,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  browser VARCHAR(50),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    wa.browser,
    COUNT(*)::BIGINT as count
  FROM website_analytics wa
  WHERE wa.website_id = p_website_id
    AND wa.visited_at >= p_start_date
    AND wa.browser IS NOT NULL
  GROUP BY wa.browser
  ORDER BY count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ ANALYTICS FUNCTIONS CREATED!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Functions available:';
  RAISE NOTICE '  • get_top_pages(website_id, start_date, limit)';
  RAISE NOTICE '  • get_top_referrers(website_id, start_date, limit)';
  RAISE NOTICE '  • get_top_countries(website_id, start_date, limit)';
  RAISE NOTICE '  • get_analytics_timeline(website_id, start_date)';
  RAISE NOTICE '  • get_realtime_stats(website_id)';
  RAISE NOTICE '  • get_device_breakdown(website_id, start_date)';
  RAISE NOTICE '  • get_browser_breakdown(website_id, start_date, limit)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for analytics dashboard!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
