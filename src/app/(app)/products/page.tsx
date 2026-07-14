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
import {
  api,
  ApiError,
  Product,
  ProductInput,
  RawMaterial,
  RecipeItem,
} from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
  Sparkles,
  Utensils,
  Clock,
  AlertCircle,
  Layers,
  Check,
  Loader2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductInput>({
    name: "",
    recipe: [],
    quantity: 0,
    minStockAlert: 0,
    expiryDays: 7,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  });

  const { data: materials } = useQuery({
    queryKey: ["raw-materials"],
    queryFn: () => api.rawMaterials.list(),
  });

  // ⚡ Optimization: Map lookup สำหรับวัตถุดิบ
  const materialMap = useMemo(() => {
    if (!materials) return new Map<string, RawMaterial>();
    return new Map(materials.map((m) => [m.id, m]));
  }, [materials]);

  const createMutation = useMutation({
    mutationFn: (data: ProductInput) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("เพิ่มสินค้าและสูตรเรียบร้อยแล้ว");
      resetForm();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductInput> }) =>
      api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("อัปเดตข้อมูลสินค้าสำเร็จ");
      resetForm();
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("ลบรายการสินค้าเรียบร้อย");
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm({
      name: "",
      recipe: [],
      quantity: 0,
      minStockAlert: 0,
      expiryDays: 7,
    });
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      quantity: product.quantity,
      recipe: product.recipe.map((r) => ({
        rawMaterialId: r.rawMaterialId,
        quantityPerUnit: r.quantityPerUnit,
      })),
      minStockAlert: product.minStockAlert,
      expiryDays: product.expiryDays,
    });
    setShowForm(true);
  };

  const addRecipeItem = () => {
    if (!materials?.length) {
      toast.error("กรุณาเพิ่มรายการวัตถุดิบในระบบก่อนสร้างสูตร");
      return;
    }
    setForm((prev) => ({
      ...prev,
      recipe: [
        ...prev.recipe,
        { rawMaterialId: materials[0].id, quantityPerUnit: 0.1 },
      ],
    }));
  };

  const updateRecipeItem = (
    index: number,
    field: keyof RecipeItem,
    value: string | number
  ) => {
    setForm((prev) => {
      const recipe = [...prev.recipe];
      recipe[index] = { ...recipe[index], [field]: value };
      return { ...prev, recipe };
    });
  };

  const removeRecipeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      recipe: prev.recipe.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.recipe.length === 0) {
      toast.error("กรุณาเพิ่มสูตรวัตถุดิบอย่างน้อย 1 รายการ");
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-4 md:p-6 text-slate-800">
      {/* Header Section */}
      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-bold text-blue-700">
            <Package className="h-4 w-4 text-blue-600" />
            <span>คลังสินค้าและมาตรฐานสูตร</span>
          </div>
          <h1 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">
            สินค้าสำเร็จรูป & สูตรการผลิต
          </h1>
          <p className="mt-1 text-base text-slate-500">
            ตั้งค่ารายการไส้กรอก กำหนดสูตรผสมวัตถุดิบ (BOM) และจุดเตือนสต็อก
          </p>
        </div>

        {!showForm && (
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl px-6 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
          >
            <Plus className="mr-2 h-5 w-5 stroke-[2.5]" />
            เพิ่มสินค้าใหม่
          </Button>
        )}
      </div>

      {/* Form Card (Create / Edit) */}
      {showForm && (
        <Card className="border border-blue-200 bg-white shadow-xl shadow-blue-500/5 rounded-3xl overflow-hidden animate-in fade-in duration-200">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100 p-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-xl font-bold text-slate-900">
                {editing ? "แก้ไขรายการสินค้าและสูตร" : "ลงทะเบียนสินค้าใหม่"}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetForm}
              className="rounded-full hover:bg-blue-100/50 text-slate-500"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Info Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold text-slate-700">
                    ชื่อสินค้า / ประเภทไส้กรอก <span className="text-blue-600">*</span>
                  </Label>
                  <Input
                    placeholder="เช่น ไส้กรอกอีสานหมูวุ้นเส้น, ไส้กรอกเผ็ด..."
                    className="h-12 text-base rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {!editing && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">
                      จำนวนยอดยกมาเริ่มต้น (ชิ้น)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      className="h-12 text-base rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                      value={form.quantity || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          quantity: e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    แจ้งเตือนเมื่อสต็อกต่ำกว่า (ชิ้น)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    className="h-12 text-base rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                    value={form.minStockAlert || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        minStockAlert: e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    อายุการเก็บรักษา (วัน)
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      className="h-12 text-base rounded-xl border-slate-200 focus-visible:ring-blue-500 focus-visible:border-blue-500 pr-12"
                      value={form.expiryDays || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          expiryDays: e.target.value === "" ? 0 : Number(e.target.value),
                        })
                      }
                      required
                    />
                    <span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">
                      วัน
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipe Builder Section */}
              <div className="space-y-3 rounded-2xl border border-blue-100 bg-sky-50/50 p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-bold text-slate-800">
                      สูตรส่วนประกอบวัตถุดิบ (คำนวณต่อไส้กรอก 1 ชิ้น)
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRecipeItem}
                    className="border-blue-200 bg-white font-bold rounded-xl text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="mr-1 h-4 w-4 stroke-[2.5] text-blue-600" />
                    เพิ่มวัตถุดิบในสูตร
                  </Button>
                </div>

                {form.recipe.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-blue-200 bg-white p-6 text-center text-slate-400 font-medium">
                    ยังไม่มีวัตถุดิบในสูตร กดปุ่ม &quot;เพิ่มวัตถุดิบในสูตร&quot; เพื่อเริ่มต้นระบุส่วนผสม
                  </div>
                ) : (
                  <div className="space-y-2">
                    {form.recipe.map((item, index) => {
                      const selectedMat = materialMap.get(item.rawMaterialId);
                      return (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center rounded-xl bg-white p-3 border border-slate-200 shadow-sm"
                        >
                          <div className="flex-1">
                            <select
                              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                              value={item.rawMaterialId}
                              onChange={(e) =>
                                updateRecipeItem(
                                  index,
                                  "rawMaterialId",
                                  e.target.value
                                )
                              }
                            >
                              {materials?.map((m: RawMaterial) => (
                                <option key={m.id} value={m.id}>
                                  🥩 {m.name} ({m.unit})
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                              ใช้จำนวน:
                            </span>
                            <div className="relative w-36">
                              <Input
                                type="number"
                                step="0.001"
                                min="0.001"
                                className="h-11 font-bold text-slate-800 border-slate-200 rounded-xl pr-10 focus-visible:ring-blue-500"
                                value={item.quantityPerUnit || ""}
                                onChange={(e) =>
                                  updateRecipeItem(
                                    index,
                                    "quantityPerUnit",
                                    e.target.value === "" ? 0 : Number(e.target.value)
                                  )
                                }
                              />
                              <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                                {selectedMat?.unit ?? ""}
                              </span>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRecipeItem(index)}
                              className="h-11 w-11 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="h-11 border-slate-200 rounded-xl font-bold px-6 hover:bg-slate-100 text-slate-600"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-8 shadow-md shadow-blue-500/10 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-5 w-5 stroke-[2.5]" />
                  )}
                  {editing ? "บันทึกการแก้ไข" : "ยืนยันเพิ่มสินค้า"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Display Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : !products?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-blue-200 rounded-3xl bg-white p-8 shadow-sm">
          <div className="rounded-full bg-blue-50 p-5 mb-4 text-blue-600">
            <Package className="h-10 w-10" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">ยังไม่มีสินค้าในระบบ</h3>
          <p className="mt-1 text-base text-slate-500 mb-5">
            เริ่มต้นเพิ่มสินค้าไส้กรอกและกำหนดสูตรวัตถุดิบแรกของคุณเลย
          </p>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl px-6"
          >
            <Plus className="mr-2 h-4 w-4 stroke-[2.5]" />
            เพิ่มสินค้า
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {products?.map((p) => {
            const isLowStock = p.quantity <= p.minStockAlert;
            return (
              <Card
                key={p.id}
                className="border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-5 flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">
                      🍢 {p.name}
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-blue-500" /> หมดอายุใน {p.expiryDays} วัน
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    <SkewerGauge
                      value={p.quantity}
                      minAlert={p.minStockAlert}
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Stock Quantity Highlight */}
                  <div className="flex items-center justify-between rounded-2xl bg-blue-50/50 border border-blue-100 p-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        คงเหลือในคลัง
                      </p>
                      <p className={`text-2xl font-black ${isLowStock ? "text-amber-600" : "text-blue-700"}`}>
                        {formatNumber(p.quantity, 0)} <span className="text-sm font-bold text-slate-500">ชิ้น</span>
                      </p>
                    </div>

                    {isLowStock && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                        <AlertCircle className="h-3.5 w-3.5" /> สต็อกต่ำกว่าเกณฑ์
                      </span>
                    )}
                  </div>

                  {/* Recipe BOM Chips */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-blue-600" /> สูตรวัตถุดิบ / 1 ชิ้น:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.recipe.map((r, i) => {
                        const mat = materialMap.get(r.rawMaterialId);
                        return (
                          <span
                            key={i}
                            className="text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/60"
                          >
                            {r.rawMaterialName ?? mat?.name ?? r.rawMaterialId}:{" "}
                            <span className="font-bold text-blue-700">{r.quantityPerUnit}</span> {r.unit ?? mat?.unit}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(p)}
                      className="flex-1 h-10 border-slate-200 font-bold text-slate-700 rounded-xl hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                    >
                      <Pencil className="mr-1.5 h-4 w-4 text-blue-600" />
                      แก้ไขสูตร
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`ยืนยันการลบรายการสินค้า "${p.name}"?`))
                          deleteMutation.mutate(p.id);
                      }}
                      className="h-10 border-slate-200 font-bold text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}