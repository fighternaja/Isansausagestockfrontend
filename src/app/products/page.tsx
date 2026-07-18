import { createClient } from '@/lib/supabase/server'
import ProductList from './ProductList';

export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  // Fetch all products
  let products = []
  try {
    const res = await fetch(`${apiUrl}/api/products`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      products = data.products
    }
  } catch (error) {
    console.error('Failed to fetch products', error)
  }

  // Check if admin
  let isAdmin = false
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">คลังสินค้า</h1>
        <p className="text-muted-foreground">จัดการและตรวจสอบสต็อกสินค้าทั้งหมด</p>
      </div>
      
      <ProductList initialProducts={products || []} isAdmin={isAdmin} />
    </div>
  )
}
