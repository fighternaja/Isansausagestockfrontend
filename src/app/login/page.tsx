"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/components/providers/auth-provider";
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
import { Logo } from "@/components/ui/logo";
import { ApiError } from "@/lib/api";
import {
  AlertTriangle,
  BadgeCheck,
  Eye,
  EyeOff,
  Factory,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user) {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      toast.success("เข้าสู่ระบบสำเร็จ");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "เข้าสู่ระบบไม่สำเร็จ";
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง — ตรวจสอบข้อมูลและลองใหม่อีกครั้ง");
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50/60 dark:bg-slate-950 p-4 md:p-8 selection:bg-sky-200 selection:text-sky-900">
      {/* Soft Sky Blue Gradient Background Orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-sky-200/50 dark:bg-sky-900/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-blue-100/60 dark:bg-blue-900/20 blur-[130px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]" />

      {/* Theme Toggle Top Right */}
      <div className="absolute right-6 top-6 z-20">
        <div className="rounded-full bg-white/80 dark:bg-slate-900/80 p-1 backdrop-blur-md shadow-sm border border-slate-200/80 dark:border-slate-800">
          <ThemeToggle />
        </div>
      </div>

      <div className="relative z-10 grid w-full max-w-5xl gap-8 lg:grid-cols-12 items-center">
        {/* Left Section: Branding & Info */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Logo */}
          <div className="inline-flex items-center gap-3 rounded-2xl bg-sky-100/70 dark:bg-sky-900/30 border border-sky-200/60 dark:border-sky-800/50 px-4 py-2 backdrop-blur-md">
            <Logo className="h-6 w-6 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-700 dark:text-sky-300">
              Isaan Sausage Studio
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              สต็อกอีสาน <span className="text-sky-500">.</span>
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              ระบบบริหารจัดการคลังสินค้าและสายการผลิตไส้กรอกอีสานยุคใหม่
              สดใส คลีน ใช้งานง่าย ไร้กังวล
            </p>
          </div>

          {/* Bento-style Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-lg hover:shadow-sky-500/5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-50 dark:bg-sky-950/80 p-2.5 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    ติดตามทุกล็อตผลิต
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    วัตถุดิบถึงสินค้าสำเร็จ
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-sky-300 dark:hover:border-sky-700 hover:shadow-lg hover:shadow-sky-500/5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-teal-50 dark:bg-teal-950/80 p-2.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                  <BadgeCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    บันทึกการผลิตทันที
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    คำนวณวัตถุดิบแม่นยำ
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Special Feature Highlight */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-200/70 dark:border-sky-800/50 bg-gradient-to-r from-sky-50/80 via-white/80 to-sky-50/30 dark:from-sky-950/30 dark:via-slate-900/50 dark:to-slate-900/30 p-4 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-sky-100 dark:bg-sky-900/50 p-2 text-sky-600 dark:text-sky-400 mt-0.5">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                    Signature Cue
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
                </div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  เห็นสถานะสต็อกแบบไม้เสียบไส้กรอก
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  สื่อสารสถานะสินค้าผ่าน Visual สไตล์อีสาน
                  ช่วยให้ทีมโรงงานรับรู้ความเสี่ยงล่วงหน้าได้รวดเร็วขึ้น
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Login Form */}
        <div className="lg:col-span-5">
          <Card className="relative overflow-hidden border-sky-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl shadow-sky-500/5 dark:shadow-none">
            {/* Top Sky Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-300 via-sky-500 to-blue-400" />

            <CardHeader className="space-y-1 pt-6 pb-4 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                เข้าสู่ระบบ
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                กรอกข้อมูลด้านล่างเพื่อเข้าสู่แดชบอร์ดงานของคุณ
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    อีเมล
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@isansausage.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    รหัสผ่าน
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pr-10 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm transition-all focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 dark:bg-red-950/30 dark:border-red-900/50 p-3 text-xs text-red-600 dark:text-red-400 animate-in fade-in-50 slide-in-from-top-1">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <p className="leading-relaxed">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 font-medium bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 active:scale-[0.99] transition-all"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      กำลังเข้าสู่ระบบ...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      เข้าสู่ระบบ <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Demo Accounts Panel */}
              <div className="rounded-xl border border-sky-100 dark:border-slate-800 bg-sky-50/40 dark:bg-slate-950/40 p-3.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 dark:text-sky-300">
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-500" />
                  <span>สิทธิ์การทดสอบระบบ (คลิกเพื่อทดลองใช้)</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      fillDemoAccount("admin@isansausage.com", "admin123456")
                    }
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-sky-100/60 dark:hover:bg-sky-900/30 border border-slate-200/60 dark:border-slate-800 hover:border-sky-300 transition-all text-left group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-300">
                      ผู้ดูแลระบบ
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      admin@isansausage.com
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      fillDemoAccount("staff@isansausage.com", "staff123456")
                    }
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 hover:bg-sky-100/60 dark:hover:bg-sky-900/30 border border-slate-200/60 dark:border-slate-800 hover:border-sky-300 transition-all text-left group"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-sky-700 dark:group-hover:text-sky-300">
                      พนักงาน
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                      staff@isansausage.com
                    </span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}