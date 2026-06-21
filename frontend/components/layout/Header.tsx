"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/design-request", label: "سفارش طراحی" },
  { href: "/orders", label: "سفارش‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { totalItems } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 10);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        isScrolled
          ? "border-b border-sky-100 bg-white/90 shadow-[0_20px_60px_-15px_rgba(0,174,239,0.35)] backdrop-blur-2xl"
          : "border-b border-sky-50/80 bg-white/85 backdrop-blur-xl"
      )}
    >
      <div className="relative overflow-hidden">
        {/* Top gradient ribbon — blue dominant */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#00AEEF] via-[#0090C8] to-[#00AEEF]" />
        <div className="absolute inset-x-0 top-[3px] h-px bg-gradient-to-l from-transparent via-[#E6007E]/40 to-transparent" />

        {/* Ambient blue glows */}
        <div className="pointer-events-none absolute -right-20 -top-10 h-44 w-44 rounded-full bg-[#00AEEF]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-1/3 top-0 h-32 w-32 rounded-full bg-[#00AEEF]/12 blur-3xl" />
        <div className="pointer-events-none absolute left-24 top-2 h-28 w-28 rounded-full bg-[#00AEEF]/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-[#FFD100]/12 blur-2xl" />

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* ===== Logo ===== */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label="Chapi Chap"
          >
            <div className="relative">
              <div className="absolute -inset-2.5 rounded-[1.6rem] bg-gradient-to-br from-[#00AEEF]/30 via-sky-100/40 to-[#00AEEF]/15 opacity-0 blur-lg transition duration-500 group-hover:opacity-100" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-sky-200 bg-white shadow-[0_10px_28px_-8px_rgba(0,174,239,0.45)] transition duration-500 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_-8px_rgba(0,174,239,0.6)] sm:h-16 sm:w-16">
                <Image
                  src="/brand/logo.png"
                  alt="Chapi Chap Logo"
                  width={150}
                  height={60}
                  priority
                  className="h-auto max-h-10 w-auto max-w-[120px] object-contain sm:max-h-12"
                />

                <span className="absolute -bottom-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#FFD100] text-[10px] font-black text-[#1A1A1A] shadow-md">
                  ★
                </span>
              </div>
            </div>

            <div className="hidden leading-tight sm:block">
              <p className="text-base font-black tracking-tight text-[#1A1A1A]">
                Chapi chap
              </p>
              <p className="mt-0.5 text-[11px] font-bold text-[#00AEEF]">
                چاپ و هدایای اختصاصی
              </p>
            </div>
          </Link>

          {/* ===== Desktop Nav ===== */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-sky-200/70 bg-white/85 p-1.5 text-sm font-bold shadow-[0_8px_28px_-12px_rgba(0,174,239,0.4)] backdrop-blur-xl lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative overflow-hidden rounded-full px-4 py-2.5 text-gray-600 transition duration-300 hover:-translate-y-0.5 hover:bg-sky-50 hover:text-[#00AEEF]",
                    "after:absolute after:inset-x-4 after:bottom-1 after:h-[3px] after:scale-x-0 after:rounded-full after:bg-gradient-to-l after:from-[#00AEEF] after:via-[#0090C8] after:to-[#00AEEF] after:transition-transform after:duration-300 hover:after:scale-x-100",
                    isActive &&
                      "bg-gradient-to-l from-[#00AEEF] to-[#0090C8] text-white shadow-[0_8px_22px_-6px_rgba(0,174,239,0.55)] hover:bg-[#00AEEF] hover:text-white hover:after:hidden"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* ===== Desktop Actions ===== */}
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/cart"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-sky-200 bg-sky-50/80 px-4 py-2.5 text-sm font-black text-[#0090C8] transition duration-300 hover:-translate-y-0.5 hover:border-[#00AEEF] hover:bg-white hover:text-[#00AEEF] hover:shadow-[0_10px_24px_-8px_rgba(0,174,239,0.5)]"
            >
              <span className="text-base leading-none">سبد</span>
              <span className="relative z-10">سبد خرید</span>
              {totalItems > 0 && (
                <span className="relative z-10 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[11px] text-white">
                  {totalItems.toLocaleString("fa-IR")}
                </span>
              )}
              <span className="absolute -right-6 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-[#00AEEF]/15 transition duration-500 group-hover:scale-[2.4]" />
            </Link>

            {isLoading ? (
              <div className="h-11 w-28 animate-pulse rounded-full bg-sky-100" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="rounded-full border border-[#FFD100]/60 bg-[#FFD100]/20 px-4 py-2.5 text-sm font-black text-[#1A1A1A] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFD100]/35"
                >
                  {user?.username || "پروفایل"}
                </Link>

                <button
                  type="button"
                  onClick={() => void logout()}
                  className="rounded-full bg-[#E6007E] px-5 py-2.5 text-sm font-black text-white shadow-[0_10px_26px_-8px_rgba(230,0,126,0.6)] transition duration-300 hover:-translate-y-0.5 hover:opacity-90"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2.5 text-sm font-black text-[#1A1A1A] transition duration-300 hover:bg-sky-50 hover:text-[#00AEEF]"
                >
                  ورود
                </Link>

                <Link
                  href="/register"
                  className="group relative inline-flex overflow-hidden rounded-full bg-gradient-to-l from-[#00AEEF] to-[#0090C8] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_-8px_rgba(0,174,239,0.65)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-8px_rgba(0,174,239,0.8)]"
                >
                  <span className="relative z-10">ثبت‌نام</span>
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-full" />
                </Link>
              </>
            )}
          </div>

          {/* ===== Mobile Toggle ===== */}
          <button
            type="button"
            onClick={() => setIsOpen((value) => !value)}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-white text-xl font-black text-[#00AEEF] shadow-sm transition duration-300 hover:scale-105 hover:border-[#00AEEF] lg:hidden",
              isOpen && "border-[#00AEEF] bg-gradient-to-br from-[#00AEEF] to-[#0090C8] text-white"
            )}
            aria-label="باز کردن منو"
            aria-expanded={isOpen}
          >
            {isOpen ? "×" : "☰"}
          </button>
        </div>

        {/* ===== Mobile Menu ===== */}
        {isOpen && (
          <div className="border-t border-sky-100 bg-white/97 px-4 py-5 shadow-[0_24px_60px_-15px_rgba(0,174,239,0.3)] backdrop-blur-2xl lg:hidden">
            <div className="mb-4 rounded-2xl border border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-sky-50/60 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-black text-[#1A1A1A]">Chapi chap</p>
                  <p className="mt-0.5 text-xs font-bold text-[#00AEEF]">
                    هدیه‌ات رو رنگی و خاص بساز
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-200 bg-white shadow-sm">
                  <Image
                    src="/brand/logo.png"
                    alt="Chapi Chap Logo"
                    width={110}
                    height={50}
                    className="h-auto max-h-9 w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-sm font-black text-gray-700 transition hover:bg-sky-50 hover:text-[#00AEEF]",
                      isActive &&
                        "border border-sky-200 bg-sky-50 text-[#00AEEF] shadow-[inset_0_0_0_1px_rgba(0,174,239,0.15)]"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 text-sm font-black text-[#0090C8]"
              >
                <span>سبد خرید</span>
                {totalItems > 0 && (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--primary)] px-1.5 text-xs text-white">
                    {totalItems.toLocaleString("fa-IR")}
                  </span>
                )}
              </Link>

              <div className="mt-3 border-t border-sky-100 pt-3">
                {isLoading ? (
                  <div className="h-12 animate-pulse rounded-xl bg-sky-100" />
                ) : isAuthenticated ? (
                  <div className="grid gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-[#FFD100]/60 bg-[#FFD100]/20 px-4 py-3 text-sm font-black text-[#1A1A1A]"
                    >
                      {user?.username || "پروفایل"}
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        void logout();
                      }}
                      className="rounded-xl bg-[#E6007E] px-4 py-3 text-sm font-black text-white shadow-[0_8px_20px_-6px_rgba(230,0,126,0.55)]"
                    >
                      خروج
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl bg-sky-50 px-4 py-3 text-center text-sm font-black text-[#00AEEF]"
                    >
                      ورود
                    </Link>

                    <Link
                      href="/register"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl bg-gradient-to-l from-[#00AEEF] to-[#0090C8] px-4 py-3 text-center text-sm font-black text-white shadow-[0_10px_24px_-6px_rgba(0,174,239,0.6)]"
                    >
                      ثبت‌نام
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
