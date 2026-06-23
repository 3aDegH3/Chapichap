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
  { href: "/products", label: "فروشگاه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/design-request", label: "طراحی اختصاصی" },
  { href: "/account/orders", label: "سفارش‌ها" },
];

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { totalItems } = useCart();
  const isCartActive = pathname === "/cart";
  const isLoginActive = pathname === "/login";
  const isAccountActive = pathname === "/account" || pathname.startsWith("/account/");

  const [hasMounted, setHasMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldShowCartCount = hasMounted && totalItems > 0;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 8);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-[#D8D0C2] bg-[#FAFAF8]/92 shadow-[0_18px_45px_-32px_rgba(51,50,48,0.75)] backdrop-blur-2xl"
          : "border-[#E3DED5] bg-[#FAFAF8]/88 backdrop-blur-xl"
      )}
    >
      <div className="h-[3px] bg-gradient-to-l from-[#333230] via-[#D2AD70] to-[#333230]" />

      <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 rounded-2xl border border-transparent px-1.5 py-1 transition hover:border-[#D2AD70]/35 hover:bg-white/70"
          aria-label="صفحه اصلی چاپی چاپ"
        >
          <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D2AD70]/45 bg-white shadow-[0_12px_28px_-20px_rgba(51,50,48,0.65)] transition group-hover:-translate-y-0.5 group-hover:border-[#D2AD70]">
            <Image
              src="/brand/logo.png"
              alt="لوگوی چاپی چاپ"
              width={112}
              height={112}
              priority
              className="h-full w-full object-contain"
            />
          </span>

          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block text-base font-black text-[#333230]">چاپی چاپ</span>
            <span className="mt-1 block text-[11px] font-bold text-[#B2894C]">
              طراحی · چاپ · هدیه
            </span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 rounded-2xl border border-[#E3DED5] bg-white/78 p-1.5 text-sm font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_34px_-30px_rgba(51,50,48,0.75)] lg:flex">
          {navItems.map((item) => {
            const isActive = isNavActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex h-10 items-center rounded-xl px-4 text-[#6F6A63] transition hover:bg-[#F6F1E8] hover:text-[#333230]",
                  isActive &&
                    "bg-[#F6F1E8] text-[#333230] shadow-[inset_0_0_0_1px_rgba(210,173,112,0.42)]"
                )}
              >
                {isActive && (
                  <span className="ml-2 h-1.5 w-1.5 rounded-full bg-[#B2894C]" />
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mr-auto hidden items-center rounded-2xl border border-[#E3DED5] bg-white/82 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_34px_-30px_rgba(51,50,48,0.75)] md:flex lg:mr-0">
          <Link
            href="/cart"
            className={cn(
              "relative inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-black text-[#6F6A63] transition hover:bg-[#F6F1E8] hover:text-[#333230]",
              isCartActive &&
                "bg-[#F6F1E8] text-[#333230] shadow-[inset_0_0_0_1px_rgba(210,173,112,0.44)]"
            )}
            aria-label="سبد خرید"
          >
            <span>سبد خرید</span>
            {shouldShowCartCount && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D2AD70] px-1.5 text-[11px] text-[#333230]">
                {totalItems.toLocaleString("fa-IR")}
              </span>
            )}
          </Link>

          {isLoading ? (
            <div className="h-11 w-24 animate-pulse rounded-2xl bg-[#E3DED5]" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/account"
                className={cn(
                  "inline-flex h-10 max-w-36 items-center truncate rounded-xl px-3.5 text-sm font-black text-[#6F6A63] transition hover:bg-[#F6F1E8] hover:text-[#333230]",
                  isAccountActive &&
                    "bg-[#F6F1E8] text-[#333230] shadow-[inset_0_0_0_1px_rgba(210,173,112,0.44)]"
                )}
              >
                {user?.first_name || user?.username || "حساب"}
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="inline-flex h-10 items-center rounded-xl border border-[#E3DED5] bg-white px-3.5 text-sm font-black text-[#6F6A63] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] hover:text-[#333230]"
              >
                خروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                "inline-flex h-10 items-center rounded-xl px-4 text-sm font-black text-[#6F6A63] transition hover:bg-[#F6F1E8] hover:text-[#333230]",
                isLoginActive &&
                  "bg-[#F6F1E8] text-[#333230] shadow-[inset_0_0_0_1px_rgba(210,173,112,0.44)]"
              )}
            >
              ورود
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className={cn(
            "mr-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E3DED5] bg-white text-[#333230] shadow-sm transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] lg:hidden",
            isOpen && "border-[#D2AD70] bg-[#F6F1E8]"
          )}
          aria-label="باز کردن منو"
          aria-expanded={isOpen}
        >
          <span className="grid gap-1.5">
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition",
                isOpen && "translate-y-2 rotate-45"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition",
                isOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition",
                isOpen && "-translate-y-2 -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-[#E3DED5] bg-[#FAFAF8]/98 px-4 py-4 shadow-[0_22px_55px_-34px_rgba(51,50,48,0.8)] backdrop-blur-2xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-3">
            <div className="rounded-2xl border border-[#E3DED5] bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-[#333230]">چاپی چاپ</p>
                  <p className="mt-1 text-xs font-bold text-[#77736D]">
                    سفارش چاپ و هدیه اختصاصی
                  </p>
                </div>
                <Link
                  href="/cart"
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-xs font-black transition",
                    isCartActive
                      ? "border-[#D2AD70] bg-[#F6F1E8] text-[#333230]"
                      : "border-[#E3DED5] bg-white text-[#6F6A63]"
                  )}
                >
                  سبد خرید
                  {shouldShowCartCount && (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D2AD70] px-1 text-[11px]">
                      {totalItems.toLocaleString("fa-IR")}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <nav className="grid gap-1 rounded-2xl border border-[#E3DED5] bg-white p-2">
              {navItems.map((item) => {
                const isActive = isNavActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-12 items-center justify-between rounded-xl px-4 text-sm font-black text-[#6F6A63] transition hover:bg-[#F6F1E8] hover:text-[#333230]",
                      isActive && "bg-[#F6F1E8] text-[#333230]"
                    )}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="h-2 w-2 rounded-full bg-[#B2894C]" />}
                  </Link>
                );
              })}
            </nav>

            <div className="grid gap-2 rounded-2xl border border-[#E3DED5] bg-white p-2">
              {isLoading ? (
                <div className="h-12 animate-pulse rounded-xl bg-[#E3DED5]" />
              ) : isAuthenticated ? (
                <>
                  <Link
                    href="/account"
                    className={cn(
                      "h-12 rounded-xl px-4 py-3 text-center text-sm font-black transition",
                      isAccountActive
                        ? "border border-[#D2AD70] bg-[#F6F1E8] text-[#333230]"
                        : "border border-[#E3DED5] bg-white text-[#6F6A63]"
                    )}
                  >
                    {user?.first_name || user?.username || "حساب کاربری"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="h-12 rounded-xl border border-[#E3DED5] bg-white text-sm font-black text-[#6F6A63] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] hover:text-[#333230]"
                  >
                    خروج
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={cn(
                    "h-12 rounded-xl px-4 py-3 text-center text-sm font-black transition",
                    isLoginActive
                      ? "border border-[#D2AD70] bg-[#F6F1E8] text-[#333230]"
                      : "border border-[#E3DED5] bg-white text-[#6F6A63]"
                  )}
                >
                  ورود به حساب
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
