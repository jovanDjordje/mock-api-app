import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

// Client-side Supabase client (uses anon key, subject to RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin Supabase client (uses service_role key, bypasses RLS)
// ONLY use this in server-side API routes, NEVER expose to client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database types
export type User = {
  id: string
  username: string
  password_hash: string
  api_key: string | null
  created_at: string
}

export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
}

export type Endpoint = {
  id: string
  project_id: string
  method: string
  path: string
  response_body: string | null
  status_code: number
  requires_sub_key: boolean
  created_at: string
}

export type ApiKey = {
  id: string
  endpoint_id: string
  key_value: string
  created_at: string
}
