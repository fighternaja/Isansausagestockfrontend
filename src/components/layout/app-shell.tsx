"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { api, UserRole } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import {
  Beef,
  Bell,
  Factory,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  X,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";

const navItems: {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}[] = [
  {
    href: "/dashboard",
    label: "แดชบอร์ด",
    icon: LayoutDashboard,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/materials",
    label: "วัตถุดิบ",
    icon: Beef,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/products",
    label: "สินค้า",
    icon: Package,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/production",
    label: "การผลิต",
    icon: Factory,
    roles: ["ADMIN", "STAFF"],
  },
  {
    href: "/audit-logs",
    label: "Audit Log",
    icon: FileText,
    roles: ["ADMIN"],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: notifCount } = useQuery({
    queryKey: ["notification-count"],
    queryFn: () => api.dashboard.notificationCount(),
    refetchInterval: 60000,
    enabled: !!user,
  });

  const filteredNav = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const roleLabels: Record<UserRole, string> = {
    ADMIN: "ผู้ดูแลระบบ",
    STAFF: "พนักงานนับสต็อก/ผลิต",
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-sky-200 selection:text-sky-900">
      
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sky-100/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 flex flex-col justify-between shadow-sm",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Sidebar Header / Logo */}
          <div className="relative flex h-20 items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100/80 dark:bg-sky-950/50 border border-sky-200/50 text-sky-600 dark:text-sky-400 shadow-sm">
                <Logo className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  สต็อกอีสาน <span className="text-sky-500">.</span>
                </h1>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  ระบบจัดการการผลิต
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-400 hover:text-slate-600 rounded-xl"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 p-4">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                    active
                      ? "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 shadow-sm shadow-sky-100/50"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {/* Left Indicator Ribbon */}
                  {active && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-sky-500" />
                  )}
                  <Icon className={cn("h-4 w-4", active ? "text-sky-500" : "text-slate-400")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card & Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-sky-100/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3 backdrop-blur-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100/80 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    user?.role === "ADMIN" ? "bg-sky-500" : "bg-emerald-500"
                  )}
                />
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                  {user && roleLabels[user.role]}
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-950/30 dark:hover:border-rose-900/50 transition-all text-xs font-semibold h-9"
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sky-100/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 px-4 md:px-8 backdrop-blur-xl transition-all">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl text-slate-500 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-sky-600 transition-colors"
              >
                <Bell className="h-5 w-5" />
                {(notifCount?.count ?? 0) > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
                    {notifCount!.count > 9 ? "9+" : notifCount!.count}
                  </span>
                )}
              </Button>
            </Link>

            <ThemeToggle />
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}