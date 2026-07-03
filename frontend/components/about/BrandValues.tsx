import {
  EyeIcon,
  HeartIcon,
  SparklesIcon,
  TargetIcon,
} from "@/components/about/AboutIcons";
import { Reveal } from "@/components/about/AboutMotion";
import AboutSectionHeading from "@/components/about/AboutSectionHeading";

const values = [
  {
    title: "شفافیت",
    description: "مراحل سفارش، محدودیت‌های اجرا و زمان آماده‌سازی را روشن توضیح می‌دهیم.",
    icon: EyeIcon,
  },
  {
    title: "دقت",
    description: "جزئیات فایل، محصول و خروجی نهایی پیش از تحویل بررسی می‌شوند.",
    icon: TargetIcon,
  },
  {
    title: "شخصی‌سازی",
    description: "هر سفارش باید حس و داستان صاحب آن را داشته باشد، نه یک خروجی تکراری.",
    icon: SparklesIcon,
  },
  {
    title: "همراهی",
    description: "کاربر در مسیر سفارش تنها نمی‌ماند و برای تصمیم‌های مهم راهنمایی می‌شود.",
    icon: HeartIcon,
  },
] as const;

export default function BrandValues() {
  return (
    <section className="relative overflow-hidden border-b border-[#e8e1d8] bg-[#302c28] py-16 text-white sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#d2ad70]/10 blur-[90px]" />
        <span className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-white/[0.04] blur-[100px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <AboutSectionHeading
            eyebrow="ارزش‌های ما"
            title="اصولی که کیفیت تجربه را می‌سازند"
            description="کیفیت فقط به چاپ نهایی محدود نیست؛ نحوه ارتباط، تصمیم‌گیری و همراهی در طول مسیر نیز بخشی از نتیجه است."
            dark
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Reveal key={value.title} delay={index * 90} className="h-full">
                <article className="about-sheen-card group relative h-full overflow-hidden rounded-[28px] border border-white/[0.09] bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#d2ad70]/45 hover:bg-white/[0.09]">
                  <span className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#d2ad70]/25 bg-[#d2ad70]/10 text-[#e2ba77] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#d2ad70] group-hover:text-[#302c28]">
                    <Icon className="h-8 w-8" />
                  </span>
                  <div className="mt-6 flex items-center justify-between gap-4">
                    <h3 className="text-[28px] font-black">{value.title}</h3>
                    <span className="text-[20px] font-black text-[#81766b]">۰{index + 1}</span>
                  </div>
                  <p className="mt-3 text-[20px] font-medium leading-[2] text-[#c2b7ac]">{value.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}