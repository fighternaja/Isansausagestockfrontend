"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { ThemeToggle } from './ThemeToggle'
import { Package, Users, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export function Header() {
  const pathname = usePathname()
  const { session, isAdmin, signOut, profile } = useAuth()

  if (pathname === '/login' || pathname === '/change-password') {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-end px-4">
          <ThemeToggle />
        </div>
      </header>
    )
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('ออกจากระบบสำเร็จ')
    } catch {
      toast.error('เกิดข้อผิดพลาด')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-primary">
              Stock Tracker
            </span>
          </Link>
          {session && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/products" className="transition-colors hover:text-primary text-foreground/60">
                สินค้า
              </Link>
              <Link href="/logs" className="transition-colors hover:text-primary text-foreground/60">
                ประวัติ
              </Link>
              {isAdmin && (
                <Link href="/admin/users" className="transition-colors hover:text-primary text-foreground/60 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  จัดการผู้ใช้
                </Link>
              )}
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {profile && (
            <span className="hidden text-sm text-muted-foreground md:inline">
              {profile.full_name || profile.email}
            </span>
          )}
          <ThemeToggle />
          {session && (
            <button
              onClick={handleLogout}
              className="inline-flex h-9 items-center rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
