import Link from "next/link";

import {
  ArrowLeftIcon,
  PaletteIcon,
} from "@/components/about/AboutIcons";
import { Reveal } from "@/components/about/AboutMotion";

export default function AboutFinalCTA() {
  return (
    <section className="bg-[#f2eee6] py-16 sm:py-20">
      <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <Reveal direction="fade">
          <div className="relative overflow-hidden rounded-[36px] border border-[#d2ad70]/35 bg-[#302c28] px-6 py-10 text-white shadow-[0_42px_100px_-58px_rgba(42,35,28,0.9)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <span className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#d2ad70]/20 blur-[90px]" />
              <span className="absolute -bottom-44 -left-20 h-80 w-80 rounded-full bg-white/[0.07] blur-[90px]" />
              <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#e8c482] to-transparent" />
            </div>

            <div className="relative max-w-4xl">
              <p className="text-[20px] font-black text-[#dfb978]">شروع یک سفارش خاص</p>
              <h2 className="mt-3 text-[34px] font-black leading-[1.6] sm:text-[42px] lg:text-[48px]">ایده‌ای داری که هنوز شکل نهایی‌اش را نمی‌دانی؟</h2>
              <p className="mt-4 text-[20px] font-medium leading-[2] text-[#d0c5ba] sm:text-[22px]">توضیحات، تصویر یا فایل اولیه را بفرست تا مناسب‌ترین محصول و روش اجرا برای آن بررسی شود.</p>
            </div>

            <div className="relative mt-8 flex flex-col gap-4 sm:flex-row lg:mt-0 lg:flex-col">
              <Link href="/design-request" className="about-shine-button group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] bg-[#d2ad70] px-8 text-[20px] font-black text-[#302c28] transition-all duration-500 hover:-translate-y-1 hover:bg-white">
                <PaletteIcon className="relative h-7 w-7" />
                <span className="relative">ثبت درخواست طراحی</span>
                <ArrowLeftIcon className="relative h-6 w-6 transition-transform duration-500 group-hover:-translate-x-1.5" />
              </Link>
              <Link href="/contact" className="inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] border border-white/15 bg-white/[0.07] px-8 text-[20px] font-black text-white transition-all duration-500 hover:-translate-y-1 hover:border-[#d2ad70]/55 hover:bg-white/[0.12]">دریافت مشاوره</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}