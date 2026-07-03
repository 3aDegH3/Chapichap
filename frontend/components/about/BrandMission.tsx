import {
  CompassIcon,
  LayersIcon,
  ShieldCheckIcon,
} from "@/components/about/AboutIcons";
import { Reveal } from "@/components/about/AboutMotion";
import AboutSectionHeading from "@/components/about/AboutSectionHeading";

const missions = [
  {
    title: "انتخاب آگاهانه",
    description: "کمک می‌کنیم محصول و روش چاپ با هدف، بودجه و کاربرد سفارش هماهنگ باشد.",
    icon: CompassIcon,
  },
  {
    title: "طراحی کاربردی",
    description: "طرح فقط برای نمایش ساخته نمی‌شود؛ از ابتدا محدودیت‌ها و کیفیت اجرای واقعی در نظر گرفته می‌شوند.",
    icon: LayersIcon,
  },
  {
    title: "خروجی قابل اعتماد",
    description: "کنترل فایل، هماهنگی جزئیات و بررسی نتیجه نهایی بخش ثابت مسیر سفارش هستند.",
    icon: ShieldCheckIcon,
  },
] as const;

export default function BrandMission() {
  return (
    <section className="border-b border-[#e8e1d8] bg-[#f3eee6] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          <AboutSectionHeading
            eyebrow="ماموریت ما"
            title="طراحی زیبا وقتی ارزشمند است که درست اجرا شود"
            description="ماموریت چاپی چاپ، ساختن ارتباطی دقیق بین ایده، طراحی، محصول و چاپ است تا نتیجه نهایی هم زیبا باشد و هم قابلیت اجرای واقعی داشته باشد."
            align="center"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {missions.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 100} className="h-full">
                <article className="about-sheen-card group relative h-full overflow-hidden rounded-[30px] border border-white/80 bg-white/75 p-7 shadow-[0_25px_60px_-48px_rgba(48,40,31,0.48)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#d2ad70]/70 hover:bg-white">
                  <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-[#302c28] text-[#e1b976] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#d2ad70] group-hover:text-[#302c28]">
                    <Icon className="h-9 w-9" />
                  </span>
                  <p className="mt-6 text-[20px] font-black text-[#b07a36]">۰{index + 1}</p>
                  <h3 className="mt-2 text-[28px] font-black leading-[1.6] text-[#302b27]">{item.title}</h3>
                  <p className="mt-3 text-[20px] font-medium leading-[2] text-[#756e66]">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}