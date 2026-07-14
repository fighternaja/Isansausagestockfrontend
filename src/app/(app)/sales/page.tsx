"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Package } from "lucide-react";

export default function SalesPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  });

  const lowStockProducts = products.filter((product) => product.isLowStock);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">สถานะสต็อก</h1>
        <p className="text-muted-foreground">
          ระบบนี้เน้นการจัดการวัตถุดิบและสินค้าในสต็อก ไม่รองรับการขายหน้าร้าน
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">สินค้าทั้งหมด</CardTitle>
            <Package className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : formatNumber(products.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">รายการสินค้าในระบบ</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">สินค้าต่ำกว่าจุดเตือน</CardTitle>
            <Boxes className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoading ? "..." : formatNumber(lowStockProducts.length, 0)}
            </div>
            <p className="text-sm text-muted-foreground">ต้องตรวจสอบสต็อกทันที</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการสินค้าในสต็อก</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    คงเหลือ {formatNumber(product.quantity, 0)} ชิ้น
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${product.isLowStock ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                  {product.isLowStock ? "ต่ำกว่าเกณฑ์" : "ปลอดภัย"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
