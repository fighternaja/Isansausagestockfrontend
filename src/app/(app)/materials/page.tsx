"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { SkewerGauge } from "@/components/ui/skewer-gauge";
import { api, ApiError, RawMaterial, RawMaterialInput } from "@/lib/api";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Beef, Pencil, Plus, Trash2, Layers, AlertCircle, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function MaterialsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [form, setForm] = useState<RawMaterialInput>({
    name: "",
    unit: "กก.",
    quantity: 0,
    minStockAlert: 0,
    costPerUnit: 0,
  });

  const { data: materials, isLoading } = useQuery({
    queryKey: ["raw-materials"],
    queryFn: () => api.rawMaterials.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: RawMaterialInput) => api.rawMaterials.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      toast.success("เพิ่มวัตถุดิบสำเร็จ");
      resetForm();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RawMaterialInput> }) =>
      api.rawMaterials.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      toast.success("อัปเดตวัตถุดิบสำเร็จ");
      resetForm();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.rawMaterials.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
      toast.success("ลบวัตถุดิบสำเร็จ");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", unit: "กก.", quantity: 0, minStockAlert: 0, costPerUnit: 0 });
  };

  const handleEdit = (material: RawMaterial) => {
    setEditing(material);
    setForm({
      name: material.name,
      unit: material.unit,
      minStockAlert: material.minStockAlert,
      costPerUnit: material.costPerUnit,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
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
              <Layers className="h-4 w-4 text-sky-500" />
              <span>วัตถุดิบในโรงงาน</span>
            </div>
            <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              จัดการวัตถุดิบ <span className="text-sky-500">.</span>
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              ติดตามปริมาณและจุดเตือนให้ตรงกับการผลิตไส้กรอกทุกวัน
            </p>
          </div>

          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 active:scale-[0.98] transition-all rounded-xl h-11 px-5"
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มวัตถุดิบ
          </Button>
        </div>
      </div>

      {/* Form Card */}
      {showForm && (
        <Card className="relative overflow-hidden border-sky-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-md transition-all animate-in fade-in-50 slide-in-from-top-2">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-blue-500" />
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editing ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบใหม่"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ชื่อวัตถุดิบ</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="เช่น หมูบดเกรด A"
                  required
                  className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">หน่วย</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="เช่น กก., กรัม, ชิ้น"
                  required
                  className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                />
              </div>

              {!editing && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">จำนวนเริ่มต้น</Label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                    className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">แจ้งเตือนเมื่อต่ำกว่า</Label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={form.minStockAlert}
                  onChange={(e) =>
                    setForm({ ...form, minStockAlert: Number(e.target.value) })
                  }
                  required
                  className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ต้นทุนต่อหน่วย (บาท)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.costPerUnit}
                  onChange={(e) =>
                    setForm({ ...form, costPerUnit: Number(e.target.value) })
                  }
                  required
                  className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2 md:col-span-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 active:scale-[0.99] transition-all rounded-xl"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      กำลังบันทึก...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      {editing ? "บันทึกข้อมูล" : "เพิ่มวัตถุดิบ"}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-slate-200/80 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      ) : !materials?.length ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-sky-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="rounded-2xl bg-sky-100/70 dark:bg-sky-950/50 p-4 mb-4 text-sky-600 dark:text-sky-400">
            <Beef className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">ยังไม่มีวัตถุดิบในระบบ</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-sm">
            เริ่มเพิ่มวัตถุดิบตัวแรกของคุณเพื่อใช้ในการคำนวณการผลิตไส้กรอกอีสาน!
          </p>
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-500/20 rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มวัตถุดิบ
          </Button>
        </div>
      ) : (
        /* Data Table */
        <div className="rounded-3xl border border-sky-100/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-sm backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-sky-50/50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400">
                  <th className="p-4 text-left font-semibold">ชื่อวัตถุดิบ</th>
                  <th className="p-4 text-right font-semibold">คงเหลือ</th>
                  <th className="p-4 text-right font-semibold">จุดแจ้งเตือน</th>
                  <th className="p-4 text-right font-semibold">ต้นทุน / หน่วย</th>
                  <th className="p-4 text-center font-semibold">สถานะสต็อก</th>
                  <th className="p-4 text-right font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {materials?.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-sky-50/30 dark:hover:bg-slate-800/40"
                  >
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {m.name}
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                      {formatNumber(m.quantity)} <span className="text-xs text-slate-400">{m.unit}</span>
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {formatNumber(m.minStockAlert)} <span className="text-xs text-slate-400">{m.unit}</span>
                    </td>
                    <td className="p-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(m.costPerUnit)}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <SkewerGauge
                          value={m.quantity}
                          minAlert={m.minStockAlert}
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(m)}
                          className="h-8 w-8 text-slate-500 hover:text-sky-600 hover:bg-sky-100/50 dark:hover:bg-sky-950/50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`ยืนยันการลบ "${m.name}"?`)) {
                              deleteMutation.mutate(m.id);
                            }
                          }}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}