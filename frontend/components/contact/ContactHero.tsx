import Link from "next/link";

import { siteInfo } from "@/lib/site-info";

export default function ContactHero() {
  return (
    <section className="border-b border-[#E3DED5] bg-[#F2EEE6]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <p className="text-sm font-black text-[#B2894C]">تماس با چاپی چاپ</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div>
            <h1 className="max-w-3xl text-3xl font-black leading-[1.45] text-[#333230] sm:text-5xl">
              برای ساختن سفارش بعدی، با ما در ارتباط باشید
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-9 text-[#77736D]">
              برای ثبت سفارش، ارسال طرح، دریافت راهنمایی یا پرسیدن سؤال می‌توانید
              از راه‌های زیر با تیم چاپی چاپ ارتباط بگیرید.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8CFC0] bg-white p-5">
            <p className="text-sm font-black text-[#333230]">تماس سریع</p>
            <a
              href={`tel:${siteInfo.phone}`}
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#D2AD70] px-5 text-sm font-black text-[#333230] transition duration-300 hover:bg-[#B2894C]"
            >
              {siteInfo.phoneDisplay}
            </a>
            <Link
              href="/design-request"
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-[#E3DED5] bg-white px-5 text-sm font-black text-[#333230] transition duration-300 hover:border-[#D2AD70] hover:bg-[#FAFAF8]"
            >
              ثبت درخواست طراحی
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
