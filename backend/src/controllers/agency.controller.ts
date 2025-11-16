/**
 * AGENCY PLATFORM CONTROLLER
 * Business logic for Agency, Clients, and Projects management
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getAgencyById,
  getAgencyByOwnerId,
  updateAgency,
  getAgencyDashboardData,
  getClientsByAgencyId,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
  getProjectsByAgencyId,
  getProjectsByAgencyIdWithRelations,
  getProjectsByClientId,
  getAgencyProjectById,
  getAgencyProjectWithRelations,
  createAgencyProject,
  updateAgencyProject,
  deleteAgencyProject,
  linkWebsiteToProject,
  markProjectAsGenerating,
  markProjectAsLive,
  getClientPortalData
} from '../db/agency.helpers';
import { createWebsite } from '../db/helpers';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updateAgencySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  slug: z.string().min(2).max(100).optional(),
  branding_config: z.object({
    logo_url: z.string().url().optional().nullable(),
    primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    company_name: z.string().max(255).optional().nullable()
  }).optional(),
  settings: z.object({
    allow_client_login: z.boolean().optional(),
    max_projects_per_client: z.number().int().min(1).max(100).optional(),
    default_subdomain_suffix: z.string().max(50).optional()
  }).optional()
});

const createClientSchema = z.object({
  name: z.string().min(2).max(255),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(50).optional(),
  company_name: z.string().max(255).optional(),
  industry: z.string().max(100).optional(),
  website_url: z.string().url().optional(),
  notes: z.string().optional()
});

const updateClientSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(50).optional().nullable(),
  company_name: z.string().max(255).optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived']).optional()
});

const createProjectSchema = z.object({
  client_id: z.string().uuid(),
  project_name: z.string().min(2).max(255),
  project_description: z.string().optional(),
  initial_prompt: z.string().min(10),
  client_can_edit: z.boolean().optional()
});

const updateProjectSchema = z.object({
  project_name: z.string().min(2).max(255).optional(),
  project_description: z.string().optional().nullable(),
  status: z.enum(['draft', 'generating', 'live', 'archived', 'paused']).optional(),
  client_can_edit: z.boolean().optional(),
  is_billed: z.boolean().optional(),
  billed_amount: z.number().optional().nullable(),
  custom_fields: z.record(z.any()).optional()
});

// ============================================
// AGENCY CONTROLLERS
// ============================================

/**
 * GET /api/v1/agency
 * Get current user's agency info
 */
export async function getMyAgency(req: Request, res: Response) {
  try {
    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const agency = await getAgencyById(req.agencyId);

    if (!agency) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    res.json(agency);
  } catch (error) {
    console.error('Error getting agency:', error);
    res.status(500).json({ error: 'Failed to get agency' });
  }
}

/**
 * PUT /api/v1/agency
 * Update current user's agency
 */
export async function updateMyAgency(req: Request, res: Response) {
  try {
    const validation = updateAgencySchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const updatedAgency = await updateAgency(req.agencyId, validation.data);

    res.json(updatedAgency);
  } catch (error) {
    console.error('Error updating agency:', error);
    res.status(500).json({ error: 'Failed to update agency' });
  }
}

/**
 * GET /api/v1/agency/dashboard
 * Get agency dashboard data (stats + recent clients/projects)
 */
export async function getAgencyDashboard(req: Request, res: Response) {
  try {
    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const dashboardData = await getAgencyDashboardData(req.agencyId);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error getting agency dashboard:', error);
    res.status(500).json({ error: 'Failed to get agency dashboard' });
  }
}

// ============================================
// CLIENT CONTROLLERS
// ============================================

/**
 * GET /api/v1/agency/clients
 * Get all clients for current agency
 */
export async function getClients(req: Request, res: Response) {
  try {
    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const { status, search } = req.query;

    let clients;

    if (search) {
      clients = await searchClients(req.agencyId, search as string);
    } else {
      clients = await getClientsByAgencyId(
        req.agencyId,
        status as 'active' | 'inactive' | 'archived' | undefined
      );
    }

    res.json(clients);
  } catch (error) {
    console.error('Error getting clients:', error);
    res.status(500).json({ error: 'Failed to get clients' });
  }
}

/**
 * GET /api/v1/agency/clients/:clientId
 * Get specific client
 */
export async function getClient(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    const client = await getClientById(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Error getting client:', error);
    res.status(500).json({ error: 'Failed to get client' });
  }
}

/**
 * POST /api/v1/agency/clients
 * Create a new client
 */
export async function createNewClient(req: Request, res: Response) {
  try {
    const validation = createClientSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const newClient = await createClient({
      ...validation.data,
      agency_id: req.agencyId
    });

    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
}

/**
 * PUT /api/v1/agency/clients/:clientId
 * Update a client
 */
export async function updateExistingClient(req: Request, res: Response) {
  try {
    const validation = updateClientSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { clientId } = req.params;

    const updatedClient = await updateClient(clientId, validation.data);

    res.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
}

/**
 * DELETE /api/v1/agency/clients/:clientId
 * Delete a client (and all their projects)
 */
export async function deleteExistingClient(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    await deleteClient(clientId);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
}

/**
 * GET /api/v1/agency/clients/:clientId/projects
 * Get all projects for a specific client
 */
export async function getClientProjects(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    const projects = await getProjectsByClientId(clientId);

    res.json(projects);
  } catch (error) {
    console.error('Error getting client projects:', error);
    res.status(500).json({ error: 'Failed to get client projects' });
  }
}

/**
 * GET /api/v1/agency/clients/:clientId/portal
 * Get client portal data (for white-labeled view)
 */
export async function getClientPortal(req: Request, res: Response) {
  try {
    const { clientId } = req.params;

    const portalData = await getClientPortalData(clientId);

    res.json(portalData);
  } catch (error) {
    console.error('Error getting client portal:', error);
    res.status(500).json({ error: 'Failed to get client portal data' });
  }
}

// ============================================
// PROJECT CONTROLLERS
// ============================================

/**
 * GET /api/v1/agency/projects
 * Get all projects for current agency
 */
export async function getProjects(req: Request, res: Response) {
  try {
    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const { status, limit } = req.query;

    const projects = await getProjectsByAgencyIdWithRelations(
      req.agencyId,
      limit ? parseInt(limit as string) : undefined
    );

    res.json(projects);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
}

/**
 * GET /api/v1/agency/projects/:projectId
 * Get specific project with all relations
 */
export async function getProject(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    const project = await getAgencyProjectWithRelations(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error getting project:', error);
    res.status(500).json({ error: 'Failed to get project' });
  }
}

/**
 * POST /api/v1/agency/projects
 * Create a new project for a client
 */
export async function createNewProject(req: Request, res: Response) {
  try {
    const validation = createProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    if (!req.agencyId) {
      return res.status(404).json({ error: 'Agency not found' });
    }

    const newProject = await createAgencyProject({
      ...validation.data,
      agency_id: req.agencyId,
      status: 'draft'
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
}

/**
 * PUT /api/v1/agency/projects/:projectId
 * Update a project
 */
export async function updateExistingProject(req: Request, res: Response) {
  try {
    const validation = updateProjectSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors
      });
    }

    const { projectId } = req.params;

    const updatedProject = await updateAgencyProject(projectId, validation.data);

    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
}

/**
 * DELETE /api/v1/agency/projects/:projectId
 * Delete a project
 */
export async function deleteExistingProject(req: Request, res: Response) {
  try {
    const { projectId } = req.params;

    await deleteAgencyProject(projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
}

/**
 * POST /api/v1/agency/projects/:projectId/generate
 * Generate website for project (integrates with existing AI builder)
 * This is a placeholder - actual integration happens in chat routes
 */
export async function generateProjectWebsite(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Mark project as generating
    await markProjectAsGenerating(projectId);

    // Return immediately - actual generation happens via chat/websocket
    res.json({
      message: 'Website generation started',
      project_id: projectId,
      status: 'generating'
    });

    // Note: The actual AI generation will be handled by the chat controller
    // which will then link the generated website to this project via linkWebsiteToProject()
  } catch (error) {
    console.error('Error generating project website:', error);
    res.status(500).json({ error: 'Failed to start website generation' });
  }
}

/**
 * POST /api/v1/agency/projects/:projectId/link-website
 * Link an existing website to a project
 */
export async function linkWebsite(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const { website_id } = req.body;

    if (!website_id) {
      return res.status(400).json({ error: 'Website ID is required' });
    }

    const updatedProject = await linkWebsiteToProject(projectId, website_id);

    res.json(updatedProject);
  } catch (error) {
    console.error('Error linking website:', error);
    res.status(500).json({ error: 'Failed to link website' });
  }
}
