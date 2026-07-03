import AboutImageFrame from "@/components/about/AboutImageFrame";
import { Reveal } from "@/components/about/AboutMotion";
import AboutSectionHeading from "@/components/about/AboutSectionHeading";

/**
 * تصویر پیشنهادی:
 * public/about/about-story.webp
 * بعد از اضافه‌کردن تصویر، مقدار زیر را تغییر بده.
 */
const ABOUT_STORY_IMAGE: string | null = null;

const milestones = [
  {
    number: "۰۱",
    title: "شروع با یک نیاز واقعی",
    description:
      "چاپی چاپ از جایی شروع شد که سفارش هدیه و چاپ اختصاصی، به تجربه‌ای ساده‌تر، شفاف‌تر و قابل اعتمادتر نیاز داشت.",
  },
  {
    number: "۰۲",
    title: "ترکیب طراحی و اجرا",
    description:
      "طراحی را از چاپ جدا نمی‌بینیم؛ فایل باید از ابتدا برای محصول، جنس، رنگ و روش اجرای واقعی آماده شود.",
  },
  {
    number: "۰۳",
    title: "ساختن یک تجربه کامل",
    description:
      "هدف ما فقط تحویل محصول نیست؛ می‌خواهیم مسیر انتخاب، طراحی، تأیید، چاپ و دریافت سفارش برای شما روشن باشد.",
  },
] as const;

export default function BrandStory() {
  return (
    <section className="border-b border-[#e8e1d8] bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid w-full max-w-[1760px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:px-12">
        <Reveal direction="right">
          <div className="lg:sticky lg:top-28">
            <AboutSectionHeading
              eyebrow="داستان برند"
              title="چرا چاپی چاپ شکل گرفت؟"
              description="برای اینکه سفارش چاپ اختصاصی فقط انتخاب یک محصول نباشد؛ بلکه مسیری قابل فهم، خلاقانه و مطمئن از ایده تا تحویل باشد."
            />

            <div className="mt-8">
              <AboutImageFrame
                src={ABOUT_STORY_IMAGE}
                alt="تیم یا فضای کاری چاپی چاپ"
                title="جای تصویر داستان برند"
                description="اینجا می‌تواند تصویر واقعی تیم، میز طراحی، فرایند چاپ یا بسته‌بندی سفارش‌ها قرار بگیرد."
                className="min-h-[440px]"
              />
            </div>

            <div className="mt-6 rounded-[28px] border border-[#e0d4c5] bg-[#f5ede1] p-6">
              <p className="text-[21px] font-black leading-9 text-[#7e5523]">
                «هر سفارش فقط یک محصول نیست؛ بخشی از یک خاطره، مناسبت یا هویت برند است.»
              </p>
            </div>
          </div>
        </Reveal>

        <div className="relative">
          <span className="absolute bottom-12 right-[35px] top-12 hidden w-px bg-gradient-to-b from-[#c99a52] via-[#d9c09a] to-transparent sm:block" />

          <div className="grid gap-5">
            {milestones.map((item, index) => (
              <Reveal key={item.number} direction="left" delay={index * 100}>
                <article className="about-hover-line group relative grid gap-5 rounded-[30px] border border-[#e3dbd0] bg-white p-6 shadow-[0_22px_55px_-44px_rgba(47,40,33,0.5)] transition-all duration-500 hover:-translate-x-1.5 hover:border-[#d2ad70]/65 hover:shadow-[0_30px_70px_-48px_rgba(83,57,26,0.45)] sm:grid-cols-[72px_1fr] sm:p-7">
                  <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-[#d5ba8b] bg-[#f5ead9] text-[22px] font-black text-[#925f23] transition-all duration-500 group-hover:rotate-[-5deg] group-hover:bg-[#302c28] group-hover:text-white">
                    {item.number}
                  </span>
                  <div>
                    <h3 className="text-[27px] font-black leading-[1.6] text-[#302b27]">{item.title}</h3>
                    <p className="mt-3 text-[20px] font-medium leading-[2] text-[#766f67] sm:text-[21px]">{item.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}