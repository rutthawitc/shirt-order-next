// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

// Client-side Supabase (anon key - limited permissions)
export const supabase = createClient(env.supabaseUrl, env.supabaseKey)

// Server-side Supabase admin (service role key - full permissions, bypasses RLS)
// Only create if service key is different from anon key (meaning it was explicitly set)
export const supabaseAdmin =
  env.supabaseServiceKey && env.supabaseServiceKey !== env.supabaseKey
    ? createClient(env.supabaseUrl, env.supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : createClient(env.supabaseUrl, env.supabaseKey)