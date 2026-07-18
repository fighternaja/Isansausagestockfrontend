import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  let logs = []
  try {
    const res = await fetch(`${apiUrl}/api/logs`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
    if (res.ok) {
      const data = await res.json()
      logs = data.logs
    }
  } catch (error) {
    console.error('Failed to fetch logs', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ประวัติการเคลื่อนไหวสต็อก</h1>
        <p className="text-muted-foreground">ตรวจสอบประวัติการรับเข้าและเบิกออกทั้งหมด</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>รายการทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่-เวลา</TableHead>
                <TableHead>สินค้า</TableHead>
                <TableHead>รายการ</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
                <TableHead className="text-right">ก่อนหน้า</TableHead>
                <TableHead className="text-right">คงเหลือ</TableHead>
                <TableHead>ผู้ทำรายการ</TableHead>
                <TableHead>หมายเหตุ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    ไม่พบประวัติ
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('th-TH')}
                    </TableCell>
                    <TableCell className="font-medium">{log.products?.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.action_type === 'รับเข้า' ? 'bg-success/10 text-success dark:bg-success/20 dark:text-success' : 
                        log.action_type === 'เบิกออก' ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {log.action_type}
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${log.change_amount > 0 ? 'text-success' : log.change_amount < 0 ? 'text-destructive' : ''}`}>
                      {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{log.quantity_before}</TableCell>
                    <TableCell className="text-right font-bold">{log.quantity_after}</TableCell>
                    <TableCell>{log.profiles?.full_name || log.profiles?.email || 'System'}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate" title={log.note || ''}>
                      {log.note || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
