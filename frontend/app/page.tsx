import Image from "next/image";
import Link from "next/link";

const heroStats = [
  { value: "+۴۸", label: "ساعت آماده‌سازی سریع" },
  { value: "۳۰۰dpi", label: "کنترل فایل چاپ" },
  { value: "هدیه", label: "بسته‌بندی قابل سفارش" },
];

const serviceTicker = [
  "چاپ ماگ",
  "تیشرت سفارشی",
  "هدیه سازمانی",
  "طراحی اختصاصی",
  "چاپ قاب و تابلو",
  "ست هدیه",
  "فایل آماده چاپ",
  "پشتیبانی سفارش",
];

const productStories = [
  {
    title: "هدیه شخصی",
    description: "برای تولد، سالگرد، یادگاری و هر مناسبتی که یک طرح اختصاصی می‌خواهد.",
    accent: "bg-[#E85D45]",
    href: "/products?gift=personal",
  },
  {
    title: "چاپ روزمره",
    description: "ماگ، پوشاک و آیتم‌های کاربردی با کیفیت چاپ تمیز و قابل سفارش تکی.",
    accent: "bg-[#167A7F]",
    href: "/products?type=mug",
  },
  {
    title: "سفارش سازمانی",
    description: "هدیه تبلیغاتی، پک رویداد و محصولات برندینگ برای تیم‌ها و کسب‌وکارها.",
    accent: "bg-[#2F4F7F]",
    href: "/products?gift=corporate",
  },
];

const showcaseItems = [
  { title: "ماگ عکس‌دار", tone: "from-[#FFF7EC] to-[#E4F3F1]" },
  { title: "تیشرت طراحی‌شده", tone: "from-[#F5F7FF] to-[#FFF0EC]" },
  { title: "ست هدیه برند", tone: "from-[#F1F7F3] to-[#F8F1FF]" },
];

const processSteps = [
  { title: "انتخاب", meta: "محصول یا مسیر طراحی" },
  { title: "طرح", meta: "ارسال فایل یا ایده" },
  { title: "بررسی", meta: "کنترل کیفیت چاپ" },
  { title: "چاپ", meta: "آماده‌سازی سفارش" },
  { title: "تحویل", meta: "ارسال یا دریافت حضوری" },
];

const qualityItems = [
  "هماهنگی قبل از چاپ",
  "ثبت سفارش مرحله‌به‌مرحله",
  "پیگیری وضعیت سفارش",
  "طراحی اختصاصی برای فایل ناقص",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#FAFAF8] text-[#333230]">
      <section className="relative min-h-[calc(100svh-80px)] border-b border-[#E3DED5] bg-[#F7F2EA]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="home-hero-grid absolute inset-0 opacity-70" />
          <div className="home-paper-strip absolute -right-16 top-20 h-24 w-[120%] -rotate-3 bg-white/72 shadow-[0_20px_70px_-55px_rgba(51,50,48,0.55)]" />
          <div className="home-paper-strip absolute -left-20 bottom-24 h-24 w-[110%] rotate-2 bg-[#E8F5F3]/72 shadow-[0_20px_70px_-55px_rgba(51,50,48,0.55)]" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100svh-80px)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.94fr)_minmax(420px,1.06fr)] lg:px-8">
          <div className="home-fade-up max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#D8CFC0] bg-white/78 px-3 py-2 shadow-[0_18px_50px_-42px_rgba(51,50,48,0.65)] backdrop-blur">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                <Image
                  src="/brand/logo.webp"
                  alt="لوگوی چاپی چاپ"
                  width={72}
                  height={72}
                  priority
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="text-xs font-black text-[#6F6A63]">
                چاپ · طراحی · هدیه اختصاصی
              </span>
            </div>

            <h1 className="mt-8 max-w-4xl text-4xl font-black leading-[1.3] text-[#252421] sm:text-6xl lg:text-7xl">
              هر طرحی می‌تواند به یک هدیه ماندگار تبدیل شود
            </h1>

            <p className="mt-6 max-w-2xl text-base font-medium leading-9 text-[#68625B] sm:text-lg">
              چاپی چاپ مسیر انتخاب محصول، آماده‌سازی فایل، چاپ و تحویل را ساده
              می‌کند تا خروجی نهایی تمیز، شخصی و مناسب هدیه دادن باشد.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#252421] px-7 text-sm font-black text-white shadow-[0_22px_45px_-30px_rgba(51,50,48,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C]"
              >
                انتخاب محصول
              </Link>
              <Link
                href="/design-request"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D8CFC0] bg-white px-7 text-sm font-black text-[#333230] shadow-[0_18px_45px_-36px_rgba(51,50,48,0.65)] transition duration-300 hover:-translate-y-0.5 hover:border-[#D2AD70] hover:bg-[#FFF8ED]"
              >
                درخواست طراحی اختصاصی
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {heroStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/62 px-4 py-3 shadow-[0_18px_55px_-46px_rgba(51,50,48,0.65)] backdrop-blur"
                >
                  <p className="text-lg font-black text-[#252421]">{item.value}</p>
                  <p className="mt-1 text-xs font-bold text-[#77736D]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="home-fade-up home-fade-delay relative min-h-[520px] lg:min-h-[640px]">
            <div className="home-float-soft absolute left-0 top-5 w-[78%] max-w-[520px] rounded-[2rem] border border-white/70 bg-white/72 p-4 shadow-[0_34px_90px_-58px_rgba(51,50,48,0.9)] backdrop-blur-xl sm:left-8">
              <div className="overflow-hidden rounded-[1.5rem] border border-[#E3DED5] bg-gradient-to-br from-[#FFF9EF] via-white to-[#E8F5F3] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-[#B2894C]">سفارش امروز</p>
                    <h2 className="mt-2 text-2xl font-black text-[#252421]">ماگ خاطره</h2>
                  </div>
                  <span className="rounded-full bg-[#167A7F] px-3 py-1 text-xs font-black text-white">
                    آماده چاپ
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-[0.88fr_1.12fr] items-end gap-5">
                  <div className="relative mx-auto h-48 w-32">
                    <div className="absolute inset-x-4 top-0 h-9 rounded-full bg-[#2F4F7F]" />
                    <div className="absolute inset-x-0 top-4 h-40 rounded-b-[2.2rem] rounded-t-xl border-8 border-[#2F4F7F] bg-white shadow-[inset_0_-28px_44px_-34px_rgba(47,79,127,0.7)]" />
                    <div className="absolute -left-8 top-14 h-20 w-12 rounded-l-full border-8 border-r-0 border-[#2F4F7F]" />
                    <div className="absolute right-6 top-16 h-12 w-14 rounded-xl bg-[#E85D45]" />
                    <div className="absolute right-10 top-32 h-2 w-16 rounded-full bg-[#D2AD70]" />
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl bg-white/78 p-4">
                      <p className="text-xs font-bold text-[#77736D]">فایل چاپ</p>
                      <div className="mt-3 h-2 rounded-full bg-[#E3DED5]">
                        <div className="home-progress h-full rounded-full bg-[#167A7F]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#252421] p-4 text-white">
                        <p className="text-xs text-white/62">کیفیت</p>
                        <p className="mt-1 font-black">۳۰۰dpi</p>
                      </div>
                      <div className="rounded-2xl bg-[#FFF0EC] p-4">
                        <p className="text-xs text-[#8E5749]">زمان</p>
                        <p className="mt-1 font-black text-[#333230]">۲ روز</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="home-float-soft home-float-delay absolute bottom-8 right-0 w-[70%] max-w-[440px] rounded-[1.75rem] border border-[#D8CFC0] bg-[#252421] p-5 text-white shadow-[0_30px_90px_-58px_rgba(51,50,48,0.95)]">
              <p className="text-xs font-black text-[#D2AD70]">مسیر سفارش</p>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="text-center">
                    <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/16 bg-white/8 text-xs font-black">
                      {(index + 1).toLocaleString("fa-IR")}
                    </div>
                    <p className="mt-2 text-[11px] font-black text-white/82">{step.title}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-float-soft home-float-delay-2 absolute left-8 bottom-28 hidden w-44 rounded-[1.5rem] border border-white/70 bg-white/82 p-4 shadow-[0_24px_70px_-48px_rgba(51,50,48,0.9)] backdrop-blur sm:block">
              <p className="text-xs font-black text-[#77736D]">پالت چاپ</p>
              <div className="mt-4 flex gap-2">
                <span className="h-9 w-9 rounded-full bg-[#E85D45]" />
                <span className="h-9 w-9 rounded-full bg-[#167A7F]" />
                <span className="h-9 w-9 rounded-full bg-[#D2AD70]" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-y border-[#E3DED5] bg-white/76 py-3 backdrop-blur">
          <div className="home-marquee flex w-max gap-3 whitespace-nowrap">
            {[...serviceTicker, ...serviceTicker].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="rounded-full border border-[#E3DED5] bg-[#FAFAF8] px-4 py-2 text-xs font-black text-[#6F6A63]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-black text-[#B2894C]">انتخاب سریع</p>
              <h2 className="mt-3 max-w-xl text-3xl font-black leading-snug text-[#252421] sm:text-4xl">
                از حس هدیه شروع کن، نه از اسم محصول
              </h2>
            </div>
            <p className="max-w-2xl text-sm font-medium leading-8 text-[#77736D] lg:mr-auto">
              دسته‌ها بر اساس کاربرد چیده شده‌اند تا کاربر سریع‌تر بفهمد برای
              چه موقعیتی باید از کجا شروع کند.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {productStories.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative overflow-hidden rounded-[1.5rem] border border-[#E3DED5] bg-[#FAFAF8] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D2AD70] hover:shadow-[0_24px_70px_-52px_rgba(51,50,48,0.8)]"
              >
                <span className={`block h-2 w-16 rounded-full ${item.accent}`} />
                <h3 className="mt-8 text-xl font-black text-[#252421] transition group-hover:text-[#B2894C]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-8 text-[#77736D]">
                  {item.description}
                </p>
                <span className="mt-7 inline-flex h-11 items-center rounded-xl border border-[#E3DED5] bg-white px-4 text-sm font-black text-[#333230] transition group-hover:border-[#D2AD70] group-hover:bg-[#FFF8ED]">
                  دیدن محصولات
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E3DED5] bg-[#F7F2EA] py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black text-[#B2894C]">نمونه حس خروجی</p>
              <h2 className="mt-3 text-3xl font-black text-[#252421] sm:text-4xl">
                چاپ تمیز، بدون شلوغی اضافه
              </h2>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D8CFC0] bg-white px-5 text-sm font-black text-[#333230] transition duration-300 hover:-translate-y-0.5 hover:border-[#D2AD70] hover:bg-[#FFF8ED]"
            >
              مشاهده نمونه‌کارها
            </Link>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {showcaseItems.map((item, index) => (
              <article
                key={item.title}
                className="group overflow-hidden rounded-[1.75rem] border border-white/80 bg-white p-3 shadow-[0_22px_70px_-56px_rgba(51,50,48,0.8)] transition duration-300 hover:-translate-y-1"
              >
                <div className={`relative aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-gradient-to-br ${item.tone}`}>
                  <div className="absolute inset-x-8 top-8 h-10 rounded-2xl bg-white/72" />
                  <div className="absolute bottom-8 right-8 h-32 w-24 rounded-[1.5rem] bg-white shadow-[0_20px_50px_-36px_rgba(51,50,48,0.65)]">
                    <div className="mx-auto mt-6 h-10 w-10 rounded-xl bg-[#252421]" />
                    <div className="mx-auto mt-5 h-2 w-14 rounded-full bg-[#D2AD70]" />
                    <div className="mx-auto mt-2 h-2 w-10 rounded-full bg-[#E3DED5]" />
                  </div>
                  <div className="absolute bottom-10 left-8 grid gap-2">
                    <span className="h-5 w-24 rounded-full bg-[#E85D45]/80" />
                    <span className="h-5 w-16 rounded-full bg-[#167A7F]/80" />
                  </div>
                  <span className="absolute left-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black text-[#333230]">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-lg font-black text-[#252421]">{item.title}</h3>
                  <p className="mt-2 text-sm font-medium text-[#77736D]">
                    آماده برای سفارش شخصی یا سازمانی
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-18 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black text-[#B2894C]">مسیر سفارش</p>
            <h2 className="mt-3 text-3xl font-black text-[#252421] sm:text-4xl">
              از انتخاب تا تحویل، روشن و قابل پیگیری
            </h2>
          </div>

          <div className="relative mt-12">
            <div className="absolute left-0 right-0 top-9 hidden h-px bg-[#D8CFC0] md:block" />
            <div className="grid gap-4 md:grid-cols-5">
              {processSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="relative rounded-[1.35rem] border border-[#E3DED5] bg-[#FAFAF8] p-5 text-center shadow-[0_18px_50px_-42px_rgba(51,50,48,0.65)]"
                >
                  <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D2AD70]/45 bg-white text-lg font-black text-[#B2894C]">
                    {(index + 1).toLocaleString("fa-IR")}
                  </div>
                  <h3 className="mt-5 font-black text-[#252421]">{step.title}</h3>
                  <p className="mt-1 text-xs font-bold text-[#77736D]">{step.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#252421] py-18 text-white sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-black text-[#D2AD70]">چرا چاپی چاپ؟</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black leading-snug sm:text-4xl">
              ظرافت طراحی، نظم سفارش، خیال راحت قبل از چاپ
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {qualityItems.map((item) => (
              <div
                key={item}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-5"
              >
                <span className="block h-2 w-12 rounded-full bg-[#D2AD70]" />
                <p className="mt-5 font-black text-white/92">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FAFAF8] px-4 py-18 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#D8CFC0] bg-white p-6 shadow-[0_30px_90px_-62px_rgba(51,50,48,0.85)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <p className="text-sm font-black text-[#B2894C]">شروع سفارش</p>
              <h2 className="mt-3 text-3xl font-black leading-snug text-[#252421] sm:text-4xl">
                محصول را انتخاب کن یا ایده خامت را برای طراحی بفرست
              </h2>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-[#77736D]">
                اگر فایل آماده داری مستقیم سفارش بده؛ اگر فقط ایده داری، تیم
                طراحی مسیر چاپ را برایت آماده می‌کند.
              </p>
            </div>

            <div className="grid gap-3">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#252421] px-6 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C]"
              >
                رفتن به فروشگاه
              </Link>
              <Link
                href="/design-request"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D8CFC0] bg-[#F7F2EA] px-6 text-sm font-black text-[#333230] transition duration-300 hover:-translate-y-0.5 hover:border-[#D2AD70] hover:bg-white"
              >
                ثبت درخواست طراحی
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
