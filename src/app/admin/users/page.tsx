import { createClient } from '@/lib/supabase/server'
import UserList from './UserList'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  let users = []
  try {
    const res = await fetch(`${apiUrl}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      users = data.users
    }
  } catch (error) {
    console.error('Failed to fetch users', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">จัดการผู้ใช้งาน</h1>
        <p className="text-muted-foreground">เพิ่ม ลบ หรือแก้ไขข้อมูลผู้ใช้งานระบบ</p>
      </div>
      
      <UserList initialUsers={users || []} />
    </div>
  )
}
