"use client"

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      // Log out on backend first if we have a token
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        }).catch(() => {}) // Don't fail if backend log fails
      }

      // Sign out from Supabase
      await supabase.auth.signOut()
      toast.success('ออกจากระบบสำเร็จ')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการออกจากระบบ')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <LogOut className="h-4 w-4 mr-2" />
      ออกจากระบบ
    </button>
  )
}
