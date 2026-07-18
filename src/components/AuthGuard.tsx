"use client"

import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'

/** ข้าม AuthGuard สำหรับหน้า login / change-password */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, session, profile } = useAuth()
  const pathname = usePathname()

  // ให้ login/change-password render โดยไม่ต้องรอ session
  if (pathname === '/login' || pathname === '/change-password') {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">กำลังโหลด...</div>
      </div>
    )
  }

  if (!session) return null
  if (profile?.must_change_password) return null

  return <>{children}</>
}
