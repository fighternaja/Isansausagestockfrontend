"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { API_URL } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Package } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        await fetch(`${API_URL}/api/auth/login-failed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => {})
        throw new Error('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
      }

      const token = data.session?.access_token
      if (!token) throw new Error('ไม่สามารถเข้าสู่ระบบได้')

      const meRes = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const meData = await meRes.json()

      if (!meRes.ok) {
        await supabase.auth.signOut()
        throw new Error(meData.error || 'บัญชีไม่สามารถใช้งานได้')
      }

      toast.success('เข้าสู่ระบบสำเร็จ')

      if (meData.profile?.must_change_password) {
        router.replace('/change-password')
      } else {
        router.replace('/')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center space-y-1">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>ระบบจัดการสต็อกสินค้า (Stock Tracker)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
