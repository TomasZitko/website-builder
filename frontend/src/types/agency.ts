/**
 * AGENCY PLATFORM FRONTEND TYPES
 * TypeScript types for Agency, Clients, and Projects
 */

// ============================================
// CORE TYPES (Mirror backend)
// ============================================

export interface Agency {
  id: string;
  created_at: string;
  updated_at: string;
  owner_user_id: string;
  name: string;
  slug: string | null;
  branding_config: BrandingConfig;
  stripe_connect_id: string | null;
  stripe_connect_status: string;
  settings: AgencySettings;
  total_clients: number;
  total_projects: number;
  monthly_revenue: number;
}

export interface BrandingConfig {
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  company_name?: string | null;
}

export interface AgencySettings {
  allow_client_login?: boolean;
  max_projects_per_client?: number;
  default_subdomain_suffix?: string;
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

export interface AgencyProjectWithRelations extends AgencyProject {
  client?: Client;
  website?: {
    id: string;
    name: string;
    subdomain: string | null;
    is_published: boolean;
  };
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
  recent_projects: AgencyProjectWithRelations[];
}

export interface ClientPortalData {
  client: Client;
  agency: Agency;
  projects: AgencyProjectWithRelations[];
  branding: BrandingConfig;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateClientFormData {
  name: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  industry?: string;
  website_url?: string;
  notes?: string;
}

export interface UpdateClientFormData extends Partial<CreateClientFormData> {
  status?: 'active' | 'inactive' | 'archived';
}

export interface CreateProjectFormData {
  client_id: string;
  project_name: string;
  initial_prompt: string;
  project_description?: string;
  client_can_edit?: boolean;
}

export interface UpdateProjectFormData {
  project_name?: string;
  project_description?: string;
  status?: 'draft' | 'generating' | 'live' | 'archived' | 'paused';
  client_can_edit?: boolean;
  is_billed?: boolean;
  billed_amount?: number;
  custom_fields?: Record<string, any>;
}

// ============================================
// ENUMS
// ============================================

export enum AccountType {
  PERSONAL = 'personal',
  AGENCY = 'agency'
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived'
}

export enum ProjectStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  LIVE = 'live',
  ARCHIVED = 'archived',
  PAUSED = 'paused'
}

// ============================================
// UI STATE TYPES
// ============================================

export interface ClientsFilterState {
  status?: 'active' | 'inactive' | 'archived';
  search?: string;
}

export interface ProjectsFilterState {
  status?: string;
  client_id?: string;
}
