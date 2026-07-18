"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationModal } from '@/components/ConfirmationModal'

type UserProfile = {
  id: string
  email: string
  full_name: string | null
  role: string
  is_active: boolean
  created_at: string
}

export default function UserList({ initialUsers }: { initialUsers: UserProfile[] }) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)
  const router = useRouter()

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  
  const [formData, setFormData] = useState({ email: '', fullName: '', role: 'user', password: '', isActive: true })
  const [isLoading, setIsLoading] = useState(false)

  const getAuthToken = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const openAddModal = () => {
    setFormData({ email: '', fullName: '', role: 'user', password: '', isActive: true })
    setIsAddModalOpen(true)
  }

  const openEditModal = (user: UserProfile) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      fullName: user.full_name || '',
      role: user.role,
      password: '',
      isActive: user.is_active
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user: UserProfile) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleAddUser = async () => {
    setIsLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          password: formData.password,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success('เพิ่มผู้ใช้สำเร็จ')
      setIsAddModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    setIsLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          role: formData.role,
          password: formData.password || undefined,
          isActive: formData.isActive
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success('แก้ไขข้อมูลผู้ใช้สำเร็จ')
      setIsEditModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setIsLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setUsers(users.filter(u => u.id !== selectedUser.id))
      toast.success('ลบผู้ใช้สำเร็จ')
      setIsDeleteModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้ใหม่
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead>บทบาท</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  ไม่พบผู้ใช้งาน
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className={!user.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-primary/20 text-primary font-bold' : 'bg-muted text-muted-foreground'}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="text-success text-sm">ใช้งานได้</span>
                    ) : (
                      <span className="text-destructive text-sm">ถูกปิดใช้งาน</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteModal(user)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit User Modal */}
      <ConfirmationModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false) }}
        onConfirm={isAddModalOpen ? handleAddUser : handleEditUser}
        title={isAddModalOpen ? 'เพิ่มผู้ใช้งานใหม่' : 'แก้ไขข้อมูลผู้ใช้งาน'}
        description={isAddModalOpen ? 'สร้างบัญชีสำหรับผู้ใช้ใหม่ในระบบ' : 'ปรับปรุงข้อมูลหรือรหัสผ่าน'}
        confirmText="บันทึก"
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">อีเมล (ใช้ล็อกอิน)</Label>
            <Input
              id="user-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={isEditModalOpen}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-fullname">ชื่อ-นามสกุล</Label>
            <Input
              id="user-fullname"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-role">บทบาท</Label>
            <select
              id="user-role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="user">User (จัดการสต็อก)</option>
              <option value="admin">Admin (ผู้ดูแลระบบ)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">
              {isEditModalOpen ? 'ตั้งรหัสผ่านใหม่ (เว้นว่างได้หากไม่ต้องการเปลี่ยน)' : 'รหัสผ่านเริ่มต้น'}
            </Label>
            <Input
              id="user-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          {isEditModalOpen && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="user-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="w-4 h-4 rounded border-input"
              />
              <Label htmlFor="user-active" className="mb-0 cursor-pointer">บัญชีเปิดใช้งานอยู่</Label>
            </div>
          )}
        </div>
      </ConfirmationModal>

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUser}
        title="ยืนยันการลบผู้ใช้"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน "${selectedUser?.email}"? ประวัติการเคลื่อนไหวที่เคยทำไว้จะยังคงอยู่`}
        confirmText="ลบผู้ใช้งาน"
        variant="destructive"
        isLoading={isLoading}
      />
    </div>
  )
}
