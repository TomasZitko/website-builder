/**
 * AGENCY PLATFORM ROUTES
 * API routes for Agency, Clients, and Projects management
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  requireAgencyAccount,
  requireClientOwnership,
  requireProjectOwnership
} from '../middleware/agency.middleware';
import * as agencyController from '../controllers/agency.controller';

const router = Router();

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================

// Apply authentication middleware to all routes
router.use(authenticateToken);

// ============================================
// AGENCY ROUTES
// /api/v1/agency/*
// ============================================

/**
 * GET /api/v1/agency
 * Get current user's agency info
 */
router.get('/', requireAgencyAccount, agencyController.getMyAgency);

/**
 * PUT /api/v1/agency
 * Update current user's agency
 */
router.put('/', requireAgencyAccount, agencyController.updateMyAgency);

/**
 * GET /api/v1/agency/dashboard
 * Get agency dashboard data
 */
router.get('/dashboard', requireAgencyAccount, agencyController.getAgencyDashboard);

// ============================================
// CLIENT ROUTES
// /api/v1/agency/clients/*
// ============================================

/**
 * GET /api/v1/agency/clients
 * Get all clients for current agency
 * Query params: ?status=active&search=term
 */
router.get('/clients', requireAgencyAccount, agencyController.getClients);

/**
 * POST /api/v1/agency/clients
 * Create a new client
 */
router.post('/clients', requireAgencyAccount, agencyController.createNewClient);

/**
 * GET /api/v1/agency/clients/:clientId
 * Get specific client
 */
router.get(
  '/clients/:clientId',
  requireAgencyAccount,
  requireClientOwnership,
  agencyController.getClient
);

/**
 * PUT /api/v1/agency/clients/:clientId
 * Update a client
 */
router.put(
  '/clients/:clientId',
  requireAgencyAccount,
  requireClientOwnership,
  agencyController.updateExistingClient
);

/**
 * DELETE /api/v1/agency/clients/:clientId
 * Delete a client (and all their projects)
 */
router.delete(
  '/clients/:clientId',
  requireAgencyAccount,
  requireClientOwnership,
  agencyController.deleteExistingClient
);

/**
 * GET /api/v1/agency/clients/:clientId/projects
 * Get all projects for a specific client
 */
router.get(
  '/clients/:clientId/projects',
  requireAgencyAccount,
  requireClientOwnership,
  agencyController.getClientProjects
);

/**
 * GET /api/v1/agency/clients/:clientId/portal
 * Get client portal data (white-labeled view)
 */
router.get(
  '/clients/:clientId/portal',
  requireAgencyAccount,
  requireClientOwnership,
  agencyController.getClientPortal
);

// ============================================
// PROJECT ROUTES
// /api/v1/agency/projects/*
// ============================================

/**
 * GET /api/v1/agency/projects
 * Get all projects for current agency
 * Query params: ?status=live&limit=10
 */
router.get('/projects', requireAgencyAccount, agencyController.getProjects);

/**
 * POST /api/v1/agency/projects
 * Create a new project
 */
router.post('/projects', requireAgencyAccount, agencyController.createNewProject);

/**
 * GET /api/v1/agency/projects/:projectId
 * Get specific project with all relations
 */
router.get(
  '/projects/:projectId',
  requireAgencyAccount,
  requireProjectOwnership,
  agencyController.getProject
);

/**
 * PUT /api/v1/agency/projects/:projectId
 * Update a project
 */
router.put(
  '/projects/:projectId',
  requireAgencyAccount,
  requireProjectOwnership,
  agencyController.updateExistingProject
);

/**
 * DELETE /api/v1/agency/projects/:projectId
 * Delete a project
 */
router.delete(
  '/projects/:projectId',
  requireAgencyAccount,
  requireProjectOwnership,
  agencyController.deleteExistingProject
);

/**
 * POST /api/v1/agency/projects/:projectId/generate
 * Generate website for project (starts AI generation)
 */
router.post(
  '/projects/:projectId/generate',
  requireAgencyAccount,
  requireProjectOwnership,
  agencyController.generateProjectWebsite
);

/**
 * POST /api/v1/agency/projects/:projectId/link-website
 * Link an existing website to a project
 */
router.post(
  '/projects/:projectId/link-website',
  requireAgencyAccount,
  requireProjectOwnership,
  agencyController.linkWebsite
);

export default router;
