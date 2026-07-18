"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmationModal } from '@/components/ConfirmationModal'

// Types
type Product = {
  id: string
  name: string
  category: string | null
  unit: string
  quantity: number
  min_threshold: number | null
}

export default function ProductList({ initialProducts, isAdmin }: { initialProducts: Product[], isAdmin: boolean }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false)

  // Selected product state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Form states
  const [formData, setFormData] = useState({ name: '', category: '', unit: '', min_threshold: '' })
  const [adjustData, setAdjustData] = useState({ amount: '', note: '' })
  const [adjustType, setAdjustType] = useState<'รับเข้า' | 'เบิกออก'>('รับเข้า')

  const [isLoading, setIsLoading] = useState(false)

  // Filtered products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const openAddModal = () => {
    setFormData({ name: '', category: '', unit: '', min_threshold: '' })
    setIsAddModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      category: product.category || '',
      unit: product.unit,
      min_threshold: product.min_threshold?.toString() || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const openAdjustModal = (product: Product, type: 'รับเข้า' | 'เบิกออก') => {
    setSelectedProduct(product)
    setAdjustType(type)
    setAdjustData({ amount: '', note: '' })
    setIsAdjustModalOpen(true)
  }

  // API Calls
  const getAuthToken = async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const handleAddProduct = async () => {
    setIsLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || null,
          unit: formData.unit,
          min_threshold: formData.min_threshold ? parseInt(formData.min_threshold) : null,
          quantity: 0
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setProducts([...products, data.product].sort((a, b) => a.name.localeCompare(b.name)))
      toast.success('เพิ่มสินค้าสำเร็จ')
      setIsAddModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return
    setIsLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category || null,
          unit: formData.unit,
          min_threshold: formData.min_threshold ? parseInt(formData.min_threshold) : null,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setProducts(products.map(p => p.id === data.product.id ? data.product : p))
      toast.success('แก้ไขสินค้าสำเร็จ')
      setIsEditModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    setIsLoading(true)
    try {
      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/products/${selectedProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setProducts(products.filter(p => p.id !== selectedProduct.id))
      toast.success('ลบสินค้าสำเร็จ')
      setIsDeleteModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedProduct) return
    setIsLoading(true)
    try {
      const amount = parseInt(adjustData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error('กรุณาระบุจำนวนที่ถูกต้อง')
      }

      const changeAmount = adjustType === 'รับเข้า' ? amount : -amount

      if (adjustType === 'เบิกออก' && selectedProduct.quantity + changeAmount < 0) {
        throw new Error('จำนวนเบิกออกมากกว่าสต็อกคงเหลือ')
      }

      const token = await getAuthToken()
      const res = await fetch(`${apiUrl}/api/products/${selectedProduct.id}/stock`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          changeAmount,
          actionType: adjustType,
          note: adjustData.note
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      setProducts(products.map(p => p.id === selectedProduct.id ? { ...p, quantity: data.newQuantity } : p))
      toast.success('ปรับสต็อกสำเร็จ')
      setIsAdjustModalOpen(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="ค้นหาสินค้า..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isAdmin && (
          <Button onClick={openAddModal}>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มสินค้าใหม่
          </Button>
        )}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อสินค้า</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead className="text-right">คงเหลือ</TableHead>
              <TableHead>หน่วย</TableHead>
              <TableHead className="text-center">จัดการสต็อก</TableHead>
              {isAdmin && <TableHead className="text-right">การกระทำ</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  ไม่พบสินค้า
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => {
                const isLow = product.min_threshold !== null && product.quantity <= product.min_threshold
                return (
                  <TableRow key={product.id} className={isLow ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}>
                    <TableCell className="font-medium">
                      {product.name}
                      {isLow && <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full dark:bg-orange-900 dark:text-orange-300">ใกล้หมด</span>}
                    </TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell className={`text-right font-bold ${isLow ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                      {product.quantity}
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <div className="flex justify-center items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openAdjustModal(product, 'รับเข้า')} className="text-success hover:text-success border-success/30 hover:bg-success/10">
                          <ArrowUpCircle className="h-4 w-4 mr-1" /> รับเข้า
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAdjustModal(product, 'เบิกออก')} className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10">
                          <ArrowDownCircle className="h-4 w-4 mr-1" /> เบิกออก
                        </Button>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteModal(product)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Modal */}
      <ConfirmationModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false) }}
        onConfirm={isAddModalOpen ? handleAddProduct : handleEditProduct}
        title={isAddModalOpen ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}
        description={isAddModalOpen ? 'ระบุข้อมูลสินค้าใหม่' : 'แก้ไขข้อมูลสินค้า'}
        confirmText="บันทึก"
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อสินค้า</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">หมวดหมู่ (เว้นว่างได้)</Label>
            <Input id="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">หน่วยนับ</Label>
            <Input id="unit" placeholder="เช่น ชิ้น, กล่อง" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_threshold">จำนวนขั้นต่ำ (แจ้งเตือนเมื่อใกล้หมด)</Label>
            <Input id="min_threshold" type="number" placeholder="เว้นว่างได้" value={formData.min_threshold} onChange={(e) => setFormData({...formData, min_threshold: e.target.value})} />
          </div>
        </div>
      </ConfirmationModal>

      {/* Delete Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProduct}
        title="ยืนยันการลบสินค้า"
        description={`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${selectedProduct?.name}"? การดำเนินการนี้ไม่สามารถยกเลิกได้`}
        confirmText="ลบสินค้า"
        variant="destructive"
        isLoading={isLoading}
      />

      {/* Adjust Stock Modal */}
      <ConfirmationModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onConfirm={handleAdjustStock}
        title={`ปรับสต็อก: ${selectedProduct?.name}`}
        description={`ระบุจำนวนที่ต้องการ${adjustType}`}
        confirmText="ยืนยัน"
        variant={adjustType === 'เบิกออก' ? 'destructive' : 'default'}
        isLoading={isLoading}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">จำนวนที่{adjustType}</Label>
            <Input id="amount" type="number" min="1" value={adjustData.amount} onChange={(e) => setAdjustData({...adjustData, amount: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">หมายเหตุ (ถ้ามี)</Label>
            <Input id="note" value={adjustData.note} onChange={(e) => setAdjustData({...adjustData, note: e.target.value})} />
          </div>
        </div>
      </ConfirmationModal>
    </div>
  )
}
