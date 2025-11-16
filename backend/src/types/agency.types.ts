/**
 * AGENCY PLATFORM TYPES
 * Type definitions for the B2B Agency features
 */

import { Database } from './database';

// ============================================
// DATABASE TABLE TYPES (Extract from Database)
// ============================================

export type Agency = Database['public']['Tables']['agencies']['Row'];
export type AgencyInsert = Database['public']['Tables']['agencies']['Insert'];
export type AgencyUpdate = Database['public']['Tables']['agencies']['Update'];

export type Client = Database['public']['Tables']['clients']['Row'];
export type ClientInsert = Database['public']['Tables']['clients']['Insert'];
export type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export type AgencyProject = Database['public']['Tables']['agency_projects']['Row'];
export type AgencyProjectInsert = Database['public']['Tables']['agency_projects']['Insert'];
export type AgencyProjectUpdate = Database['public']['Tables']['agency_projects']['Update'];

export type User = Database['public']['Tables']['users']['Row'];
export type Website = Database['public']['Tables']['websites']['Row'];

// ============================================
// BRANDING CONFIG
// ============================================

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

// ============================================
// EXTENDED TYPES (with relations)
// ============================================

export interface AgencyWithOwner extends Agency {
  owner?: User;
}

export interface ClientWithAgency extends Client {
  agency?: Agency;
}

export interface AgencyProjectWithRelations extends AgencyProject {
  agency?: Agency;
  client?: Client;
  website?: Website;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

// Agency DTOs
export interface CreateAgencyDTO {
  name: string;
  owner_user_id: string;
  branding_config?: BrandingConfig;
}

export interface UpdateAgencyDTO {
  name?: string;
  slug?: string;
  branding_config?: BrandingConfig;
  stripe_connect_id?: string;
  stripe_connect_status?: string;
  settings?: AgencySettings;
}

// Client DTOs
export interface CreateClientDTO {
  agency_id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  industry?: string;
  website_url?: string;
  notes?: string;
}

export interface UpdateClientDTO {
  name?: string;
  contact_email?: string;
  contact_phone?: string;
  company_name?: string;
  industry?: string;
  website_url?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'archived';
}

// Agency Project DTOs
export interface CreateAgencyProjectDTO {
  agency_id: string;
  client_id: string;
  project_name: string;
  project_description?: string;
  initial_prompt: string;
  client_can_edit?: boolean;
}

export interface UpdateAgencyProjectDTO {
  project_name?: string;
  project_description?: string;
  status?: 'draft' | 'generating' | 'live' | 'archived' | 'paused';
  website_id?: string;
  client_can_edit?: boolean;
  is_billed?: boolean;
  billed_amount?: number;
  custom_fields?: Record<string, any>;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface AgencyStatsResponse {
  total_clients: number;
  total_projects: number;
  active_projects: number;
  total_websites: number;
  projects_this_month: number;
  monthly_revenue?: number;
}

export interface ClientProjectsResponse {
  projects: Array<{
    project_id: string;
    project_name: string;
    status: string;
    website_id: string | null;
    website_subdomain: string | null;
    created_at: string;
    updated_at: string;
  }>;
  client: Client;
}

export interface AgencyDashboardData {
  agency: Agency;
  stats: AgencyStatsResponse;
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
// REQUEST TYPES (for API routes)
// ============================================

export interface CreateProjectForClientRequest {
  client_id: string;
  project_name: string;
  initial_prompt: string;
  project_description?: string;
}

export interface GenerateWebsiteForProjectRequest {
  project_id: string;
  prompt: string;
}

// ============================================
// AUTH CONTEXT EXTENSION
// ============================================

export interface AgencyAuthContext {
  user_id: string;
  account_type: 'personal' | 'agency';
  agency_id?: string | null;
  agency?: Agency | null;
}

// ============================================
// ENUMS (for consistency)
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
// VALIDATION SCHEMAS (Zod-compatible types)
// ============================================

export const AGENCY_NAME_MIN_LENGTH = 2;
export const AGENCY_NAME_MAX_LENGTH = 255;

export const CLIENT_NAME_MIN_LENGTH = 2;
export const CLIENT_NAME_MAX_LENGTH = 255;

export const PROJECT_NAME_MIN_LENGTH = 2;
export const PROJECT_NAME_MAX_LENGTH = 255;
