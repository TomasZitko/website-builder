/**
 * B2B2C API Routes
 * Portfolio, Clients, Subscriptions
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import * as portfolioService from '../services/portfolio-generator.service';
import * as clientService from '../services/client-management.service';

const router = express.Router();

// ============================================
// PORTFOLIO ROUTES
// ============================================

/**
 * POST /api/v1/b2b2c/portfolio/generate
 * Generate portfolio for developer account
 */
router.post('/portfolio/generate', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { count = 10 } = req.body;

    // Check if user is developer account
    const { data: user } = await require('../db/supabase').supabase
      .from('users')
      .select('account_type, portfolio_generated')
      .eq('id', userId)
      .single();

    if (!user || (user.account_type !== 'freelancer' && user.account_type !== 'agency')) {
      return res.status(403).json({
        success: false,
        error: 'Only freelancer and agency accounts can generate portfolios'
      });
    }

    if (user.portfolio_generated) {
      return res.status(400).json({
        success: false,
        error: 'Portfolio already generated. Use regenerate endpoint to create a new one.'
      });
    }

    const portfolio = await portfolioService.generateDeveloperPortfolio(userId, count);

    res.json({
      success: true,
      message: 'Portfolio generated successfully',
      data: {
        portfolio,
        count: portfolio.length
      }
    });
  } catch (error: any) {
    console.error('Portfolio generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/b2b2c/portfolio/regenerate
 * Regenerate entire portfolio
 */
router.post('/portfolio/regenerate', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const portfolio = await portfolioService.regeneratePortfolio(userId);

    res.json({
      success: true,
      message: 'Portfolio regenerated successfully',
      data: { portfolio }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/b2b2c/portfolio
 * Get developer's portfolio
 */
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const portfolio = await portfolioService.getPortfolioWebsites(userId);

    res.json({
      success: true,
      data: { portfolio }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/b2b2c/portfolio/featured
 * Get featured portfolio items
 */
router.get('/portfolio/featured', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const portfolio = await portfolioService.getFeaturedPortfolio(userId);

    res.json({
      success: true,
      data: { portfolio }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/v1/b2b2c/portfolio/:id/visibility
 * Update portfolio item visibility
 */
router.patch('/portfolio/:id/visibility', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_visible } = req.body;

    await portfolioService.updatePortfolioVisibility(id, is_visible);

    res.json({
      success: true,
      message: 'Portfolio visibility updated'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/b2b2c/portfolio/:id
 * Delete portfolio item
 */
router.delete('/portfolio/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await portfolioService.deletePortfolioWebsite(id);

    res.json({
      success: true,
      message: 'Portfolio item deleted'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CLIENT MANAGEMENT ROUTES
// ============================================

/**
 * POST /api/v1/b2b2c/clients
 * Create new client
 */
router.post('/clients', authenticateToken, async (req, res) => {
  try {
    const developerId = (req as any).user.id;
    const client = await clientService.createClient(developerId, req.body);

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: { client }
    });
  } catch (error: any) {
    res.status(error.message.includes('limit') ? 403 : 500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/b2b2c/clients
 * Get all clients for developer
 */
router.get('/clients', authenticateToken, async (req, res) => {
  try {
    const developerId = (req as any).user.id;
    const { status } = req.query;

    let clients;
    if (status) {
      clients = await clientService.getClientsByStatus(developerId, status as any);
    } else {
      clients = await clientService.getDeveloperClients(developerId);
    }

    res.json({
      success: true,
      data: { clients }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/b2b2c/clients/:id
 * Get client by ID
 */
router.get('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id);

    res.json({
      success: true,
      data: { client }
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: 'Client not found'
    });
  }
});

/**
 * PATCH /api/v1/b2b2c/clients/:id
 * Update client
 */
router.patch('/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: { client }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/b2b2c/clients/:id
 * Delete client
 */
router.delete('/clients/:id', authenticateToken, async (req, res) => {
  try {
    await clientService.deleteClient(req.params.id);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/b2b2c/clients/:id/invite
 * Send invitation to client
 */
router.post('/clients/:id/invite', authenticateToken, async (req, res) => {
  try {
    await clientService.inviteClient(req.params.id, req.body);

    res.json({
      success: true,
      message: 'Invitation sent successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/b2b2c/clients/accept-invitation
 * Accept client invitation (public route)
 */
router.post('/clients/accept-invitation', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;

    const client = await clientService.acceptClientInvitation(token, userId);

    res.json({
      success: true,
      message: 'Invitation accepted successfully',
      data: { client }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/b2b2c/clients/:id/websites
 * Get client's websites
 */
router.get('/clients/:id/websites', authenticateToken, async (req, res) => {
  try {
    const websites = await clientService.getClientWebsites(req.params.id);

    res.json({
      success: true,
      data: { websites }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/b2b2c/clients/:clientId/websites/:websiteId/link
 * Link website to client
 */
router.post('/clients/:clientId/websites/:websiteId/link', authenticateToken, async (req, res) => {
  try {
    const developerId = (req as any).user.id;
    const { clientId, websiteId } = req.params;

    const clientWebsite = await clientService.linkWebsiteToClient(
      clientId,
      websiteId,
      developerId,
      req.body
    );

    res.json({
      success: true,
      message: 'Website linked to client successfully',
      data: { clientWebsite }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/v1/b2b2c/client-websites/:id/status
 * Update client website status
 */
router.patch('/client-websites/:id/status', authenticateToken, async (req, res) => {
  try {
    const { project_status, payment_status } = req.body;

    const clientWebsite = await clientService.updateClientWebsiteStatus(
      req.params.id,
      project_status,
      payment_status
    );

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: { clientWebsite }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/b2b2c/clients/:id/revenue
 * Record revenue for client
 */
router.post('/clients/:id/revenue', authenticateToken, async (req, res) => {
  try {
    const { amount, description } = req.body;

    await clientService.recordClientRevenue(req.params.id, amount, description);

    res.json({
      success: true,
      message: 'Revenue recorded successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// DEVELOPER STATS ROUTES
// ============================================

/**
 * GET /api/v1/b2b2c/stats
 * Get developer statistics
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const developerId = (req as any).user.id;
    const stats = await clientService.getDeveloperStats(developerId);

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/b2b2c/analytics
 * Get comprehensive developer analytics
 */
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const developerId = (req as any).user.id;
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get developer stats
    const stats = await clientService.getDeveloperStats(developerId);

    // Get clients
    const { data: clients } = await require('../db/supabase').supabase
      .from('clients')
      .select('*')
      .eq('developer_id', developerId)
      .gte('created_at', startDate.toISOString());

    // Get all clients for status breakdown
    const { data: allClients } = await require('../db/supabase').supabase
      .from('clients')
      .select('status')
      .eq('developer_id', developerId);

    // Get websites
    const { data: websites } = await require('../db/supabase').supabase
      .from('client_websites')
      .select('*')
      .eq('developer_id', developerId)
      .gte('created_at', startDate.toISOString());

    // Build analytics response
    const analytics = {
      revenue: {
        total: stats.total_revenue || 0,
        thisMonth: stats.total_revenue || 0, // TODO: Calculate actual monthly
        lastMonth: 0, // TODO: Calculate from historical data
        monthlyTrend: [], // TODO: Generate from historical data
        growthRate: 0
      },
      clients: {
        total: stats.total_clients,
        active: stats.active_clients,
        inactive: allClients?.filter((c: any) => c.status === 'inactive').length || 0,
        pending: allClients?.filter((c: any) => c.status === 'pending').length || 0,
        thisMonth: clients?.length || 0,
        lastMonth: 0,
        growthRate: 0
      },
      websites: {
        total: stats.total_websites,
        thisMonth: stats.websites_this_month,
        lastMonth: 0,
        byStatus: [
          { status: 'Live', count: 0 },
          { status: 'In Progress', count: 0 },
          { status: 'Draft', count: 0 }
        ],
        byType: []
      },
      performance: {
        avgProjectValue: 0,
        avgCompletionTime: 0,
        clientRetentionRate: 0,
        monthlyRecurringRevenue: 0
      },
      recentActivity: []
    };

    res.json({
      success: true,
      data: { analytics }
    });
  } catch (error: any) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ACCOUNT TYPE ROUTES
// ============================================

/**
 * POST /api/v1/b2b2c/account/upgrade
 * Upgrade account type
 */
router.post('/account/upgrade', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { account_type, agency_name, agency_logo_url } = req.body;

    const { data, error } = await require('../db/supabase').supabase
      .from('users')
      .update({
        account_type,
        agency_name,
        agency_logo_url
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Account upgraded successfully',
      data: { user: data }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// SUBSCRIPTION PLANS ROUTES
// ============================================

/**
 * GET /api/v1/b2b2c/plans
 * Get all subscription plans (public)
 */
router.get('/plans', async (req, res) => {
  try {
    const { data, error } = await require('../db/supabase').supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: { plans: data }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
