import { createClient } from '@supabase/supabase-js'

declare global {
  interface Window { __ENV__?: Record<string, any> }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (typeof window !== 'undefined' && window.__ENV__?.VITE_SUPABASE_URL)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof window !== 'undefined' && window.__ENV__?.VITE_SUPABASE_ANON_KEY)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file or Cloud Run envs.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
