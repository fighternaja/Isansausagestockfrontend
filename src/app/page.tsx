import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  // Fetch all products from backend API
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

  // Fetch recent logs from backend API
  let recentLogs = []
  try {
    const res = await fetch(`${apiUrl}/api/logs`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      recentLogs = data.logs.slice(0, 5) // Just take top 5
    }
  } catch (error) {
    console.error('Failed to fetch logs', error)
  }

  const totalProducts = products?.length || 0
  
  // Products that are equal to or below their min_threshold
  const lowStockProducts = products?.filter((p: any) => 
    p.min_threshold !== null && p.quantity <= p.min_threshold
  ) || []

  const outOfStockProducts = products?.filter((p: any) => p.quantity === 0) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ภาพรวมระบบ</h1>
        <p className="text-muted-foreground">สรุปสถานะสต็อกสินค้าทั้งหมด</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สินค้าทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts} <span className="text-sm font-normal text-muted-foreground">รายการ</span></div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">ใกล้หมดสต็อก</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {lowStockProducts.length} <span className="text-sm font-normal">รายการ</span>
            </div>
            {lowStockProducts.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                ต้องเติมสต็อกโดยด่วน
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">สินค้าหมด (0)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {outOfStockProducts.length} <span className="text-sm font-normal">รายการ</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>รายการสินค้าที่ต้องเติมสต็อก</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">ไม่มีสินค้าใกล้หมด</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">ขั้นต่ำ: {product.min_threshold}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600 dark:text-orange-400">
                        {product.quantity} {product.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/products">ดูสินค้าทั้งหมด</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ประวัติการเคลื่อนไหวล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs?.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีประวัติ</p>
            ) : (
              <div className="space-y-4">
                {recentLogs?.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{log.products?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <div className={`text-right text-sm font-bold ${log.change_amount > 0 ? 'text-success' : log.change_amount < 0 ? 'text-destructive' : ''}`}>
                      {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {log.action_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/logs">ดูประวัติทั้งหมด</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
