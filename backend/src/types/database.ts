// Auto-generated TypeScript types for Supabase database schema
// These types match the 001_initial.sql migration file

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string | null
          last_name: string | null
          subscription_tier: string
          subscription_status: string
          subscription_started_at: string | null
          subscription_ends_at: string | null
          stripe_customer_id: string | null
          wedos_ftp_host: string | null
          wedos_ftp_username: string | null
          wedos_ftp_password_encrypted: string | null
          email_verified: boolean
          email_verification_token: string | null
          password_reset_token: string | null
          password_reset_expires: string | null
          created_at: string
          updated_at: string
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name?: string | null
          last_name?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_started_at?: string | null
          subscription_ends_at?: string | null
          stripe_customer_id?: string | null
          wedos_ftp_host?: string | null
          wedos_ftp_username?: string | null
          wedos_ftp_password_encrypted?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string | null
          last_name?: string | null
          subscription_tier?: string
          subscription_status?: string
          subscription_started_at?: string | null
          subscription_ends_at?: string | null
          stripe_customer_id?: string | null
          wedos_ftp_host?: string | null
          wedos_ftp_username?: string | null
          wedos_ftp_password_encrypted?: string | null
          email_verified?: boolean
          email_verification_token?: string | null
          password_reset_token?: string | null
          password_reset_expires?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
        }
      }
      websites: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          subdomain: string | null
          custom_domain: string | null
          html_code: string
          css_code: string | null
          js_code: string | null
          pages: Json
          images: Json
          content_data: Json
          ai_conversation: Json
          theme: string | null
          color_scheme: Json | null
          is_published: boolean
          published_at: string | null
          preview_image_url: string | null
          is_paid: boolean
          paid_at: string | null
          payment_amount: number | null
          view_count: number
          last_viewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          subdomain?: string | null
          custom_domain?: string | null
          html_code: string
          css_code?: string | null
          js_code?: string | null
          pages?: Json
          images?: Json
          content_data?: Json
          ai_conversation?: Json
          theme?: string | null
          color_scheme?: Json | null
          is_published?: boolean
          published_at?: string | null
          preview_image_url?: string | null
          is_paid?: boolean
          paid_at?: string | null
          payment_amount?: number | null
          view_count?: number
          last_viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          subdomain?: string | null
          custom_domain?: string | null
          html_code?: string
          css_code?: string | null
          js_code?: string | null
          pages?: Json
          images?: Json
          content_data?: Json
          ai_conversation?: Json
          theme?: string | null
          color_scheme?: Json | null
          is_published?: boolean
          published_at?: string | null
          preview_image_url?: string | null
          is_paid?: boolean
          paid_at?: string | null
          payment_amount?: number | null
          view_count?: number
          last_viewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      website_versions: {
        Row: {
          id: string
          website_id: string
          version_number: number
          html_code: string
          css_code: string | null
          js_code: string | null
          pages: Json
          content_data: Json
          change_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          website_id: string
          version_number: number
          html_code: string
          css_code?: string | null
          js_code?: string | null
          pages?: Json
          content_data?: Json
          change_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          website_id?: string
          version_number?: number
          html_code?: string
          css_code?: string | null
          js_code?: string | null
          pages?: Json
          content_data?: Json
          change_description?: string | null
          created_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          website_id: string
          user_id: string
          messages: Json
          model_used: string | null
          tokens_used: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          website_id: string
          user_id: string
          messages?: Json
          model_used?: string | null
          tokens_used?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          website_id?: string
          user_id?: string
          messages?: Json
          model_used?: string | null
          tokens_used?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          website_id: string | null
          stripe_payment_intent_id: string
          stripe_charge_id: string | null
          amount: number
          currency: string
          payment_type: string | null
          status: string
          invoice_url: string | null
          invoice_pdf: string | null
          description: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          website_id?: string | null
          stripe_payment_intent_id: string
          stripe_charge_id?: string | null
          amount: number
          currency?: string
          payment_type?: string | null
          status?: string
          invoice_url?: string | null
          invoice_pdf?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          website_id?: string | null
          stripe_payment_intent_id?: string
          stripe_charge_id?: string | null
          amount?: number
          currency?: string
          payment_type?: string | null
          status?: string
          invoice_url?: string | null
          invoice_pdf?: string | null
          description?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string | null
          html_code: string
          css_code: string | null
          js_code: string | null
          pages: Json
          thumbnail_url: string | null
          demo_url: string | null
          usage_count: number
          rating: number
          is_active: boolean
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category?: string | null
          html_code: string
          css_code?: string | null
          js_code?: string | null
          pages?: Json
          thumbnail_url?: string | null
          demo_url?: string | null
          usage_count?: number
          rating?: number
          is_active?: boolean
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string | null
          html_code?: string
          css_code?: string | null
          js_code?: string | null
          pages?: Json
          thumbnail_url?: string | null
          demo_url?: string | null
          usage_count?: number
          rating?: number
          is_active?: boolean
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      hosting_accounts: {
        Row: {
          id: string
          user_id: string
          provider: string
          ftp_host: string
          ftp_username: string
          ftp_password_encrypted: string
          ftp_port: number
          is_verified: boolean
          last_tested_at: string | null
          test_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          ftp_host: string
          ftp_username: string
          ftp_password_encrypted: string
          ftp_port?: number
          is_verified?: boolean
          last_tested_at?: string | null
          test_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          ftp_host?: string
          ftp_username?: string
          ftp_password_encrypted?: string
          ftp_port?: number
          is_verified?: boolean
          last_tested_at?: string | null
          test_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          api_endpoint: string | null
          request_method: string | null
          response_status: number | null
          ai_model: string | null
          tokens_used: number | null
          cost_estimate: number | null
          ip_address: string | null
          user_agent: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          api_endpoint?: string | null
          request_method?: string | null
          response_status?: number | null
          ai_model?: string | null
          tokens_used?: number | null
          cost_estimate?: number | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          api_endpoint?: string | null
          request_method?: string | null
          response_status?: number | null
          ai_model?: string | null
          tokens_used?: number | null
          cost_estimate?: number | null
          ip_address?: string | null
          user_agent?: string | null
          timestamp?: string
        }
      }
    }
    Views: {}
    Functions: {
      cleanup_old_usage_logs: {
        Args: {}
        Returns: void
      }
      increment_website_views: {
        Args: { website_uuid: string }
        Returns: void
      }
    }
  }
}
