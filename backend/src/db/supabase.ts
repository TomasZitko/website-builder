import 'dotenv/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials. Check .env file.')
}

// Create Supabase client with service role key (bypasses RLS for backend)
export const supabase: SupabaseClient<Database> = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database helper functions
export async function testConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('users').select('count')
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

// Export database instance for raw queries
export const db = supabase

// Type-safe query helpers
export const tables = {
  users: () => supabase.from('users'),
  websites: () => supabase.from('websites'),
  websiteVersions: () => supabase.from('website_versions'),
  chatSessions: () => supabase.from('chat_sessions'),
  payments: () => supabase.from('payments'),
  templates: () => supabase.from('templates'),
  hostingAccounts: () => supabase.from('hosting_accounts'),
  usageLogs: () => supabase.from('usage_logs'),
}

// Export types for TypeScript
export interface User {
  id: string
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
  subscription_tier: 'free' | 'pro'
  subscription_status: string
  subscription_started_at?: string
  subscription_ends_at?: string
  stripe_customer_id?: string
  wedos_ftp_host?: string
  wedos_ftp_username?: string
  wedos_ftp_password_encrypted?: string
  email_verified: boolean
  email_verification_token?: string
  password_reset_token?: string
  password_reset_expires?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface Website {
  id: string
  user_id: string
  name: string
  description?: string
  subdomain?: string
  custom_domain?: string
  html_code: string
  css_code?: string
  js_code?: string
  pages?: any[]
  images?: any[]
  content_data?: any
  ai_conversation?: any[]
  theme?: string
  color_scheme?: any
  is_published: boolean
  published_at?: string
  preview_image_url?: string
  is_paid: boolean
  paid_at?: string
  payment_amount?: number
  view_count: number
  last_viewed_at?: string
  created_at: string
  updated_at: string
}

export interface WebsiteVersion {
  id: string
  website_id: string
  version_number: number
  html_code: string
  css_code?: string
  js_code?: string
  pages?: any[]
  content_data?: any
  change_description?: string
  created_at: string
}

export interface ChatSession {
  id: string
  website_id: string
  user_id: string
  messages: any[]
  model_used?: string
  tokens_used?: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  website_id?: string
  stripe_payment_intent_id: string
  stripe_charge_id?: string
  amount: number
  currency: string
  payment_type?: string
  status: string
  invoice_url?: string
  invoice_pdf?: string
  description?: string
  metadata?: any
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description?: string
  category?: string
  html_code: string
  css_code?: string
  js_code?: string
  pages?: any[]
  thumbnail_url?: string
  demo_url?: string
  usage_count: number
  rating: number
  is_active: boolean
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface HostingAccount {
  id: string
  user_id: string
  provider: string
  ftp_host: string
  ftp_username: string
  ftp_password_encrypted: string
  ftp_port: number
  is_verified: boolean
  last_tested_at?: string
  test_status?: string
  created_at: string
  updated_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  action: string
  api_endpoint?: string
  request_method?: string
  response_status?: number
  ai_model?: string
  tokens_used?: number
  cost_estimate?: number
  ip_address?: string
  user_agent?: string
  timestamp: string
}
