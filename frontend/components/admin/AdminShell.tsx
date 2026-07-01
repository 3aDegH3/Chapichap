"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { AdminPermission, AdminUser, getAdminDashboard } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "داشبورد", shortLabel: "دا", permission: "dashboard" },
  { href: "/admin/orders", label: "سفارش‌ها", shortLabel: "سف", permission: "orders" },
  { href: "/admin/products", label: "محصولات", shortLabel: "مح", permission: "products" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", shortLabel: "دس", permission: "categories" },
  { href: "/admin/design-requests", label: "درخواست‌های طراحی", shortLabel: "طر", permission: "design_requests" },
  { href: "/admin/contact-messages", label: "پیام‌های تماس", shortLabel: "پی", permission: "contact_messages" },
  { href: "/admin/customer-files", label: "فایل‌های مشتریان", shortLabel: "فا", permission: "customer_files" },
  { href: "/admin/customers", label: "مشتریان", shortLabel: "مش", permission: "customers" },
  { href: "/admin/activity-logs", label: "گزارش فعالیت‌ها", shortLabel: "گف", permission: "activity_logs" },
  { href: "/admin/settings", label: "تنظیمات", shortLabel: "تن", permission: "settings" },
] satisfies Array<{
  href: string;
  label: string;
  shortLabel: string;
  permission: AdminPermission;
}>;

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminShell({
  adminUser,
  children,
}: {
  adminUser: AdminUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => (await getAdminDashboard()).data.data,
    refetchInterval: 60_000,
  });

  const allowedPermissions = new Set(adminUser.admin_permissions);
  const visibleNavItems = navItems.filter((item) => allowedPermissions.has(item.permission));
  const currentItem = navItems.find((item) => isActive(pathname, item.href));
  const isDetailPage = Boolean(currentItem && pathname !== currentItem.href);
  const newOrdersCount = dashboardQuery.data?.stats.new_orders || 0;

  const sidebar = (
    <aside className="flex h-full flex-col border-l border-[#D5DAE1] bg-[#111827] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <Link href="/admin" className="block">
            <span className="block text-lg font-black">چاپی چاپ</span>
            <span className="mt-1 block text-xs font-bold text-[#9CA3AF]">پنل مدیریت</span>
          </Link>
          <button type="button" onClick={() => setIsDrawerOpen(false)} className="h-8 rounded-md border border-white/15 px-2 text-xs font-black text-[#D1D5DB] lg:hidden">
            بستن
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleNavItems.map((item) => {
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsDrawerOpen(false)}
              className={cn(
                "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-black transition",
                active
                  ? "bg-[#CFA15F] text-[#111827]"
                  : "text-[#D1D5DB] hover:bg-white/8 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px]",
                  active ? "bg-[#111827] text-white" : "bg-white/10 text-[#D1D5DB]"
                )}
              >
                {item.shortLabel}
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-md bg-white/8 p-3">
          <p className="truncate text-sm font-black">{adminUser.full_name}</p>
          <p className="mt-1 truncate text-xs font-bold text-[#9CA3AF]">{adminUser.email}</p>
          <p className="mt-2 inline-flex rounded-md bg-white/10 px-2 py-1 text-[11px] font-black text-[#D1D5DB]">
            {adminUser.admin_role_label}
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      <div className="fixed inset-y-0 right-0 z-40 hidden w-[280px] lg:block">{sidebar}</div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منوی مدیریت"
            className="absolute inset-0 bg-[#111827]/55"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative ml-auto h-full w-[min(84vw,300px)]">{sidebar}</div>
        </div>
      )}

      <div className="min-w-0 lg:pr-[280px]">
        <header className="sticky top-0 z-30 border-b border-[#D5DAE1] bg-white/92 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#D5DAE1] bg-white text-[#1F2933] transition hover:bg-[#EEF1F4] lg:hidden"
                aria-label="باز کردن منوی مدیریت"
              >
                <span className="grid gap-1">
                  <span className="h-0.5 w-5 rounded-full bg-current" />
                  <span className="h-0.5 w-5 rounded-full bg-current" />
                  <span className="h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>

              <div className="min-w-0">
                <p className="text-xs font-black text-[#697586]">پنل مدیریت</p>
                <h1 className="truncate text-lg font-black text-[#1F2933]">
                  {currentItem?.label || "مدیریت"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden min-w-0 px-2 text-left xl:block">
                <p className="max-w-40 truncate text-xs font-black text-[#1F2933]">{adminUser.full_name}</p>
                <p className="mt-1 text-[11px] font-bold text-[#697586]">{adminUser.admin_role_label}</p>
              </div>
              {allowedPermissions.has("orders") && (
                <Link
                  href="/admin/orders"
                  className={cn(
                    "relative inline-flex h-10 items-center justify-center rounded-md border px-3 text-xs font-black transition",
                    newOrdersCount > 0
                      ? "border-[#E4B260] bg-[#FFFBEB] text-[#92400E]"
                      : "border-[#D5DAE1] bg-white text-[#697586]"
                  )}
                  aria-label={`${newOrdersCount} سفارش جدید`}
                >
                  <span className="hidden md:inline">سفارش جدید</span>
                  <span className="md:mr-2">{new Intl.NumberFormat("fa-IR").format(newOrdersCount)}</span>
                </Link>
              )}
              <Link
                href="/"
                className="hidden h-10 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4] sm:inline-flex"
              >
                مشاهده سایت
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex h-10 items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827]"
              >
                خروج
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 sm:px-6 lg:px-8">
          <nav aria-label="مسیر صفحه" className="mb-4 flex min-h-6 items-center gap-2 overflow-hidden text-xs font-bold text-[#697586]">
            <Link href="/admin" className="shrink-0 transition hover:text-[#1F2933]">داشبورد</Link>
            {currentItem?.href !== "/admin" && (
              <>
                <span aria-hidden="true">/</span>
                {isDetailPage ? (
                  <Link href={currentItem?.href || "/admin"} className="shrink-0 transition hover:text-[#1F2933]">{currentItem?.label}</Link>
                ) : (
                  <span className="truncate text-[#364152]">{currentItem?.label || "مدیریت"}</span>
                )}
              </>
            )}
            {isDetailPage && (
              <>
                <span aria-hidden="true">/</span>
                <span className="truncate text-[#364152]">جزئیات</span>
              </>
            )}
          </nav>
          {children}
        </main>
      </div>
    </div>
  );
}
