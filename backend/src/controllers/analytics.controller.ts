import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

/**
 * Track page view (called from analytics.js on user websites)
 */
export async function trackPageView(req: Request, res: Response) {
  try {
    const event = {
      website_id: req.body.website_id,
      page_url: req.body.page_url,
      referrer: req.body.referrer,
      screen_width: req.body.screen_width,
      screen_height: req.body.screen_height,
      user_agent: req.body.user_agent || req.headers['user-agent'],
      language: req.body.language,
      visitor_ip: req.ip || req.connection.remoteAddress,
      timestamp: req.body.timestamp
    };

    await analyticsService.trackPageView(event);

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Analytics tracking error:', error);
    res.status(200).json({ success: true }); // Always return 200 to not break user sites
  }
}

/**
 * Track session duration (called on page unload)
 */
export async function trackDuration(req: Request, res: Response) {
  try {
    const { website_id, duration } = req.body;

    await analyticsService.trackSessionDuration(website_id, duration);

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Duration tracking error:', error);
    res.status(200).json({ success: true }); // Always return 200
  }
}

/**
 * Get analytics for a website (authenticated)
 */
export async function getAnalytics(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query;
    const userId = req.userId!;

    const stats = await analyticsService.getWebsiteAnalytics(
      id,
      period as string,
      userId
    );

    res.json(stats);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
}
