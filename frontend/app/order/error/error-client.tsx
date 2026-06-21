"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderErrorClient() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کن.";

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-2xl font-black text-red-600">
          !
        </div>
        <h1 className="mt-6 text-3xl font-black text-[var(--dark)]">ثبت سفارش کامل نشد</h1>
        <p className="mt-4 leading-8 text-gray-600">{message}</p>
        <p className="mt-3 text-sm font-bold leading-7 text-gray-500">
          اطلاعات checkout پاک نشده است؛ می‌توانی به صفحه checkout برگردی و دوباره تلاش کنی.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/checkout"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90"
          >
            تلاش دوباره
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
          >
            بازگشت به سبد خرید
          </Link>
        </div>
      </section>
    </main>
  );
}
