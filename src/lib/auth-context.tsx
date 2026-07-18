"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { API_URL, UserProfile } from '@/lib/api'

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  loading: boolean
  token: string | null
  isAdmin: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async (accessToken: string) => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.profile as UserProfile
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!session?.access_token) return
    const p = await fetchProfile(session.access_token)
    setProfile(p)
  }, [session, fetchProfile])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s)
      if (s?.access_token) {
        const p = await fetchProfile(s.access_token)
        setProfile(p)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s)
        if (s?.access_token) {
          const p = await fetchProfile(s.access_token)
          setProfile(p)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // Redirect logic
  useEffect(() => {
    if (loading) return

    const isLoginPage = pathname === '/login'
    const isChangePasswordPage = pathname === '/change-password'

    if (!session && !isLoginPage) {
      router.replace('/login')
      return
    }

    if (session && isLoginPage) {
      router.replace('/')
      return
    }

    if (session && profile?.must_change_password && !isChangePasswordPage && !isLoginPage) {
      router.replace('/change-password')
      return
    }

    if (session && pathname.startsWith('/admin') && profile?.role !== 'admin') {
      router.replace('/')
    }
  }, [loading, session, profile, pathname, router])

  const signOut = async () => {
    const supabase = createClient()
    if (session?.access_token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {})
    }
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    router.replace('/login')
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        token: session?.access_token ?? null,
        isAdmin: profile?.role === 'admin',
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
