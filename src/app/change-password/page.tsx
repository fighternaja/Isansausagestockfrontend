"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { API_URL } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const { token, refreshProfile } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }
    if (password !== confirm) {
      toast.error('รหัสผ่านไม่ตรงกัน')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      await refreshProfile()
      toast.success('เปลี่ยนรหัสผ่านสำเร็จ')
      router.replace('/')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
          <CardDescription>กรุณาตั้งรหัสผ่านใหม่ก่อนใช้งานระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่านใหม่</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">ยืนยันรหัสผ่าน</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
