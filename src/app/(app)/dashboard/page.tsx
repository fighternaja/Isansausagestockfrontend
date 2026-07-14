"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SkewerGauge } from "@/components/ui/skewer-gauge";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Factory,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Boxes,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
} from "recharts";

// ชุดสีสำหรับ Pie Chart ในโทนฟ้าอ่อน-น้ำเงิน สบายตา (Modern Sky Palette)
const SKY_COLORS = [
  "#0ea5e9", // Sky 500
  "#3b82f6", // Blue 500
  "#06b6d4", // Cyan 500
  "#6366f1", // Indigo 500
  "#94a3b8", // Slate 400
];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.dashboard.stats(30),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 bg-slate-50/60 dark:bg-slate-950 min-h-screen">
        <Skeleton className="h-10 w-64 bg-slate-200/80 dark:bg-slate-800 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
          <Skeleton className="h-96 rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { summary, dailySales, topSellingProducts, lowStockAlerts, stockOverview } = data;

  const stockChartData = [
    ...stockOverview.products.slice(0, 5).map((p) => ({
      name: p.name.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
      quantity: p.quantity,
    })),
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50/60 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 selection:bg-sky-200 selection:text-sky-900">
      
      {/* Background Glow Effects */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-sky-200/40 dark:bg-sky-950/20 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 dark:bg-blue-950/20 blur-[120px]" />

      {/* Header Banner Section */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500" />
        
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-sky-100/70 dark:bg-sky-900/40 border border-sky-200/60 dark:border-sky-800/50 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 backdrop-blur-md">
              <Factory className="h-4 w-4 text-sky-500" />
              <span>ระบบบริหารการผลิตไส้กรอกอีสาน</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              ภาพรวมการผลิตวันนี้ <span className="text-sky-500">.</span>
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
              ตรวจสอบยอดขาย วัตถุดิบ และรายการที่ต้องเตรียมเติมล่วงหน้า
            </p>
          </div>

          {/* Quick Status Banner */}
          <div className="rounded-2xl border border-sky-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 p-4 backdrop-blur-md min-w-[240px]">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              สถานะสต็อกรอบปัจจุบัน
            </p>
            {summary.lowStockCount > 0 ? (
              <p className="mt-1.5 flex items-center gap-2 text-base font-bold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 text-amber-500 animate-bounce" />
                ต้องตรวจเช็ก {summary.lowStockCount} รายการ
              </p>
            ) : (
              <p className="mt-1.5 flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                วัตถุดิบพร้อมใช้งานครบถ้วน
              </p>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        {/* รายได้รวม */}
        <Card className="relative overflow-hidden border-sky-100/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-sky-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              รายได้รวม
            </CardTitle>
            <div className="rounded-xl bg-sky-100/70 dark:bg-sky-900/40 p-2 text-sky-600 dark:text-sky-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-sky-600 dark:text-sky-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {summary.orderCount} ออเดอร์
            </p>
          </CardContent>
        </Card>

        {/* ต้นทุนผลิต */}
        <Card className="relative overflow-hidden border-sky-100/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-sky-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              ต้นทุนผลิต
            </CardTitle>
            <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {formatCurrency(summary.totalProductionCost)}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              {summary.batchCount} ล็อตผลิต
            </p>
          </CardContent>
        </Card>

        {/* กำไรสุทธิ */}
        <Card className="relative overflow-hidden border-sky-100/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md hover:border-sky-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              กำไรสุทธิ
            </CardTitle>
            <div className="rounded-xl bg-emerald-100/70 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className={`text-2xl md:text-3xl font-black tracking-tight ${summary.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
              {formatCurrency(summary.profit)}
            </div>
            <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">
              รายได้ - ต้นทุน
            </p>
          </CardContent>
        </Card>

        {/* ของใกล้หมด */}
        <Card className="relative overflow-hidden border-amber-200/80 dark:border-amber-900/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              ของใกล้หมด
            </CardTitle>
            <div className="rounded-xl bg-amber-100/80 dark:bg-amber-950/50 p-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-2xl md:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
              {summary.lowStockCount} <span className="text-sm font-semibold">รายการ</span>
            </div>
            <p className="mt-1 text-xs font-medium text-amber-600/80 dark:text-amber-400/80">
              ต้องสั่งวัตถุดิบเพิ่ม
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts & Operations Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* กราฟยอดขายรายวัน */}
        <Card className="border-sky-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              ยอดขายรายวัน
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              สรุปรายได้ต่อวัน (บาท)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {dailySales.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีข้อมูลการขายในขณะนี้</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailySales}>
                  <defs>
                    <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), "ยอดขาย"]} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area type="monotone" dataKey="amount" fill="url(#skyGradient)" />
                  <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: "#0ea5e9" }} activeDot={{ r: 6, fill: "#0284c7" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* สินค้าขายดี */}
        <Card className="border-sky-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              5 อันดับสินค้าขายดี
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              วัดจากจำนวนชิ้นที่จำหน่ายได้
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {topSellingProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="mb-2 h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีข้อมูลการขาย</p>
                <p className="mt-0.5 text-xs text-slate-400">รายการขายใหม่จะแสดงขึ้นที่นี่</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topSellingProducts} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" fontSize={12} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={130} 
                    fontSize={12} 
                    fontWeight={500}
                    tick={{ fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v.length > 15 ? v.slice(0, 15) + "..." : v)} 
                  />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                  <Bar dataKey="totalSold" fill="#38bdf8" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* สต็อกสินค้าคงเหลือ */}
        <Card className="border-sky-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              สัดส่วนสต็อกสินค้าคงเหลือ
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              จำนวนคงเหลือในคลัง (ชิ้น)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {stockChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Boxes className="mb-2 h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">ยังไม่มีสินค้าในระบบ</p>
                <p className="mt-0.5 text-xs text-slate-400">เริ่มสร้างสูตรไส้กรอกแรกของคุณเลย!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie 
                    data={stockChartData} 
                    dataKey="quantity" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={90} 
                    innerRadius={45}
                    paddingAngle={3}
                    label={({ name, value }) => `${name}: ${formatNumber(Number(value ?? 0), 0)}`}
                  >
                    {stockChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SKY_COLORS[index % SKY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* รายการแจ้งเตือนสต็อกต่ำ */}
        <Card className="border-amber-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 pb-4 bg-amber-50/30 dark:bg-amber-950/20">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              รายการวัตถุดิบใกล้หมด (ต้องสั่งเพิ่ม)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {lowStockAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 rounded-full bg-emerald-50 dark:bg-emerald-950/50 p-3">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200">สต็อกวัตถุดิบสมบูรณ์ดี</p>
                <p className="text-xs text-slate-400">ไม่มีรายการวัตถุดิบต่ำกว่าเกณฑ์ขั้นต่ำ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((alert, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 transition-all hover:border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {alert.type === "RAW_MATERIAL" ? (
                          <Package className="h-4 w-4 text-amber-500" />
                        ) : (
                          <Factory className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{alert.name}</span>
                      </div>
                      <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        ใกล้หมด
                      </span>
                    </div>
                    
                    <div className="mt-1">
                      <SkewerGauge 
                        value={alert.quantity} 
                        minAlert={alert.quantity} 
                        label={`คงเหลือ ${formatNumber(alert.quantity)} ${alert.unit}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}