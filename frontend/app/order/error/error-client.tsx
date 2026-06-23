"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderErrorClient() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message") || "ثبت سفارش ناموفق بود. لطفاً دوباره تلاش کن.";

  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-2xl font-black text-red-600">
          !
        </div>
        <h1 className="mt-6 text-3xl font-black text-[#333230]">ثبت سفارش کامل نشد</h1>
        <p className="mt-4 leading-8 text-[#77736D]">{message}</p>
        <p className="mt-3 text-sm font-bold leading-7 text-[#77736D]">
          اطلاعات checkout پاک نشده است؛ می‌توانی به صفحه checkout برگردی و دوباره تلاش کنی.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/checkout"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:-translate-y-0.5 hover:bg-[#B2894C]"
          >
            تلاش دوباره
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
          >
            بازگشت به سبد خرید
          </Link>
        </div>
      </section>
    </main>
  );
}
