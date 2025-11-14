/**
 * Production Architecture Types
 * Extended database types for multi-website dashboard, analytics, and deployment
 */

import { Json } from './database';

//═══════════════════════════════════════════════════════════
// Website with Deployment Fields
//═══════════════════════════════════════════════════════════

export interface Website {
  // Basic Info
  id: string;
  user_id: string;
  name: string;
  description: string | null;

  // Code
  html_code: string;
  css_code: string | null;
  js_code: string | null;

  // Content
  pages: Json;
  images: Json;
  content_data: Json;
  ai_conversation: Json;

  // Design
  theme: string | null;
  color_scheme: Json | null;
  preview_image_url: string | null;

  // Deployment (NEW)
  subdomain: string | null;
  custom_domain: string | null;
  custom_domain_verified: boolean;
  ssl_enabled: boolean;
  deployment_status: 'draft' | 'deploying' | 'live' | 'failed' | 'archived';
  deployment_provider: 'internal' | 'wedos' | 'custom';
  deployed_at: string | null;
  last_deployed_at: string | null;
  deployment_url: string | null;

  // Wedos Integration (NEW)
  wedos_service_id: string | null;
  wedos_domain_id: string | null;
  wedos_ftp_path: string | null;

  // Analytics (NEW)
  total_views: number;
  unique_visitors: number;
  last_viewed_at: string | null;

  // Payment
  is_paid: boolean;
  paid_at: string | null;
  payment_amount: number | null;
  subscription_status: 'none' | 'active' | 'expired';

  // Publishing (legacy - kept for compatibility)
  is_published: boolean;
  published_at: string | null;
  view_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

//═══════════════════════════════════════════════════════════
// Website Analytics
//═══════════════════════════════════════════════════════════

export interface WebsiteAnalytics {
  id: string;
  website_id: string;

  // Visit Data
  visitor_ip: string | null;
  visitor_country: string | null;
  visitor_city: string | null;

  // Page Data
  page_url: string;
  referrer: string | null;
  user_agent: string | null;

  // Device Info
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string | null;
  os: string | null;

  // Timing
  visited_at: string;
  session_duration: number;
}

//═══════════════════════════════════════════════════════════
// Website Images
//═══════════════════════════════════════════════════════════

export interface WebsiteImage {
  id: string;
  website_id: string;

  // Image Data
  filename: string;
  original_filename: string | null;
  file_size: number | null;
  mime_type: string | null;

  // Storage
  storage_url: string;
  storage_provider: 's3' | 'cloudinary' | 'local' | 'cdn';

  // Usage
  used_in_page: boolean;
  alt_text: string | null;

  // AI Context
  uploaded_via_chat: boolean;
  chat_session_id: string | null;
  ai_description: string | null;

  // Timestamps
  created_at: string;
}

//═══════════════════════════════════════════════════════════
// Deployments (Version History)
//═══════════════════════════════════════════════════════════

export interface Deployment {
  id: string;
  website_id: string;

  // Deployment Info
  version: number;
  deployment_status: 'in_progress' | 'success' | 'failed';
  deployment_provider: 'internal' | 'wedos' | 'custom';
  deployed_by: string;

  // Code Snapshot
  html_code: string;
  css_code: string | null;
  js_code: string | null;

  // Changes
  change_summary: string | null;
  triggered_by: 'manual' | 'chat' | 'api' | 'scheduled';

  // Results
  deployment_url: string | null;
  error_message: string | null;
  deployment_time_ms: number | null;

  // Timestamps
  created_at: string;
}

//═══════════════════════════════════════════════════════════
// Domain Verifications
//═══════════════════════════════════════════════════════════

export interface DomainVerification {
  id: string;
  website_id: string;
  domain: string;

  // Verification
  verification_token: string;
  verification_method: 'dns' | 'http' | 'email';
  verification_status: 'pending' | 'verified' | 'failed' | 'expired';

  // DNS Records Expected
  expected_cname: string | null;
  expected_txt: string | null;

  // Verification Result
  verified_at: string | null;
  last_check_at: string | null;

  // Timestamps
  created_at: string;
  expires_at: string | null;
}

//═══════════════════════════════════════════════════════════
// Analytics Stats (API Response)
//═══════════════════════════════════════════════════════════

export interface AnalyticsStats {
  period: string;
  totalViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  topPages: Array<{
    page_url: string;
    views: number;
  }>;
  devices: Array<{
    device_type: string;
    count: number;
    percentage: number;
  }>;
  referrers: Array<{
    referrer: string;
    count: number;
  }>;
  countries: Array<{
    country: string;
    count: number;
  }>;
  timeline: Array<{
    date: string;
    views: number;
    visitors: number;
  }>;
}

//═══════════════════════════════════════════════════════════
// Deployment Result
//═══════════════════════════════════════════════════════════

export interface DeploymentResult {
  success: boolean;
  deploymentUrl: string;
  error?: string;
  deploymentTimeMs: number;
  version?: number;
}

//═══════════════════════════════════════════════════════════
// Image Upload Result
//═══════════════════════════════════════════════════════════

export interface ImageUploadResult {
  id: string;
  filename: string;
  storage_url: string;
  file_size: number;
  mime_type: string;
}

//═══════════════════════════════════════════════════════════
// Wedos FTP Credentials
//═══════════════════════════════════════════════════════════

export interface WedosFTPCredentials {
  ftp_host: string;
  ftp_username: string;
  ftp_password: string; // Will be encrypted before storage
  ftp_port: number;
  ftp_path: string;
}

//═══════════════════════════════════════════════════════════
// Dashboard Website Card Data
//═══════════════════════════════════════════════════════════

export interface DashboardWebsite {
  id: string;
  name: string;
  subdomain: string | null;
  custom_domain: string | null;
  deployment_status: string;
  deployment_url: string | null;
  preview_image_url: string | null;
  total_views: number;
  unique_visitors: number;
  deployment_count: number;
  last_deployment_at: string | null;
  image_count: number;
  created_at: string;
  updated_at: string;
}
