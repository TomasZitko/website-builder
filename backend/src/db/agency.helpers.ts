/**
 * AGENCY PLATFORM DATABASE HELPERS
 * Database query helpers for Agency, Clients, and AgencyProjects tables
 */

import { supabase } from './supabase';
import {
  Agency,
  AgencyInsert,
  AgencyUpdate,
  Client,
  ClientInsert,
  ClientUpdate,
  AgencyProject,
  AgencyProjectInsert,
  AgencyProjectUpdate,
  AgencyStatsResponse,
  AgencyProjectWithRelations,
  ClientWithAgency
} from '../types/agency.types';

// ============================================
// AGENCY QUERIES
// ============================================

/**
 * Get agency by ID
 */
export async function getAgencyById(id: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get agency by owner user ID
 */
export async function getAgencyByOwnerId(userId: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('owner_user_id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get agency by slug
 */
export async function getAgencyBySlug(slug: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create a new agency
 * Note: This usually happens automatically via the database trigger
 */
export async function createAgency(agencyData: AgencyInsert): Promise<Agency> {
  const { data, error } = await supabase
    .from('agencies')
    .insert([agencyData] as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update agency
 */
export async function updateAgency(id: string, updates: AgencyUpdate): Promise<Agency> {
  const { data, error } = await supabase
    .from('agencies')
    // @ts-expect-error - Supabase type inference issue with generic updates
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete agency (cascade deletes clients and projects)
 */
export async function deleteAgency(id: string): Promise<void> {
  const { error } = await supabase
    .from('agencies')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Get agency stats using the database function
 */
export async function getAgencyStats(agencyId: string): Promise<AgencyStatsResponse> {
  const { data, error } = await supabase
    .rpc('get_agency_stats', { agency_uuid: agencyId });

  if (error) throw error;
  return data as AgencyStatsResponse;
}

// ============================================
// CLIENT QUERIES
// ============================================

/**
 * Get client by ID
 */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get client with agency data
 */
export async function getClientWithAgency(id: string): Promise<ClientWithAgency | null> {
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      agency:agencies(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as any;
}

/**
 * Get all clients for an agency
 */
export async function getClientsByAgencyId(
  agencyId: string,
  status?: 'active' | 'inactive' | 'archived'
): Promise<Client[]> {
  let query = supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agencyId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a new client
 */
export async function createClient(clientData: ClientInsert): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData] as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update client
 */
export async function updateClient(id: string, updates: ClientUpdate): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    // @ts-expect-error - Supabase type inference issue with generic updates
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete client (cascade deletes projects)
 */
export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Search clients by name or email
 */
export async function searchClients(agencyId: string, searchTerm: string): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('agency_id', agencyId)
    .or(`name.ilike.%${searchTerm}%,contact_email.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

// ============================================
// AGENCY PROJECT QUERIES
// ============================================

/**
 * Get agency project by ID
 */
export async function getAgencyProjectById(id: string): Promise<AgencyProject | null> {
  const { data, error } = await supabase
    .from('agency_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get agency project with all relations
 */
export async function getAgencyProjectWithRelations(
  id: string
): Promise<AgencyProjectWithRelations | null> {
  const { data, error } = await supabase
    .from('agency_projects')
    .select(`
      *,
      agency:agencies(*),
      client:clients(*),
      website:websites(*)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as any;
}

/**
 * Get all projects for an agency
 */
export async function getProjectsByAgencyId(
  agencyId: string,
  status?: string
): Promise<AgencyProject[]> {
  let query = supabase
    .from('agency_projects')
    .select('*')
    .eq('agency_id', agencyId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get all projects for an agency with relations
 */
export async function getProjectsByAgencyIdWithRelations(
  agencyId: string,
  limit?: number
): Promise<AgencyProjectWithRelations[]> {
  let query = supabase
    .from('agency_projects')
    .select(`
      *,
      client:clients(id, name, company_name),
      website:websites(id, subdomain, name, is_published)
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as any;
}

/**
 * Get all projects for a specific client
 */
export async function getProjectsByClientId(clientId: string): Promise<AgencyProject[]> {
  const { data, error } = await supabase
    .from('agency_projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get projects for a client using the database function (with website data)
 */
export async function getClientProjects(clientId: string) {
  const { data, error } = await supabase
    .rpc('get_client_projects', { client_uuid: clientId });

  if (error) throw error;
  return data;
}

/**
 * Create a new agency project
 */
export async function createAgencyProject(
  projectData: AgencyProjectInsert
): Promise<AgencyProject> {
  const { data, error } = await supabase
    .from('agency_projects')
    .insert([projectData] as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update agency project
 */
export async function updateAgencyProject(
  id: string,
  updates: AgencyProjectUpdate
): Promise<AgencyProject> {
  const { data, error } = await supabase
    .from('agency_projects')
    // @ts-expect-error - Supabase type inference issue with generic updates
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete agency project
 */
export async function deleteAgencyProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('agency_projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Link a website to an agency project
 */
export async function linkWebsiteToProject(
  projectId: string,
  websiteId: string
): Promise<AgencyProject> {
  return updateAgencyProject(projectId, {
    website_id: websiteId,
    status: 'live'
  });
}

/**
 * Mark project as generating
 */
export async function markProjectAsGenerating(projectId: string): Promise<AgencyProject> {
  return updateAgencyProject(projectId, {
    status: 'generating'
  });
}

/**
 * Mark project as live
 */
export async function markProjectAsLive(
  projectId: string,
  websiteId: string
): Promise<AgencyProject> {
  return updateAgencyProject(projectId, {
    status: 'live',
    website_id: websiteId
  });
}

// ============================================
// COMBINED / ADVANCED QUERIES
// ============================================

/**
 * Get agency dashboard data (all-in-one query)
 */
export async function getAgencyDashboardData(agencyId: string) {
  const [agency, stats, clients, projects] = await Promise.all([
    getAgencyById(agencyId),
    getAgencyStats(agencyId),
    getClientsByAgencyId(agencyId, 'active'),
    getProjectsByAgencyIdWithRelations(agencyId, 10)
  ]);

  if (!agency) throw new Error('Agency not found');

  return {
    agency,
    stats,
    recent_clients: clients.slice(0, 5),
    recent_projects: projects
  };
}

/**
 * Get client portal data (for white-labeled client view)
 */
export async function getClientPortalData(clientId: string) {
  const client = await getClientWithAgency(clientId);
  if (!client || !client.agency) throw new Error('Client not found');

  const projects = await supabase
    .from('agency_projects')
    .select(`
      *,
      website:websites(*)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (projects.error) throw projects.error;

  return {
    client,
    agency: client.agency,
    projects: projects.data,
    branding: client.agency.branding_config || {}
  };
}

/**
 * Check if user owns an agency
 */
export async function userOwnsAgency(userId: string, agencyId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('agencies')
    .select('id')
    .eq('id', agencyId)
    .eq('owner_user_id', userId)
    .single();

  return !error && data !== null;
}

/**
 * Check if agency owns a client
 */
export async function agencyOwnsClient(agencyId: string, clientId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('agency_id', agencyId)
    .single();

  return !error && data !== null;
}

/**
 * Check if agency owns a project
 */
export async function agencyOwnsProject(agencyId: string, projectId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('agency_projects')
    .select('id')
    .eq('id', projectId)
    .eq('agency_id', agencyId)
    .single();

  return !error && data !== null;
}
