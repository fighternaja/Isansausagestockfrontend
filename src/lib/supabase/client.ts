import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

/** Supabase client สำหรับ browser — เก็บ session ใน sessionStorage (หายเมื่อปิดแท็บ) */
export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error('createClient() ใช้ได้เฉพาะฝั่ง browser')
  }

  if (!browserClient) {
    browserClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          storage: window.sessionStorage,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    )
  }

  return browserClient
}
