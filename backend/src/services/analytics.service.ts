/**
 * Analytics Service - Privacy-Focused Website Analytics
 *
 * No cookies, no tracking, GDPR compliant
 * Tracks: views, visitors, devices, referrers, geographic data
 */

import { createClient } from '@supabase/supabase-js';
import { UAParser } from 'ua-parser-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for analytics
);

interface AnalyticsEvent {
  website_id: string;
  page_url: string;
  referrer?: string;
  screen_width?: number;
  screen_height?: number;
  user_agent?: string;
  language?: string;
  visitor_ip?: string;
  timestamp?: string;
}

interface AnalyticsStats {
  period: string;
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{ page_url: string; views: number }>;
  devices: Array<{ device_type: string; count: number; percentage: number }>;
  referrers: Array<{ referrer: string; count: number }>;
  countries: Array<{ country: string; count: number }>;
  timeline: Array<{ date: string; views: number; visitors: number }>;
}

/**
 * Track page view
 */
export async function trackPageView(event: AnalyticsEvent): Promise<void> {
  try {
    // Parse user agent for device info
    const parser = new UAParser(event.user_agent);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Determine device type
    let deviceType = 'desktop';
    if (device.type === 'mobile') deviceType = 'mobile';
    else if (device.type === 'tablet') deviceType = 'tablet';

    // Get geographic data from IP (simplified - use GeoIP in production)
    const { country, city } = await getGeoData(event.visitor_ip || '');

    // Insert analytics event
    await supabase.from('website_analytics').insert({
      website_id: event.website_id,
      page_url: event.page_url,
      referrer: event.referrer || 'direct',
      user_agent: event.user_agent,
      visitor_ip: hashIP(event.visitor_ip || ''), // Hash IP for privacy
      visitor_country: country,
      visitor_city: city,
      device_type: deviceType,
      browser: browser.name,
      os: os.name,
      visited_at: event.timestamp || new Date().toISOString()
    });

    console.log(`📊 Analytics tracked for ${event.website_id}: ${event.page_url}`);
  } catch (error) {
    console.error('Failed to track analytics:', error);
    // Don't throw - analytics should never break the site
  }
}

/**
 * Track session duration
 */
export async function trackSessionDuration(
  websiteId: string,
  duration: number
): Promise<void> {
  try {
    // Update the most recent analytics entry for this session
    // In production, use session ID to track accurately

    const { data: latestEntry } = await supabase
      .from('website_analytics')
      .select('id')
      .eq('website_id', websiteId)
      .order('visited_at', { ascending: false })
      .limit(1)
      .single();

    if (latestEntry) {
      await supabase
        .from('website_analytics')
        .update({ session_duration: duration })
        .eq('id', latestEntry.id);
    }
  } catch (error) {
    console.error('Failed to track session duration:', error);
  }
}

/**
 * Get analytics stats for a website
 */
export async function getWebsiteAnalytics(
  websiteId: string,
  period: string = '30d',
  userId: string
): Promise<AnalyticsStats> {
  // Verify ownership
  const { data: website } = await supabase
    .from('websites')
    .select('id, user_id')
    .eq('id', websiteId)
    .single();

  if (!website || website.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  // Calculate date range
  const days = parseInt(period.replace('d', ''));
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Total views
  const { count: totalViews } = await supabase
    .from('website_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('website_id', websiteId)
    .gte('visited_at', startDate.toISOString());

  // Unique visitors
  const { data: visitors } = await supabase
    .from('website_analytics')
    .select('visitor_ip')
    .eq('website_id', websiteId)
    .gte('visited_at', startDate.toISOString());

  const uniqueVisitors = new Set(visitors?.map(v => v.visitor_ip)).size;

  // Average session duration
  const { data: durations } = await supabase
    .from('website_analytics')
    .select('session_duration')
    .eq('website_id', websiteId)
    .gte('visited_at', startDate.toISOString())
    .not('session_duration', 'is', null);

  const avgSessionDuration = durations && durations.length > 0
    ? Math.floor(
        durations.reduce((sum, d) => sum + (d.session_duration || 0), 0) /
        durations.length
      )
    : 0;

  // Top pages
  const { data: pagesData } = await supabase.rpc('get_top_pages', {
    p_website_id: websiteId,
    p_start_date: startDate.toISOString(),
    p_limit: 10
  });

  const topPages = pagesData || [];

  // Device breakdown
  const { data: devicesData } = await supabase
    .from('website_analytics')
    .select('device_type')
    .eq('website_id', websiteId)
    .gte('visited_at', startDate.toISOString());

  const deviceCounts: Record<string, number> = {};
  devicesData?.forEach(d => {
    deviceCounts[d.device_type] = (deviceCounts[d.device_type] || 0) + 1;
  });

  const totalDeviceViews = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
  const devices = Object.entries(deviceCounts).map(([device_type, count]) => ({
    device_type,
    count,
    percentage: Math.round((count / totalDeviceViews) * 100)
  }));

  // Top referrers
  const { data: referrersData } = await supabase.rpc('get_top_referrers', {
    p_website_id: websiteId,
    p_start_date: startDate.toISOString(),
    p_limit: 10
  });

  const referrers = referrersData || [];

  // Countries
  const { data: countriesData } = await supabase.rpc('get_top_countries', {
    p_website_id: websiteId,
    p_start_date: startDate.toISOString(),
    p_limit: 10
  });

  const countries = countriesData || [];

  // Timeline (daily views)
  const { data: timelineData } = await supabase.rpc('get_analytics_timeline', {
    p_website_id: websiteId,
    p_start_date: startDate.toISOString()
  });

  const timeline = timelineData || [];

  return {
    period,
    totalViews: totalViews || 0,
    uniqueVisitors,
    avgSessionDuration,
    topPages,
    devices,
    referrers,
    countries,
    timeline
  };
}

/**
 * Get geographic data from IP address
 * In production: Use GeoIP service like MaxMind, ipapi, etc.
 */
async function getGeoData(
  ip: string
): Promise<{ country: string; city: string }> {
  try {
    // For MVP: Skip GeoIP lookup
    // In production: Use ipapi.co or similar
    /*
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return {
      country: data.country_code,
      city: data.city
    };
    */

    return { country: 'XX', city: 'Unknown' };
  } catch (error) {
    return { country: 'XX', city: 'Unknown' };
  }
}

/**
 * Hash IP address for privacy
 * Store hashed IP instead of real IP for GDPR compliance
 */
function hashIP(ip: string): string {
  const crypto = require('crypto');
  const salt = process.env.IP_HASH_SALT || 'webchat-analytics-salt';
  return crypto
    .createHash('sha256')
    .update(ip + salt)
    .digest('hex')
    .substring(0, 16); // Shortened hash
}

/**
 * Calculate unique visitors (run daily via cron)
 */
export async function updateUniqueVisitorCounts(): Promise<void> {
  try {
    // Get all websites
    const { data: websites } = await supabase
      .from('websites')
      .select('id');

    if (!websites) return;

    // Update each website
    for (const website of websites) {
      const { data: visitors } = await supabase
        .from('website_analytics')
        .select('visitor_ip')
        .eq('website_id', website.id);

      const uniqueCount = new Set(visitors?.map(v => v.visitor_ip)).size;

      await supabase
        .from('websites')
        .update({ unique_visitors: uniqueCount })
        .eq('id', website.id);
    }

    console.log(`✅ Updated unique visitor counts for ${websites.length} websites`);
  } catch (error) {
    console.error('Failed to update unique visitor counts:', error);
  }
}

/**
 * Cleanup old analytics data (keep last 90 days)
 */
export async function cleanupOldAnalytics(): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const { count } = await supabase
      .from('website_analytics')
      .delete({ count: 'exact' })
      .lt('visited_at', cutoffDate.toISOString());

    console.log(`✅ Cleaned up ${count} old analytics records`);
    return count || 0;
  } catch (error) {
    console.error('Failed to cleanup old analytics:', error);
    return 0;
  }
}
