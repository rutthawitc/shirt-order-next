// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

// Client-side Supabase (anon key - limited permissions)
export const supabase = createClient(env.supabaseUrl, env.supabaseKey)

// Server-side Supabase admin (service role key - full permissions, bypasses RLS)
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})