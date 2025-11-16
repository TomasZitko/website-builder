/**
 * B2B2C Types - Account Tiers, Clients, Portfolio
 */

export type AccountType = 'personal' | 'freelancer' | 'agency';
export type SubscriptionTier = 'free' | 'personal' | 'freelancer' | 'agency';
export type ClientStatus = 'active' | 'inactive' | 'pending';
export type AccessLevel = 'view' | 'edit' | 'admin';
export type BillingCycle = 'monthly' | 'yearly' | 'one-time';
export type ProjectStatus = 'in_progress' | 'review' | 'completed' | 'maintenance';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface Client {
  id: string;
  developer_id: string;

  // Client info
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  client_logo_url?: string;

  // Status
  status: ClientStatus;
  invitation_token?: string;
  invitation_sent_at?: Date;
  invitation_accepted_at?: Date;

  // Access
  client_user_id?: string;
  access_level: AccessLevel;

  // Billing
  monthly_fee?: number;
  billing_cycle: BillingCycle;
  next_billing_date?: Date;
  total_revenue: number;

  // Metadata
  notes?: string;
  tags: string[];
  custom_fields: Record<string, any>;

  created_at: Date;
  updated_at: Date;
}

export interface PortfolioWebsite {
  id: string;
  developer_id: string;

  // Website info
  name: string;
  description?: string;
  category?: string;

  // Code
  html_code: string;
  css_code?: string;
  js_code?: string;

  // Preview
  thumbnail_url?: string;
  preview_url?: string;

  // Display
  is_featured: boolean;
  display_order: number;
  is_visible: boolean;

  // Fake project details
  fake_client_name?: string;
  fake_completion_date?: Date;
  fake_technologies: string[];
  fake_testimonial?: string;

  created_at: Date;
  updated_at: Date;
}

export interface ClientWebsite {
  id: string;
  client_id: string;
  website_id: string;
  developer_id: string;

  // Project details
  project_name?: string;
  project_status: ProjectStatus;

  // Pricing
  quoted_price?: number;
  final_price?: number;
  payment_status: PaymentStatus;

  // Timeline
  started_at: Date;
  estimated_completion?: Date;
  completed_at?: Date;

  // Communication
  last_client_message_at?: Date;
  unread_messages_count: number;

  created_at: Date;
  updated_at: Date;
}

export interface DeveloperAnalytics {
  id: string;
  developer_id: string;
  date: Date;

  // Metrics
  total_clients: number;
  active_clients: number;
  new_clients: number;
  churned_clients: number;

  total_websites: number;
  active_websites: number;
  new_websites: number;

  // Revenue
  revenue_today: number;
  revenue_mtd: number;
  revenue_ytd: number;

  // Usage
  api_calls: number;
  ai_generations: number;

  created_at: Date;
}

export interface SubscriptionPlan {
  id: string;

  // Plan details
  name: string;
  tier: SubscriptionTier;
  price_monthly: number;
  price_yearly: number;

  // Limits
  max_websites: number; // -1 = unlimited
  max_clients: number;
  max_custom_domains: number;
  max_ai_generations_monthly: number;
  max_storage_gb: number;

  // Features
  features: {
    custom_domain: boolean;
    white_label: boolean;
    priority_support: boolean;
    advanced_analytics: boolean;
    client_management: boolean;
    portfolio_generator: boolean;
    api_access: boolean;
    team_members: number;
  };

  // Display
  is_active: boolean;
  is_popular: boolean;
  display_order: number;

  // Stripe
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;

  created_at: Date;
  updated_at: Date;
}

export interface DeveloperStats {
  total_clients: number;
  active_clients: number;
  total_websites: number;
  total_revenue: number;
  websites_this_month: number;
}

// Enhanced User type with B2B2C fields
export interface UserWithB2B2C {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;

  // Subscription
  subscription_tier: SubscriptionTier;
  subscription_status: string;
  subscription_started_at?: Date;
  subscription_ends_at?: Date;
  stripe_customer_id?: string;

  // Account type
  account_type: AccountType;

  // Developer fields
  agency_name?: string;
  agency_logo_url?: string;
  agency_website?: string;
  portfolio_generated: boolean;
  white_label_enabled: boolean;
  custom_branding: Record<string, any>;

  // Billing
  billing_email?: string;
  billing_address?: Record<string, any>;
  tax_id?: string;

  // Verification
  email_verified: boolean;

  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

// API Request/Response types
export interface CreateClientRequest {
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  monthly_fee?: number;
  billing_cycle?: BillingCycle;
  notes?: string;
}

export interface InviteClientRequest {
  client_id: string;
  access_level?: AccessLevel;
}

export interface GeneratePortfolioRequest {
  count?: number; // How many demo sites to generate (default 10)
  categories?: string[]; // Which categories to include
}

export interface UpdateAccountTypeRequest {
  account_type: AccountType;
  agency_name?: string;
  agency_logo_url?: string;
}

export interface UpgradeSubscriptionRequest {
  tier: SubscriptionTier;
  billing_cycle: 'monthly' | 'yearly';
  payment_method_id: string;
}
