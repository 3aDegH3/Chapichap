"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "داشبورد" },
  { href: "/account/profile", label: "پروفایل" },
  { href: "/account/security", label: "امنیت" },
  { href: "/account/addresses", label: "آدرس‌ها" },
  { href: "/account/orders", label: "سفارش‌ها" },
  { href: "/account/design-requests", label: "درخواست‌های طراحی" },
  { href: "/account/offers", label: "پیشنهادها" },
  { href: "/account/tickets", label: "پشتیبانی" },
  { href: "/account/notifications", label: "اعلان‌ها" },
];

export default function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || !user) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-white" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "کاربر چاپی‌چاپ";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50">
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[var(--secondary)]">حساب کاربری</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-[var(--dark)]">{displayName}</h1>
              <p className="mt-2 text-sm font-bold text-gray-500">{user.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill active={user.email_verified} label={user.email_verified ? "ایمیل تایید شده" : "ایمیل تایید نشده"} />
              <StatusPill active={user.phone_verified} label={user.phone_verified ? "موبایل تایید شده" : "موبایل تایید نشده"} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-sm lg:sticky lg:top-28">
          <nav className="grid gap-1">
            {navItems.map((item) => {
              const isActive = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-black text-gray-600 transition hover:bg-sky-50 hover:text-[var(--secondary)]",
                    isActive && "bg-sky-50 text-[var(--secondary)]"
                  )}
                >
                  {item.label}
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
    <span className={cn("inline-flex h-9 items-center rounded-full border px-3 text-xs font-black", active ? "border-green-200 bg-green-50 text-green-700" : "border-yellow-200 bg-yellow-50 text-yellow-800")}>
      {label}
    </span>
  );
}
