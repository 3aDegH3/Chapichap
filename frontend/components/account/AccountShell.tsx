"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { getNotificationSummary } from "@/lib/account-api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "داشبورد" },
  { href: "/account/profile", label: "پروفایل" },
  { href: "/account/security", label: "امنیت" },
  { href: "/account/addresses", label: "آدرس‌ها" },
  { href: "/account/orders", label: "سفارش‌ها" },
  { href: "/account/design-requests", label: "درخواست‌های طراحی" },
  { href: "/account/reviews", label: "نظرات من" },
  { href: "/account/offers", label: "پیشنهادها" },
  { href: "/account/tickets", label: "پشتیبانی" },
  { href: "/account/notifications", label: "اعلان‌ها" },
];

export default function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;

    async function loadNotificationSummary() {
      try {
        const data = await getNotificationSummary();
        if (mounted) setUnreadNotificationsCount(data.unread_count);
      } catch {
        if (mounted) setUnreadNotificationsCount(0);
      }
    }

    void loadNotificationSummary();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, pathname]);

  if (isLoading || !user) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-[#FAFAF8] px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <div className="h-96 animate-pulse rounded-2xl border border-[#E3DED5] bg-white" />
          <div className="h-[520px] animate-pulse rounded-2xl border border-[#E3DED5] bg-white" />
        </div>
      </main>
    );
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "کاربر چاپی‌چاپ";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FAFAF8]">
      <section className="border-b border-[#E3DED5] bg-[#F2EEE6]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[#B2894C]">حساب کاربری</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-[#333230]">{displayName}</h1>
              <p className="mt-2 text-sm font-bold text-[#77736D]">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill active={user.email_verified} label={user.email_verified ? "ایمیل تایید شده" : "ایمیل تایید نشده"} />
              <StatusPill active={user.phone_verified} label={user.phone_verified ? "موبایل تایید شده" : "موبایل تایید نشده"} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-[#E3DED5] bg-white p-3 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] lg:sticky lg:top-28">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-black text-[#77736D] transition hover:bg-[#F6F1E8] hover:text-[#333230]",
                    isActive && "border border-[#D2AD70]/55 bg-[#F6F1E8] text-[#333230]"
                  )}
                >
                  <span>{item.label}</span>
                  {item.href === "/account/notifications" && unreadNotificationsCount > 0 && (
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#D2AD70] px-2 text-xs font-black text-[#333230]">
                      {unreadNotificationsCount.toLocaleString("fa-IR")}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </section>
    </main>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={cn("inline-flex h-9 items-center rounded-lg border px-3 text-xs font-black", active ? "border-green-200 bg-green-50 text-green-700" : "border-[#D2AD70]/45 bg-[#F6F1E8] text-[#B2894C]")}>
      {label}
    </span>
  );
}
