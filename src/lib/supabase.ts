// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'

export const supabase = createClient(env.supabaseUrl, env.supabaseKey)