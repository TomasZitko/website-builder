import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not found in environment variables.')
  console.warn('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local')
}

// Create Supabase client for frontend
// Note: This app uses JWT auth via backend API, but Supabase client is available for:
// - Direct database queries (respecting RLS)
// - Realtime subscriptions
// - Storage operations
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: false, // We use custom JWT auth
      autoRefreshToken: false,
    },
  }
)

// Helper to set Supabase auth token from our JWT system
export const setSupabaseAuth = (token: string) => {
  // This allows Supabase RLS to work with our custom JWT tokens
  // if the JWT is compatible with Supabase's auth system
  supabase.auth.setSession({
    access_token: token,
    refresh_token: '',
  })
}

// Helper to clear Supabase auth
export const clearSupabaseAuth = () => {
  supabase.auth.signOut()
}

// Export for convenience
export default supabase
