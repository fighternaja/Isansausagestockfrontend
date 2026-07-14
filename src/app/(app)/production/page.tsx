"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SkewerGauge } from "@/components/ui/skewer-gauge";
import { api, ApiError, ProductionPreview } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Factory,
  FileText,
  Plus,
  Minus,
  Calculator,
  CheckCircle2,
  PackageCheck,
  History,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductionPage() {
  const queryClient = useQueryClient();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(10);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  });

  const { data: batches, isLoading } = useQuery({
    queryKey: ["production-batches"],
    queryFn: () => api.production.list(),
  });

  const {
    data: preview,
    refetch: refetchPreview,
    isFetching: previewLoading,
  } = useQuery({
    queryKey: ["production-preview", productId, quantity],
    queryFn: () => api.production.preview(productId, quantity),
    enabled: !!productId && quantity > 0,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.production.create({ productId, quantityProduced: quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-batches"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      toast.success("บันทึกการผลิตสำเร็จเรียบร้อย!");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handlePreview = () => {
    if (!productId) {
      toast.error("กรุณาเลือกไส้กรอกที่ต้องการผลิตก่อนครับ");
      return;
    }
    refetchPreview();
  };

  const handleQuantityAdjust = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="space-y-6 p-4 md:p-8 bg-slate-50/60 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 selection:bg-sky-200 selection:text-sky-900">
      
      {/* Soft Sky Background Glow */}
      <div className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-sky-200/40 dark:bg-sky-950/20 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-100/50 dark:bg-blue-950/20 blur-[120px]" />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-6 md:p-8 backdrop-blur-xl shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-300 via-sky-500 to-blue-400" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-sky-100/70 dark:bg-sky-900/40 border border-sky-200/60 dark:border-sky-800/50 px-3.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 backdrop-blur-md">
              <Factory className="h-4 w-4 text-sky-500" />
              <span>ระบบวางแผนและบันทึกการผลิต</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              บันทึกล็อตการผลิตไส้กรอก <span className="text-sky-500">.</span>
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              คำนวณวัตถุดิบและต้นทุนแบบเรียลไทม์ ตรวจสอบความพร้อมของคลังก่อนเริ่มเดินเครื่อง
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="relative overflow-hidden border-sky-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm rounded-3xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 p-6">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <Sparkles className="h-5 w-5 text-sky-500" />
            ตั้งค่าล็อตการผลิตใหม่
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
            เลือกประเภทไส้กรอกและระบุจำนวนที่ต้องการ ระบบจะตรวจสอบวัตถุดิบในสต็อกให้อัตโนมัติ
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Controls Grid */}
          <div className="grid gap-6 md:grid-cols-12 items-end">
            
            {/* 1. Select Product */}
            <div className="space-y-2 md:col-span-5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white">1</span>
                เลือกประเภทไส้กรอก
              </Label>
              <select
                className="flex h-12 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-4 text-sm font-semibold text-slate-800 dark:text-slate-200 transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 focus:outline-none shadow-sm cursor-pointer"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                <option value="">-- แตะเพื่อเลือกสินค้า --</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    🍢 {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Interactive Quantity Stepper */}
            <div className="space-y-2 md:col-span-4">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white">2</span>
                จำนวนที่ต้องการผลิต (ชิ้น)
              </Label>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuantityAdjust(-10)}
                  className="h-12 w-11 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  title="-10"
                >
                  -10
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuantityAdjust(-1)}
                  className="h-12 w-10 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  className="h-12 text-center text-lg font-black text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuantityAdjust(1)}
                  className="h-12 w-10 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleQuantityAdjust(10)}
                  className="h-12 w-11 border-slate-200 dark:border-slate-800 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                  title="+10"
                >
                  +10
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 md:col-span-3">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={previewLoading || !productId}
                className="h-12 flex-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Calculator className="mr-2 h-4 w-4 text-slate-400" />
                คำนวณ
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  !preview?.allSufficient || createMutation.isPending || !productId
                }
                className="h-12 flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 active:scale-[0.98] transition-all disabled:bg-slate-300 dark:disabled:bg-slate-800"
              >
                {createMutation.isPending ? (
                  "กำลังบันทึก..."
                ) : (
                  <>
                    <PackageCheck className="mr-2 h-4 w-4" />
                    ยืนยันการผลิต
                  </>
                )}
              </Button>
            </div>

          </div>

          {/* Quick Add Presets */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ทางลัดเพิ่มจำนวน:</span>
            {[50, 100, 200, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuantity(preset)}
                className="rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 px-2.5 py-1 text-xs font-semibold text-sky-600 dark:text-sky-300 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-all"
              >
                +{preset} ชิ้น
              </button>
            ))}
          </div>

          {/* Preview Panel Section */}
          {preview && <PreviewPanel preview={preview} />}
        </CardContent>
      </Card>

      {/* Production History Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="h-5 w-5 text-sky-500" />
            ประวัติการผลิตล่าสุด
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : !batches?.data?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-3xl border border-dashed border-sky-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <div className="rounded-2xl bg-sky-100/70 dark:bg-sky-950/50 p-4 mb-3 text-sky-600 dark:text-sky-400">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">ยังไม่มีรายการบันทึกการผลิต</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">เลือกสินค้าและสั่งผลิตที่ฟอร์มด้านบนเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-sky-100/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-sm backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="p-4">วันที่ผลิต</th>
                    <th className="p-4">ชื่อสินค้า</th>
                    <th className="p-4 text-right">จำนวนผลิต</th>
                    <th className="p-4 text-right">ต้นทุนรวม</th>
                    <th className="p-4 text-right">ต้นทุน/ชิ้น</th>
                    <th className="p-4">ผู้บันทึก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {batches?.data.map((b) => (
                    <tr key={b.id} className="hover:bg-sky-50/30 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                        {new Date(b.producedAt).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {b.product.name}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatNumber(b.quantityProduced, 0)}{" "}
                        <span className="text-xs font-normal text-slate-400">ชิ้น</span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-sky-600 dark:text-sky-400">
                        {formatCurrency(b.cost)}
                      </td>
                      <td className="p-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatCurrency(
                          b.costPerUnit ?? b.cost / b.quantityProduced
                        )}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {b.user.name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

{/* Preview Panel Component */}
function PreviewPanel({ preview }: { preview: ProductionPreview }) {
  return (
    <div className="rounded-2xl border border-sky-100 dark:border-slate-800 bg-sky-50/30 dark:bg-slate-950/30 p-5 space-y-4 mt-4">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>รายการวัตถุดิบที่ต้องใช้:</span>
          <span className="text-sky-600 dark:text-sky-400 font-extrabold">
            {preview.productName}
          </span>
          <span className="rounded-full bg-slate-800 dark:bg-slate-200 px-2.5 py-0.5 text-xs font-bold text-white dark:text-slate-900">
            x {formatNumber(preview.quantityProduced, 0)} ชิ้น
          </span>
        </h3>

        {/* Readiness Status Badge */}
        {preview.allSufficient ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <CheckCircle2 className="h-4 w-4" />
            วัตถุดิบพร้อมผลิต
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 dark:bg-rose-950/50 px-3.5 py-1 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
            <AlertTriangle className="h-4 w-4" />
            วัตถุดิบไม่เพียงพอ
          </span>
        )}
      </div>

      {/* Material Requirements List */}
      <div className="grid gap-3 md:grid-cols-2">
        {preview.requirements.map((r) => (
          <div
            key={r.rawMaterialId}
            className={`flex flex-col justify-between gap-3 rounded-2xl p-4 border shadow-sm transition-all bg-white dark:bg-slate-900 ${
              r.sufficient
                ? "border-slate-100 dark:border-slate-800"
                : "border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {r.rawMaterialName}
              </span>
              <SkewerGauge
                value={r.quantityAvailable}
                minAlert={r.quantityRequired}
                label={r.sufficient ? "วัตถุดิบพอ" : "ขาดวัตถุดิบ"}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5 text-slate-600 dark:text-slate-300">
              <div>
                <p className="text-[10px] text-slate-400 font-medium">ต้องใช้</p>
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                  {formatNumber(r.quantityRequired)} <span className="text-[10px] font-normal text-slate-400">{r.unit}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">คงเหลือในคลัง</p>
                <p className={`text-sm font-extrabold ${r.sufficient ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatNumber(r.quantityAvailable)} <span className="text-[10px] font-normal text-slate-400">{r.unit}</span>
                </p>
              </div>
            </div>

            {!r.sufficient && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-100 dark:border-rose-900/50">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  ขาดอีก {formatNumber(r.quantityRequired - r.quantityAvailable)} {r.unit} (ต้องเบิกเพิ่ม)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cost Calculation Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ประมาณการต้นทุนรวม</p>
            <p className="text-xl font-extrabold text-sky-600 dark:text-sky-400">
              {formatCurrency(preview.totalCost)}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ต้นทุนเฉลี่ย / ชิ้น</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              {formatCurrency(preview.costPerUnit)}
            </p>
          </div>
        </div>

        {!preview.allSufficient && (
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            ไม่สามารถกดสั่งผลิตได้เนื่องจากวัตถุดิบไม่พอ
          </p>
        )}
      </div>
    </div>
  );
}