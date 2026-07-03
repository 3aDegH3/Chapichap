import {
  LightbulbIcon,
  PackageIcon,
  PaletteIcon,
  SearchCheckIcon,
} from "@/components/about/AboutIcons";
import { Reveal } from "@/components/about/AboutMotion";
import AboutSectionHeading from "@/components/about/AboutSectionHeading";

const steps = [
  {
    number: "۰۱",
    title: "ایده و نیازت را می‌گویی",
    description: "محصول، مناسبت، متن، تصویر، تعداد و هر نکته مهم را برای ما ارسال می‌کنی.",
    icon: LightbulbIcon,
  },
  {
    number: "۰۲",
    title: "سفارش بررسی می‌شود",
    description: "امکان اجرا، فایل‌ها، روش چاپ و جزئیات موردنیاز بررسی و جمع‌بندی می‌شوند.",
    icon: SearchCheckIcon,
  },
  {
    number: "۰۳",
    title: "طرح آماده و تأیید می‌شود",
    description: "طرح نهایی متناسب با محصول آماده می‌شود و پیش از چاپ برای تأیید ارائه خواهد شد.",
    icon: PaletteIcon,
  },
  {
    number: "۰۴",
    title: "چاپ، کنترل و ارسال",
    description: "بعد از اجرا، کیفیت نهایی بررسی می‌شود و سفارش با بسته‌بندی مناسب ارسال خواهد شد.",
    icon: PackageIcon,
  },
] as const;

const trustItems = [
  "بررسی طرح قبل از چاپ",
  "امکان سفارش شخصی‌سازی‌شده",
  "ارتباط مستقیم با تیم",
  "نمایش نمونه‌کارهای واقعی",
  "توضیح شفاف فرایند سفارش",
] as const;

export default function OrderProcess() {
  return (
    <section className="border-b border-[#e8e1d8] bg-[#fbfaf7] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <AboutSectionHeading
            eyebrow="روند همکاری"
            title="از ایده تا محصول نهایی، بدون سردرگمی"
            description="هر مرحله هدف مشخصی دارد و اطلاعات لازم در همان نقطه از شما دریافت می‌شود؛ بنابراین مسیر سفارش کوتاه‌تر و تصمیم‌گیری آسان‌تر خواهد بود."
            align="center"
          />
        </Reveal>

        <div className="relative mt-12">
          <span className="absolute left-[12%] right-[12%] top-[46px] hidden h-px bg-gradient-to-l from-transparent via-[#c99a52] to-transparent xl:block" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.number} delay={index * 100} className="h-full">
                  <article className="about-hover-line group relative h-full rounded-[30px] border border-[#e3dbd0] bg-white p-6 text-center shadow-[0_24px_58px_-48px_rgba(48,40,32,0.52)] transition-all duration-500 hover:-translate-y-2 hover:border-[#cfa766] hover:shadow-[0_34px_75px_-50px_rgba(100,68,30,0.42)]">
                    <span className="relative z-10 mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full border-[8px] border-[#fbfaf7] bg-[#302c28] text-[#e2b975] shadow-[0_18px_35px_-24px_rgba(48,44,40,0.75)] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#d2ad70] group-hover:text-[#302c28]">
                      <Icon className="h-10 w-10" />
                    </span>
                    <p className="mt-5 text-[20px] font-black text-[#a4702f]">مرحله {item.number}</p>
                    <h3 className="mt-2 text-[26px] font-black leading-[1.6] text-[#302b27]">{item.title}</h3>
                    <p className="mt-3 text-[20px] font-medium leading-[2] text-[#756e66]">{item.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>

        <Reveal delay={200}>
          <div className="mt-10 rounded-[30px] border border-[#d2ad70]/30 bg-[#f5ede1] p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[24px] font-black text-[#302b27]">اعتمادسازی بدون اغراق</p>
                <p className="mt-2 text-[20px] font-medium leading-[1.9] text-[#766f67]">این موارد بخشی از استاندارد ثابت تجربه سفارش در چاپی چاپ هستند.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {trustItems.map((item) => (
                  <span key={item} className="inline-flex min-h-[48px] items-center rounded-full border border-[#d8cbb9] bg-white px-5 text-[20px] font-black text-[#625b54]">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}