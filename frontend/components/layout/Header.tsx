"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/design-request", label: "سفارش طراحی" },
  { href: "/contact", label: "تماس با ما" },
];

export default function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
            چ
          </div>
          <div className="leading-tight">
            <p className="font-bold text-slate-900">چاپینو</p>
            <p className="text-xs text-slate-500">هدیه اختصاصی شما</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-indigo-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 sm:inline-flex"
          >
            سبد خرید
          </Link>

          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-xl bg-slate-200" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                {user?.username || "پروفایل"}
              </Link>
              <button
                onClick={logout}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                ورود
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}