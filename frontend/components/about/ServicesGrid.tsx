import Link from "next/link";

import {
  ArrowLeftIcon,
  BuildingIcon,
  GiftIcon,
  MessageIcon,
  PaletteIcon,
  PrintIcon,
  SearchCheckIcon,
} from "@/components/about/AboutIcons";
import { Reveal } from "@/components/about/AboutMotion";
import AboutSectionHeading from "@/components/about/AboutSectionHeading";

const services = [
  {
    title: "طراحی اختصاصی",
    description: "تبدیل ایده، عکس یا متن شما به طرحی آماده اجرا و متناسب با محصول.",
    href: "/design-request?type=custom_print",
    icon: PaletteIcon,
  },
  {
    title: "چاپ روی محصولات",
    description: "اجرای طرح روی ماگ، پوشاک، هدایای شخصی و محصولات چاپی متنوع.",
    href: "/products",
    icon: PrintIcon,
  },
  {
    title: "هدایای شخصی",
    description: "ساخت هدیه‌ای متناسب با مناسبت، شخصیت و داستانی که می‌خواهید منتقل کنید.",
    href: "/design-request?type=gift",
    icon: GiftIcon,
  },
  {
    title: "سفارش سازمانی",
    description: "طراحی و تولید سفارش‌های هماهنگ برای برندها، مجموعه‌ها و مناسبت‌های سازمانی.",
    href: "/contact",
    icon: BuildingIcon,
  },
  {
    title: "بررسی فایل چاپ",
    description: "کنترل ابعاد، کیفیت، رنگ و آماده‌سازی فایل پیش از ورود به مرحله اجرا.",
    href: "/design-request?type=print",
    icon: SearchCheckIcon,
  },
  {
    title: "مشاوره انتخاب محصول",
    description: "انتخاب محصول، روش چاپ و مسیر مناسب بر اساس بودجه و هدف سفارش.",
    href: "/design-request?type=consulting",
    icon: MessageIcon,
  },
] as const;

export default function ServicesGrid() {
  return (
    <section className="border-b border-[#e8e1d8] bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <AboutSectionHeading
            eyebrow="خدمات چاپی چاپ"
            title="برای هر ایده، یک مسیر اجرایی روشن"
            description="از آماده‌سازی یک فایل ساده تا طراحی و اجرای سفارش‌های کاملاً اختصاصی، خدمات به‌صورت یکپارچه در اختیار شما قرار می‌گیرند."
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={(index % 3) * 90} className="h-full">
                <Link href={service.href} className="about-hover-line group relative block h-full overflow-hidden rounded-[28px] border border-[#e3dbd0] bg-white p-6 shadow-[0_22px_55px_-46px_rgba(49,41,34,0.48)] outline-none transition-all duration-500 hover:-translate-y-2 hover:border-[#cfa766] hover:shadow-[0_32px_70px_-48px_rgba(106,72,31,0.42)] focus-visible:ring-4 focus-visible:ring-[#c99a52]/20">
                  <span className="absolute -left-14 -top-14 h-36 w-36 rounded-full bg-[#d2ad70]/0 blur-[45px] transition-colors duration-700 group-hover:bg-[#d2ad70]/18" />
                  <span className="absolute left-5 top-5 text-[20px] font-black text-[#c7b8a5]">{(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}</span>
                  <span className="relative flex h-[70px] w-[70px] items-center justify-center rounded-[22px] border border-[#e2d3bd] bg-[#f6eddf] text-[#98672b] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:border-[#302c28] group-hover:bg-[#302c28] group-hover:text-[#e5bc76]">
                    <Icon className="h-9 w-9" />
                  </span>
                  <h3 className="relative mt-6 text-[27px] font-black leading-[1.6] text-[#302b27]">{service.title}</h3>
                  <p className="relative mt-3 text-[20px] font-medium leading-[2] text-[#766f67]">{service.description}</p>
                  <span className="relative mt-6 flex items-center gap-3 text-[20px] font-black text-[#9b692b]">
                    مشاهده مسیر سفارش
                    <ArrowLeftIcon className="h-6 w-6 transition-transform duration-500 group-hover:-translate-x-2" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}