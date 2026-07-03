import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeftIcon,
  GalleryIcon,
  HeadsetIcon,
  PaletteIcon,
  SearchCheckIcon,
  SparklesIcon,
} from "@/components/about/AboutIcons";
import AboutImageFrame from "@/components/about/AboutImageFrame";
import { Reveal } from "@/components/about/AboutMotion";

/**
 * بعد از طراحی تصویر هیرو:
 * public/about/about-hero.webp
 * سپس مقدار زیر را به "/about/about-hero.webp" تغییر بده.
 */
const ABOUT_HERO_IMAGE: string | null = null;

const highlights = [
  {
    title: "بررسی قبل از چاپ",
    description: "فایل و جزئیات سفارش پیش از اجرا کنترل می‌شوند.",
    icon: SearchCheckIcon,
  },
  {
    title: "طراحی متناسب با ایده",
    description: "طرح بر اساس محصول، مناسبت و سلیقه شما آماده می‌شود.",
    icon: PaletteIcon,
  },
  {
    title: "همراهی تا تحویل",
    description: "از انتخاب محصول تا آماده‌سازی و ارسال کنار شما هستیم.",
    icon: HeadsetIcon,
  },
] as const;

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-[#e2d9cd] bg-[#f2eee6]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="about-grid-pattern absolute inset-0 opacity-70" />
        <span className="about-soft-orb-one absolute -right-44 -top-48 h-[540px] w-[540px] rounded-full bg-[#d2ad70]/20 blur-[105px]" />
        <span className="about-soft-orb-two absolute -bottom-64 -left-36 h-[520px] w-[520px] rounded-full bg-white/80 blur-[105px]" />
        <span className="absolute left-[42%] top-[18%] h-4 w-4 rotate-45 rounded-[3px] border border-[#b9833d]/35" />
        <span className="absolute left-[45%] top-[25%] h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#b9833d]/30" />
      </div>

      <div className="relative mx-auto grid min-h-[760px] w-full max-w-[1760px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)] lg:items-center lg:px-12 lg:py-24">
        <Reveal direction="right">
          <div className="max-w-5xl">
            <div className="inline-flex min-h-[56px] items-center gap-3 rounded-full border border-[#d8c39f] bg-white/75 px-6 text-[20px] font-black text-[#8a5b20] shadow-[0_16px_35px_-28px_rgba(91,63,27,0.45)] backdrop-blur-xl">
              <SparklesIcon className="h-7 w-7" />
              درباره چاپی چاپ
            </div>

            <h1 className="mt-7 max-w-5xl text-[42px] font-black leading-[1.55] text-[#2d2925] sm:text-[52px] lg:text-[62px] xl:text-[70px]">
              ایده‌های شخصی را به
              <span className="relative mx-3 inline-block text-[#a87431]">
                محصولی ماندگار
                <span className="absolute inset-x-0 bottom-2 -z-10 h-4 rounded-full bg-[#d2ad70]/18" />
              </span>
              تبدیل می‌کنیم.
            </h1>

            <p className="mt-6 max-w-4xl text-[21px] font-medium leading-[2.05] text-[#6f6861] sm:text-[23px]">
              چاپی چاپ یک مسیر یکپارچه برای طراحی، آماده‌سازی، چاپ و ساخت
              هدایای اختصاصی است؛ جایی که ایده شما از یک توضیح ساده به
              محصولی قابل لمس، زیبا و شخصی تبدیل می‌شود.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link href="/design-request" className="about-shine-button group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] bg-[#302c28] px-8 text-[20px] font-black text-white shadow-[0_24px_48px_-28px_rgba(48,44,40,0.75)] outline-none transition-all duration-500 hover:-translate-y-1 hover:bg-[#a87431] focus-visible:ring-4 focus-visible:ring-[#c99a52]/25">
                <PaletteIcon className="relative h-7 w-7" />
                <span className="relative">ثبت سفارش اختصاصی</span>
                <ArrowLeftIcon className="relative h-6 w-6 transition-transform duration-500 group-hover:-translate-x-1.5" />
              </Link>

              <Link href="/portfolio" className="group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] border border-[#d6c8b4] bg-white/80 px-8 text-[20px] font-black text-[#403a34] outline-none transition-all duration-500 hover:-translate-y-1 hover:border-[#c99a52] hover:bg-white hover:text-[#895a22] focus-visible:ring-4 focus-visible:ring-[#c99a52]/20">
                <GalleryIcon className="h-7 w-7 text-[#a87431]" />
                مشاهده نمونه‌کارها
              </Link>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={120 + index * 90}>
                    <article className="about-hover-line group relative h-full rounded-[22px] border border-white/80 bg-white/65 p-4 shadow-[0_20px_45px_-36px_rgba(62,50,37,0.42)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d2ad70]/70 hover:bg-white">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#f3e8d7] text-[#98672b] transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h2 className="mt-4 text-[21px] font-black leading-8 text-[#302b27]">{item.title}</h2>
                      <p className="mt-2 text-[20px] font-medium leading-[1.8] text-[#7a726a]">{item.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal direction="left" delay={140}>
          <div className="about-floating-panel relative mx-auto w-full max-w-[690px]">
            <AboutImageFrame
              src={ABOUT_HERO_IMAGE}
              alt="فضای طراحی، چاپ و بسته‌بندی محصولات اختصاصی چاپی چاپ"
              title="جای تصویر اصلی هیرو"
              description="یک تصویر عمودی یا مربعی از محصولات چاپی، میز طراحی، بسته‌بندی هدیه و فضای خلاق استودیو در این قاب قرار می‌گیرد."
              priority
              className="min-h-[610px]"
            />

            <div className="absolute -bottom-5 right-5 rounded-[22px] border border-white/80 bg-white/90 p-4 shadow-[0_20px_45px_-28px_rgba(48,40,32,0.6)] backdrop-blur-xl sm:right-8">
              <div className="flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] border border-[#d2ad70]/35 bg-[#fbfaf7]">
                  <Image src="/brand/logo.webp" alt="لوگوی چاپی چاپ" width={90} height={90} className="h-full w-full object-contain p-1" />
                </span>
                <div>
                  <p className="text-[20px] font-black text-[#9a682b]">از ایده تا اجرا</p>
                  <p className="mt-1 text-[22px] font-black text-[#302b27]">طراحی · چاپ · هدیه</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
