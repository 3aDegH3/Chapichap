"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/design-request", label: "سفارش طراحی" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl font-black text-white shadow-lg shadow-pink-900/20">
            چ
          </div>

          <div className="leading-tight">
            <p className="font-black text-[var(--dark)]">چاپینو</p>
            <p className="text-xs font-bold text-gray-500">هدیه اختصاصی شما</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-bold text-gray-600 lg:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition hover:text-[var(--primary)]",
                  isActive && "text-[var(--primary)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/cart"
            className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-black text-[var(--dark)] transition hover:border-[var(--primary)] hover:bg-pink-50 hover:text-[var(--primary)]"
          >
            سبد خرید
          </Link>

          {isLoading ? (
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-gray-200" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/profile"
                className="rounded-2xl bg-gray-100 px-4 py-2 text-sm font-black text-[var(--dark)] transition hover:bg-gray-200"
              >
                {user?.username || "پروفایل"}
              </Link>

              <button
                onClick={logout}
                className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
              >
                خروج
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-2xl px-4 py-2 text-sm font-black text-[var(--dark)] transition hover:bg-gray-100"
              >
                ورود
              </Link>

              <Link
                href="/register"
                className="rounded-2xl bg-[var(--primary)] px-4 py-2 text-sm font-black text-white transition hover:opacity-90"
              >
                ثبت‌نام
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 text-xl font-black lg:hidden"
          aria-label="باز کردن منو"
        >
          ☰
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-pink-50 hover:text-[var(--primary)]",
                    isActive && "bg-pink-50 text-[var(--primary)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="mt-3 border-t border-gray-100 pt-3">
              {isLoading ? (
                <div className="h-11 animate-pulse rounded-2xl bg-gray-200" />
              ) : isAuthenticated ? (
                <div className="grid gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-black text-[var(--dark)]"
                  >
                    پروفایل
                  </Link>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-black text-[var(--dark)]"
                  >
                    ورود
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-black text-white"
                  >
                    ثبت‌نام
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}