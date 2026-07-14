"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // ⚡ ใช้ replace แทน push เพื่อป้องกัน Navigation Loop เมื่อกด Back ในเบราว์เซอร์
      router.replace("/login");
    }
  }, [user, loading, router]);

  // แสดง Skeleton ระหว่างตรวจสอบสถานะการเข้าสู่ระบบ
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="space-y-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/2 bg-slate-200" />
              <Skeleton className="h-3 w-1/3 bg-slate-200" />
            </div>
          </div>
          <Skeleton className="h-8 w-full rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-3/4 bg-slate-200" />
          <Skeleton className="h-4 w-1/2 bg-slate-200" />
        </div>
      </div>
    );
  }

  // ป้องกันการ Render สั้นๆ (Flash of Content) ระหว่างรอสั่ง Redirect
  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}