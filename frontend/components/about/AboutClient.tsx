"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type SVGProps,
} from "react";

type IconProps = SVGProps<SVGSVGElement>;
type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "right" | "left" | "fade";
};

const navigationItems = [
  { href: "#story", label: "داستان ما" },
  { href: "#services", label: "خدمات" },
  { href: "#values", label: "ارزش‌ها" },
  { href: "#process", label: "روند سفارش" },
] as const;

const heroHighlights = [
  {
    title: "بررسی قبل از چاپ",
    description: "فایل و جزئیات سفارش پیش از اجرا کنترل می‌شوند.",
    icon: SearchCheckIcon,
  },
  {
    title: "طراحی متناسب با ایده",
    description: "هر سفارش بر اساس محصول، مناسبت و سلیقه شما آماده می‌شود.",
    icon: PaletteIcon,
  },
  {
    title: "همراهی تا تحویل",
    description: "از انتخاب محصول تا آماده‌سازی و ارسال کنار شما هستیم.",
    icon: HeadsetIcon,
  },
] as const;

const storyMilestones = [
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

const services = [
  {
    title: "طراحی اختصاصی",
    description:
      "تبدیل ایده، عکس یا متن شما به طرحی آماده اجرا و متناسب با محصول.",
    icon: PaletteIcon,
  },
  {
    title: "چاپ روی محصولات",
    description:
      "اجرای طرح روی ماگ، پوشاک، هدایای شخصی و محصولات چاپی متنوع.",
    icon: PrintIcon,
  },
  {
    title: "هدایای شخصی",
    description:
      "ساخت هدیه‌ای متناسب با مناسبت، شخصیت و داستانی که می‌خواهید منتقل کنید.",
    icon: GiftIcon,
  },
  {
    title: "سفارش سازمانی",
    description:
      "طراحی و تولید سفارش‌های هماهنگ برای برندها، مجموعه‌ها و مناسبت‌های سازمانی.",
    icon: BuildingIcon,
  },
  {
    title: "بررسی فایل چاپ",
    description:
      "کنترل ابعاد، کیفیت، رنگ و آماده‌سازی فایل پیش از ورود به مرحله اجرا.",
    icon: SearchCheckIcon,
  },
  {
    title: "مشاوره انتخاب محصول",
    description:
      "انتخاب محصول، روش چاپ و مسیر مناسب بر اساس بودجه و هدف سفارش.",
    icon: MessageIcon,
  },
] as const;

const values = [
  {
    title: "شفافیت",
    description:
      "مراحل سفارش، محدودیت‌های اجرا و زمان آماده‌سازی را روشن توضیح می‌دهیم.",
    icon: EyeIcon,
  },
  {
    title: "دقت",
    description:
      "جزئیات فایل، محصول و خروجی نهایی پیش از تحویل بررسی می‌شوند.",
    icon: TargetIcon,
  },
  {
    title: "شخصی‌سازی",
    description:
      "هر سفارش باید حس و داستان صاحب آن را داشته باشد، نه یک خروجی تکراری.",
    icon: SparklesIcon,
  },
  {
    title: "همراهی",
    description:
      "کاربر در مسیر سفارش تنها نمی‌ماند و برای تصمیم‌های مهم راهنمایی می‌شود.",
    icon: HeartIcon,
  },
] as const;

const processSteps = [
  {
    number: "۰۱",
    title: "ایده و نیازت را می‌گویی",
    description:
      "محصول، مناسبت، متن، تصویر، تعداد و هر نکته مهم را برای ما ارسال می‌کنی.",
    icon: LightbulbIcon,
  },
  {
    number: "۰۲",
    title: "سفارش بررسی می‌شود",
    description:
      "امکان اجرا، فایل‌ها، روش چاپ و جزئیات موردنیاز بررسی و جمع‌بندی می‌شوند.",
    icon: SearchCheckIcon,
  },
  {
    number: "۰۳",
    title: "طرح آماده و تأیید می‌شود",
    description:
      "طرح نهایی متناسب با محصول آماده می‌شود و پیش از چاپ برای تأیید ارائه خواهد شد.",
    icon: PaletteIcon,
  },
  {
    number: "۰۴",
    title: "چاپ، کنترل و ارسال",
    description:
      "بعد از اجرا، کیفیت نهایی بررسی می‌شود و سفارش با بسته‌بندی مناسب ارسال خواهد شد.",
    icon: PackageIcon,
  },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.unobserve(element);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      style={{ "--about-reveal-delay": `${delay}ms` } as CSSProperties}
      className={[
        "about-reveal",
        `about-reveal--${direction}`,
        isVisible ? "about-reveal--visible" : "",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
  align = "right",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "right" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <div
        className={[
          "flex items-center gap-3",
          align === "center" ? "justify-center" : "",
        ].join(" ")}
      >
        <span className="h-1.5 w-12 rounded-full bg-[#c99a52]" />
        <p className="text-[20px] font-black text-[#a16e2d]">{eyebrow}</p>
      </div>

      <h2 className="mt-4 text-[34px] font-black leading-[1.55] text-[#302b27] sm:text-[42px] lg:text-[48px]">
        {title}
      </h2>

      <p className="mt-5 text-[20px] font-medium leading-[2] text-[#746d65] sm:text-[22px]">
        {description}
      </p>
    </div>
  );
}

export default function AboutClient() {
  return (
    <main className="about-experience overflow-hidden bg-[#fbfaf7] text-[#302b27]">
      <section className="relative overflow-hidden border-b border-[#e2d9cd] bg-[#f2eee6]">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="about-grid absolute inset-0 opacity-70" />
          <span className="about-orb about-orb-one absolute -right-44 -top-48 h-[540px] w-[540px] rounded-full bg-[#d2ad70]/20 blur-[105px]" />
          <span className="about-orb about-orb-two absolute -bottom-64 -left-36 h-[520px] w-[520px] rounded-full bg-white/80 blur-[105px]" />
          <span className="absolute left-[42%] top-[18%] h-4 w-4 rotate-45 rounded-[3px] border border-[#b9833d]/35" />
          <span className="absolute left-[45%] top-[25%] h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#b9833d]/30" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1760px] gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)] lg:items-center lg:px-12 lg:py-24">
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
                محصولی قابل لمس و شخصی تبدیل می‌شود.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link
                  href="/design-request"
                  className="about-primary-button group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] bg-[#302c28] px-8 text-[20px] font-black text-white shadow-[0_24px_48px_-28px_rgba(48,44,40,0.75)] outline-none transition-all duration-500 hover:-translate-y-1 hover:bg-[#a87431] focus-visible:ring-4 focus-visible:ring-[#c99a52]/25"
                >
                  <PaletteIcon className="h-7 w-7" />
                  ثبت سفارش اختصاصی
                  <ArrowLeftIcon className="h-6 w-6 transition-transform duration-500 group-hover:-translate-x-1.5" />
                </Link>

                <Link
                  href="/portfolio"
                  className="group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] border border-[#d6c8b4] bg-white/80 px-8 text-[20px] font-black text-[#403a34] outline-none transition-all duration-500 hover:-translate-y-1 hover:border-[#c99a52] hover:bg-white hover:text-[#895a22] focus-visible:ring-4 focus-visible:ring-[#c99a52]/20"
                >
                  <GalleryIcon className="h-7 w-7 text-[#a87431]" />
                  مشاهده نمونه‌کارها
                </Link>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {heroHighlights.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Reveal key={item.title} delay={120 + index * 90}>
                      <article className="group h-full rounded-[22px] border border-white/80 bg-white/65 p-4 shadow-[0_20px_45px_-36px_rgba(62,50,37,0.42)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-[#d2ad70]/70 hover:bg-white">
                        <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#f3e8d7] text-[#98672b] transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105">
                          <Icon className="h-6 w-6" />
                        </span>
                        <h2 className="mt-4 text-[21px] font-black leading-8 text-[#302b27]">
                          {item.title}
                        </h2>
                        <p className="mt-2 text-[20px] font-medium leading-[1.8] text-[#7a726a]">
                          {item.description}
                        </p>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal direction="left" delay={140}>
            <div className="relative mx-auto w-full max-w-[690px]">
              <div className="about-hero-image-card group relative overflow-hidden rounded-[38px] border border-white/80 bg-white/70 p-3 shadow-[0_45px_100px_-58px_rgba(42,35,28,0.9)] backdrop-blur-sm sm:p-4">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[30px]">
                  <Image
                    src="/about/about-hero-side.webp"
                    alt="محصولات چاپی و هدایای اختصاصی چاپی چاپ"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#211d19]/80 via-[#211d19]/10 to-white/10" />

                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_34%)]" />

                  <span className="pointer-events-none absolute inset-4 rounded-[24px] border border-white/35" />

                  

            
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <nav className="sticky top-0 z-30 border-b border-[#e5ddd2] bg-[#fbfaf7]/90 backdrop-blur-xl" aria-label="بخش‌های صفحه درباره ما">
        <div className="mx-auto flex w-full max-w-[1760px] gap-3 overflow-x-auto px-5 py-4 sm:px-8 lg:px-12">
          {navigationItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className="group inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-full border border-[#e0d7cc] bg-white px-5 text-[20px] font-black text-[#625b54] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c99a52] hover:bg-[#f7efe3] hover:text-[#87581f]"
            >
              <span className="text-[#b07a36]">{(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}</span>
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="story" className="scroll-mt-28 border-b border-[#e8e1d8] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid w-full max-w-[1760px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:px-12">
          <Reveal direction="right">
            <div className="lg:sticky lg:top-28">
              <SectionTitle
                eyebrow="داستان برند"
                title="چرا چاپی چاپ شکل گرفت؟"
                description="برای اینکه سفارش چاپ اختصاصی فقط انتخاب یک محصول نباشد؛ بلکه مسیری قابل فهم، خلاقانه و مطمئن از ایده تا تحویل باشد."
              />

              <div className="mt-8 rounded-[28px] border border-[#e0d4c5] bg-[#f5ede1] p-6">
                <p className="text-[21px] font-black leading-9 text-[#7e5523]">
                  «هر سفارش یک محصول نیست؛ بخشی از یک خاطره، مناسبت یا هویت برند است.»
                </p>
              </div>
            </div>
          </Reveal>

          <div className="relative">
            <span className="absolute bottom-12 right-[35px] top-12 hidden w-px bg-gradient-to-b from-[#c99a52] via-[#d9c09a] to-transparent sm:block" />

            <div className="grid gap-5">
              {storyMilestones.map((item, index) => (
                <Reveal key={item.number} direction="left" delay={index * 100}>
                  <article className="group relative grid gap-5 rounded-[30px] border border-[#e3dbd0] bg-white p-6 shadow-[0_22px_55px_-44px_rgba(47,40,33,0.5)] transition-all duration-500 hover:-translate-x-1.5 hover:border-[#d2ad70]/65 hover:shadow-[0_30px_70px_-48px_rgba(83,57,26,0.45)] sm:grid-cols-[72px_1fr] sm:p-7">
                    <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-[22px] border border-[#d5ba8b] bg-[#f5ead9] text-[22px] font-black text-[#925f23] transition-all duration-500 group-hover:rotate-[-5deg] group-hover:bg-[#302c28] group-hover:text-white">
                      {item.number}
                    </span>

                    <div>
                      <h3 className="text-[27px] font-black leading-[1.6] text-[#302b27]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-[20px] font-medium leading-[2] text-[#766f67] sm:text-[21px]">
                        {item.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e8e1d8] bg-[#f3eee6] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionTitle
              eyebrow="ماموریت ما"
              title="طراحی زیبا وقتی ارزشمند است که درست اجرا شود"
              description="ماموریت چاپی چاپ، ساختن ارتباطی دقیق بین ایده، طراحی، محصول و چاپ است تا نتیجه نهایی هم زیبا باشد و هم قابلیت اجرای واقعی داشته باشد."
              align="center"
            />
          </Reveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              {
                title: "انتخاب آگاهانه",
                description:
                  "کمک می‌کنیم محصول و روش چاپ با هدف، بودجه و کاربرد سفارش هماهنگ باشد.",
                icon: CompassIcon,
              },
              {
                title: "طراحی کاربردی",
                description:
                  "طرح فقط برای نمایش ساخته نمی‌شود؛ از ابتدا محدودیت‌ها و کیفیت اجرای واقعی در نظر گرفته می‌شوند.",
                icon: LayersIcon,
              },
              {
                title: "خروجی قابل اعتماد",
                description:
                  "کنترل فایل، هماهنگی جزئیات و بررسی نتیجه نهایی بخش ثابت مسیر سفارش هستند.",
                icon: ShieldCheckIcon,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={index * 100}>
                  <article className="group h-full rounded-[30px] border border-white/80 bg-white/75 p-7 shadow-[0_25px_60px_-48px_rgba(48,40,31,0.48)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#d2ad70]/70 hover:bg-white">
                    <span className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-[#302c28] text-[#e1b976] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#d2ad70] group-hover:text-[#302c28]">
                      <Icon className="h-9 w-9" />
                    </span>
                    <h3 className="mt-6 text-[28px] font-black leading-[1.6] text-[#302b27]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[20px] font-medium leading-[2] text-[#756e66]">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-28 border-b border-[#e8e1d8] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionTitle
              eyebrow="خدمات چاپی چاپ"
              title="برای هر ایده، یک مسیر اجرایی روشن"
              description="از آماده‌سازی یک فایل ساده تا طراحی و اجرای سفارش‌های کاملاً اختصاصی، خدمات به‌صورت یکپارچه در اختیار شما قرار می‌گیرند."
            />
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service, index) => {
              const Icon = service.icon;

              return (
                <Reveal key={service.title} delay={(index % 3) * 90}>
                  <article className="group relative h-full overflow-hidden rounded-[28px] border border-[#e3dbd0] bg-white p-6 shadow-[0_22px_55px_-46px_rgba(49,41,34,0.48)] transition-all duration-500 hover:-translate-y-2 hover:border-[#cfa766] hover:shadow-[0_32px_70px_-48px_rgba(106,72,31,0.42)]">
                    <span className="absolute -left-14 -top-14 h-36 w-36 rounded-full bg-[#d2ad70]/0 blur-[45px] transition-colors duration-700 group-hover:bg-[#d2ad70]/18" />
                    <span className="absolute left-5 top-5 text-[20px] font-black text-[#c7b8a5]">
                      {(index + 1).toLocaleString("fa-IR", {
                        minimumIntegerDigits: 2,
                      })}
                    </span>

                    <span className="relative flex h-[70px] w-[70px] items-center justify-center rounded-[22px] border border-[#e2d3bd] bg-[#f6eddf] text-[#98672b] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:border-[#302c28] group-hover:bg-[#302c28] group-hover:text-[#e5bc76]">
                      <Icon className="h-9 w-9" />
                    </span>

                    <h3 className="relative mt-6 text-[27px] font-black leading-[1.6] text-[#302b27]">
                      {service.title}
                    </h3>
                    <p className="relative mt-3 text-[20px] font-medium leading-[2] text-[#766f67]">
                      {service.description}
                    </p>

                    <span className="relative mt-6 flex items-center gap-3 text-[20px] font-black text-[#9b692b]">
                      مشاهده مسیر سفارش
                      <ArrowLeftIcon className="h-6 w-6 transition-transform duration-500 group-hover:-translate-x-2" />
                    </span>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="values" className="scroll-mt-28 border-b border-[#e8e1d8] bg-[#302c28] py-16 text-white sm:py-20 lg:py-24">
        <div className="relative mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <span className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#d2ad70]/10 blur-[90px]" />
            <span className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-white/[0.04] blur-[100px]" />
          </div>

          <Reveal>
            <div className="relative max-w-4xl">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-12 rounded-full bg-[#d2ad70]" />
                <p className="text-[20px] font-black text-[#e1b976]">ارزش‌های ما</p>
              </div>
              <h2 className="mt-4 text-[34px] font-black leading-[1.55] sm:text-[42px] lg:text-[48px]">
                اصولی که کیفیت تجربه را می‌سازند
              </h2>
              <p className="mt-5 text-[20px] font-medium leading-[2] text-[#c8bdb2] sm:text-[22px]">
                کیفیت فقط به چاپ نهایی محدود نیست؛ نحوه ارتباط، تصمیم‌گیری و
                همراهی در طول مسیر نیز بخشی از نتیجه است.
              </p>
            </div>
          </Reveal>

          <div className="relative mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <Reveal key={value.title} delay={index * 90}>
                  <article className="group h-full rounded-[28px] border border-white/[0.09] bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-[#d2ad70]/45 hover:bg-white/[0.09]">
                    <span className="flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#d2ad70]/25 bg-[#d2ad70]/10 text-[#e2ba77] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#d2ad70] group-hover:text-[#302c28]">
                      <Icon className="h-8 w-8" />
                    </span>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <h3 className="text-[28px] font-black">{value.title}</h3>
                      <span className="text-[20px] font-black text-[#81766b]">
                        {(index + 1).toLocaleString("fa-IR", { minimumIntegerDigits: 2 })}
                      </span>
                    </div>

                    <p className="mt-3 text-[20px] font-medium leading-[2] text-[#c2b7ac]">
                      {value.description}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="process" className="scroll-mt-28 border-b border-[#e8e1d8] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <SectionTitle
              eyebrow="روند همکاری"
              title="از ایده تا محصول نهایی، بدون سردرگمی"
              description="هر مرحله هدف مشخصی دارد و اطلاعات لازم در همان نقطه از شما دریافت می‌شود؛ بنابراین مسیر سفارش کوتاه‌تر و تصمیم‌گیری آسان‌تر خواهد بود."
              align="center"
            />
          </Reveal>

          <div className="relative mt-12">
            <span className="absolute left-[12%] right-[12%] top-[46px] hidden h-px bg-gradient-to-l from-transparent via-[#c99a52] to-transparent xl:block" />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {processSteps.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.number} delay={index * 100}>
                    <article className="group relative h-full rounded-[30px] border border-[#e3dbd0] bg-white p-6 text-center shadow-[0_24px_58px_-48px_rgba(48,40,32,0.52)] transition-all duration-500 hover:-translate-y-2 hover:border-[#cfa766] hover:shadow-[0_34px_75px_-50px_rgba(100,68,30,0.42)]">
                      <span className="relative z-10 mx-auto flex h-[92px] w-[92px] items-center justify-center rounded-full border-[8px] border-[#fbfaf7] bg-[#302c28] text-[#e2b975] shadow-[0_18px_35px_-24px_rgba(48,44,40,0.75)] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#d2ad70] group-hover:text-[#302c28]">
                        <Icon className="h-10 w-10" />
                      </span>

                      <p className="mt-5 text-[20px] font-black text-[#a4702f]">
                        مرحله {item.number}
                      </p>
                      <h3 className="mt-2 text-[26px] font-black leading-[1.6] text-[#302b27]">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-[20px] font-medium leading-[2] text-[#756e66]">
                        {item.description}
                      </p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f2eee6] py-16 sm:py-20">
        <div className="mx-auto w-full max-w-[1760px] px-5 sm:px-8 lg:px-12">
          <Reveal direction="fade">
            <div className="about-final-cta relative overflow-hidden rounded-[36px] border border-[#d2ad70]/35 bg-[#302c28] px-6 py-10 text-white shadow-[0_42px_100px_-58px_rgba(42,35,28,0.9)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14 lg:py-14">
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <span className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#d2ad70]/20 blur-[90px]" />
                <span className="absolute -bottom-44 -left-20 h-80 w-80 rounded-full bg-white/[0.07] blur-[90px]" />
                <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#e8c482] to-transparent" />
              </div>

              <div className="relative max-w-4xl">
                <p className="text-[20px] font-black text-[#dfb978]">شروع یک سفارش خاص</p>
                <h2 className="mt-3 text-[34px] font-black leading-[1.6] sm:text-[42px] lg:text-[48px]">
                  ایده‌ای داری که هنوز شکل نهایی‌اش را نمی‌دانی؟
                </h2>
                <p className="mt-4 text-[20px] font-medium leading-[2] text-[#d0c5ba] sm:text-[22px]">
                  توضیحات، تصویر یا فایل اولیه را بفرست تا مناسب‌ترین محصول و
                  روش اجرا برای آن بررسی شود.
                </p>
              </div>

              <div className="relative mt-8 flex flex-col gap-4 sm:flex-row lg:mt-0 lg:flex-col">
                <Link
                  href="/design-request"
                  className="group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] bg-[#d2ad70] px-8 text-[20px] font-black text-[#302c28] transition-all duration-500 hover:-translate-y-1 hover:bg-white"
                >
                  ثبت درخواست طراحی
                  <ArrowLeftIcon className="h-6 w-6 transition-transform duration-500 group-hover:-translate-x-1.5" />
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[20px] border border-white/15 bg-white/[0.07] px-8 text-[20px] font-black text-white transition-all duration-500 hover:-translate-y-1 hover:border-[#d2ad70]/55 hover:bg-white/[0.12]"
                >
                  دریافت مشاوره
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        .about-experience {
          isolation: isolate;
        }

        .about-grid {
          background-image:
            linear-gradient(rgba(112, 82, 46, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(112, 82, 46, 0.07) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, black, transparent 96%);
        }

        .about-orb-one {
          animation: about-orb-one 14s ease-in-out infinite alternate;
        }

        .about-orb-two {
          animation: about-orb-two 17s ease-in-out infinite alternate;
        }

        .about-hero-panel {
          animation: about-panel-float 6s ease-in-out infinite;
        }

        .about-hero-image-card {
          animation: about-panel-float 6s ease-in-out infinite;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .about-workflow-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.055),
            transparent 75%
          );
          transform: translateX(120%);
          transition: transform 900ms ease;
        }

        .about-workflow-card:hover::after {
          transform: translateX(-120%);
        }

        .about-primary-button {
          position: relative;
          overflow: hidden;
        }

        .about-primary-button::after {
          content: "";
          position: absolute;
          inset-y: 0;
          left: -45%;
          width: 28%;
          transform: skewX(-18deg);
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.35),
            transparent
          );
        }

        .about-primary-button:hover::after {
          animation: about-button-shine 850ms ease-out;
        }

        .about-final-cta::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: radial-gradient(
            circle at 20% 20%,
            rgba(255, 255, 255, 0.08),
            transparent 34%
          );
        }

        .about-reveal {
          opacity: 0;
          filter: blur(6px);
          transition:
            opacity 850ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 850ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 850ms cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--about-reveal-delay, 0ms);
          will-change: opacity, transform, filter;
        }

        .about-reveal--up {
          transform: translate3d(0, 42px, 0);
        }

        .about-reveal--right {
          transform: translate3d(42px, 0, 0);
        }

        .about-reveal--left {
          transform: translate3d(-42px, 0, 0);
        }

        .about-reveal--fade {
          transform: scale(0.975);
        }

        .about-reveal--visible {
          opacity: 1;
          filter: blur(0);
          transform: translate3d(0, 0, 0) scale(1);
        }

        @keyframes about-orb-one {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(-60px, 45px, 0) scale(1.12);
          }
        }

        @keyframes about-orb-two {
          from {
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            transform: translate3d(55px, -40px, 0) scale(1.1);
          }
        }

        @keyframes about-panel-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-7px);
          }
        }

        @keyframes about-button-shine {
          from {
            transform: translateX(0) skewX(-18deg);
          }
          to {
            transform: translateX(620%) skewX(-18deg);
          }
        }

        @media (max-width: 639px) {
          .about-hero-panel,
          .about-hero-image-card {
            animation: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          .about-experience *,
          .about-experience *::before,
          .about-experience *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .about-reveal {
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}

function BaseIcon({
  children,
  ...props
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />
      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
    </BaseIcon>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
    </BaseIcon>
  );
}

function GalleryIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-5-5L5 20" />
    </BaseIcon>
  );
}

function SearchCheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M8 10.5l1.5 1.5L13 8.5" />
    </BaseIcon>
  );
}

function HeadsetIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M18 19h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2v7h1Z" />
      <path d="M6 19H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2v7H6Z" />
      <path d="M18 19c0 1.1-.9 2-2 2h-3" />
    </BaseIcon>
  );
}

function LightbulbIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 18h6M10 22h4" />
      <path d="M8.4 15.5A7 7 0 1 1 15.6 15.5C14.6 16.3 14 17 14 18h-4c0-1-.6-1.7-1.6-2.5Z" />
    </BaseIcon>
  );
}

function PrintIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 8V3h10v5" />
      <path d="M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
    </BaseIcon>
  );
}

function GiftIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M3 9h18v4H3z" />
      <path d="M5 13h14v8H5z" />
      <path d="M12 9v12" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9ZM12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </BaseIcon>
  );
}

function BuildingIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 21V5l8-3v19M12 8h8v13M2 21h20" />
      <path d="M7 7h2M7 11h2M7 15h2M15 12h2M15 16h2" />
    </BaseIcon>
  );
}

function MessageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </BaseIcon>
  );
}

function EyeIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </BaseIcon>
  );
}

function TargetIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </BaseIcon>
  );
}

function HeartIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    </BaseIcon>
  );
}

function PackageIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" />
    </BaseIcon>
  );
}

function CompassIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 5-5 2 2-5 5-2Z" />
    </BaseIcon>
  );
}

function LayersIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
    </BaseIcon>
  );
}

function ShieldCheckIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m8.5 12 2.2 2.2 4.8-5" />
    </BaseIcon>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </BaseIcon>
  );
}
