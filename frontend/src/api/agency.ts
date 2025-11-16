/**
 * AGENCY PLATFORM API CLIENT
 * API functions for Agency, Clients, and Projects
 */

import { apiClient } from './client';

// ============================================
// TYPES
// ============================================

export interface Agency {
  id: string;
  created_at: string;
  updated_at: string;
  owner_user_id: string;
  name: string;
  slug: string | null;
  branding_config: {
    logo_url?: string | null;
    primary_color?: string;
    secondary_color?: string;
    company_name?: string | null;
  };
  stripe_connect_id: string | null;
  stripe_connect_status: string;
  settings: {
    allow_client_login?: boolean;
    max_projects_per_client?: number;
    default_subdomain_suffix?: string;
  };
  total_clients: number;
  total_projects: number;
  monthly_revenue: number;
}

export interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  agency_id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  client_user_id: string | null;
  company_name: string | null;
  industry: string | null;
  website_url: string | null;
  notes: string | null;
  status: 'active' | 'inactive' | 'archived';
  total_projects: number;
  total_spent: number;
}

export interface AgencyProject {
  id: string;
  created_at: string;
  updated_at: string;
  agency_id: string;
  client_id: string;
  website_id: string | null;
  project_name: string;
  project_description: string | null;
  status: 'draft' | 'generating' | 'live' | 'archived' | 'paused';
  is_billed: boolean;
  billed_amount: number | null;
  billed_at: string | null;
  client_can_edit: boolean;
  client_last_viewed_at: string | null;
  initial_prompt: string | null;
  custom_fields: Record<string, any>;
}

export interface AgencyStats {
  total_clients: number;
  total_projects: number;
  active_projects: number;
  total_websites: number;
  projects_this_month: number;
  monthly_revenue?: number;
}

export interface AgencyDashboard {
  agency: Agency;
  stats: AgencyStats;
  recent_clients: Client[];
  recent_projects: AgencyProject[];
}

// ============================================
// AGENCY API
// ============================================

export const agencyApi = {
  // ============================================
  // AGENCY ENDPOINTS
  // ============================================

  /**
   * Get current user's agency
   */
  getMyAgency: async (): Promise<Agency> => {
    const response = await apiClient.get('/api/v1/agency');
    return response.data;
  },

  /**
   * Update current user's agency
   */
  updateAgency: async (data: Partial<Agency>): Promise<Agency> => {
    const response = await apiClient.put('/api/v1/agency', data);
    return response.data;
  },

  /**
   * Get agency dashboard data
   */
  getDashboard: async (): Promise<AgencyDashboard> => {
    const response = await apiClient.get('/api/v1/agency/dashboard');
    return response.data;
  },

  // ============================================
  // CLIENT ENDPOINTS
  // ============================================

  /**
   * Get all clients
   */
  getClients: async (params?: {
    status?: 'active' | 'inactive' | 'archived';
    search?: string;
  }): Promise<Client[]> => {
    const response = await apiClient.get('/api/v1/agency/clients', { params });
    return response.data;
  },

  /**
   * Get a specific client
   */
  getClient: async (clientId: string): Promise<Client> => {
    const response = await apiClient.get(`/api/v1/agency/clients/${clientId}`);
    return response.data;
  },

  /**
   * Create a new client
   */
  createClient: async (data: {
    name: string;
    contact_email?: string;
    contact_phone?: string;
    company_name?: string;
    industry?: string;
    website_url?: string;
    notes?: string;
  }): Promise<Client> => {
    const response = await apiClient.post('/api/v1/agency/clients', data);
    return response.data;
  },

  /**
   * Update a client
   */
  updateClient: async (
    clientId: string,
    data: Partial<Client>
  ): Promise<Client> => {
    const response = await apiClient.put(`/api/v1/agency/clients/${clientId}`, data);
    return response.data;
  },

  /**
   * Delete a client
   */
  deleteClient: async (clientId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/agency/clients/${clientId}`);
  },

  /**
   * Get all projects for a client
   */
  getClientProjects: async (clientId: string): Promise<AgencyProject[]> => {
    const response = await apiClient.get(`/api/v1/agency/clients/${clientId}/projects`);
    return response.data;
  },

  /**
   * Get client portal data (white-labeled)
   */
  getClientPortal: async (clientId: string) => {
    const response = await apiClient.get(`/api/v1/agency/clients/${clientId}/portal`);
    return response.data;
  },

  // ============================================
  // PROJECT ENDPOINTS
  // ============================================

  /**
   * Get all projects
   */
  getProjects: async (params?: {
    status?: string;
    limit?: number;
  }): Promise<AgencyProject[]> => {
    const response = await apiClient.get('/api/v1/agency/projects', { params });
    return response.data;
  },

  /**
   * Get a specific project
   */
  getProject: async (projectId: string): Promise<AgencyProject> => {
    const response = await apiClient.get(`/api/v1/agency/projects/${projectId}`);
    return response.data;
  },

  /**
   * Create a new project
   */
  createProject: async (data: {
    client_id: string;
    project_name: string;
    initial_prompt: string;
    project_description?: string;
    client_can_edit?: boolean;
  }): Promise<AgencyProject> => {
    const response = await apiClient.post('/api/v1/agency/projects', data);
    return response.data;
  },

  /**
   * Update a project
   */
  updateProject: async (
    projectId: string,
    data: Partial<AgencyProject>
  ): Promise<AgencyProject> => {
    const response = await apiClient.put(`/api/v1/agency/projects/${projectId}`, data);
    return response.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/agency/projects/${projectId}`);
  },

  /**
   * Generate website for a project (triggers AI generation)
   */
  generateProjectWebsite: async (projectId: string, prompt: string) => {
    const response = await apiClient.post(
      `/api/v1/agency/projects/${projectId}/generate`,
      { prompt }
    );
    return response.data;
  },

  /**
   * Link an existing website to a project
   */
  linkWebsiteToProject: async (projectId: string, websiteId: string): Promise<AgencyProject> => {
    const response = await apiClient.post(
      `/api/v1/agency/projects/${projectId}/link-website`,
      { website_id: websiteId }
    );
    return response.data;
  }
};
