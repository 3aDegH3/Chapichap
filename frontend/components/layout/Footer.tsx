import Image from "next/image";
import Link from "next/link";

const designServices = [
  { type: "print", label: "طرح آماده برای چاپ" },
  { type: "custom_print", label: "طرح اختصاصی برای چاپ" },
  { type: "gift", label: "هدیه اختصاصی" },
  { type: "caricature", label: "طراحی کاریکاتور" },
  { type: "consulting", label: "مشاوره طراحی" },
  { type: "other", label: "سایر" },
];

const quickLinks = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "فروشگاه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/design-request", label: "سفارش چاپ دلخواه" },
  { href: "/cart", label: "سبد خرید" },
];

const supportLinks = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/account/orders", label: "پیگیری سفارش" },
  { href: "/account/tickets", label: "پشتیبانی سفارش" },
  { href: "/account/profile", label: "اطلاعات کاربری" },
];

const orderSteps = [
  "ایده و طرح",
  "آماده‌سازی فایل",
  "چاپ تمیز",
  "بسته‌بندی هدیه",
];

const trustItems = [
  "چاپ ماندگار",
  "سفارش تکی و عمده",
  "پشتیبانی قبل از چاپ",
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center justify-between gap-4 rounded-xl px-1 py-2 text-sm font-bold text-[#6F6A63] transition duration-300 hover:text-[#333230]"
    >
      <span>{label}</span>
      <span className="h-px w-5 bg-[#D2AD70]/55 transition duration-300 group-hover:w-8 group-hover:bg-[#B2894C]" />
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-[#E3DED5] bg-[#FAFAF8]">
      <div className="h-[3px] bg-gradient-to-l from-[#333230] via-[#D2AD70] to-[#333230]" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[1.75rem] border border-[#D8CFC0] bg-[#333230] text-white shadow-[0_28px_80px_-58px_rgba(51,50,48,0.85)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_390px]">
            <div className="p-6 sm:p-8 lg:p-10">
              <Link
                href="/"
                className="inline-flex items-center gap-4"
                aria-label="صفحه اصلی چاپی چاپ"
              >
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D2AD70]/45 bg-[#FAFAF8]">
                  <Image
                    src="/brand/logo.png"
                    alt="لوگوی چاپی چاپ"
                    width={128}
                    height={128}
                    className="h-full w-full object-contain"
                  />
                </span>

                <span>
                  <span className="block text-2xl font-black">چاپی چاپ</span>
                  <span className="mt-1 block text-xs font-black text-[#D2AD70]">
                    طراحی · چاپ · هدیه
                  </span>
                </span>
              </Link>

              <h2 className="mt-7 max-w-2xl text-2xl font-black leading-[1.65] sm:text-3xl">
                ایده‌ات را بفرست؛ ما آن را به یک هدیه چاپی خوش‌ساخت تبدیل
                می‌کنیم.
              </h2>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-white/68">
                از انتخاب محصول تا آماده‌سازی فایل چاپ، کنار سفارش هستیم تا
                خروجی نهایی تمیز، شخصی و مناسب هدیه دادن باشد.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/design-request"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E1BF83]"
                >
                  ثبت سفارش اختصاصی
                </Link>

                <Link
                  href="/products"
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/18 bg-white/[0.06] px-6 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#D2AD70]/55 hover:bg-white/[0.1]"
                >
                  مشاهده محصولات
                </Link>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#2B2925] p-6 sm:p-8 lg:border-r lg:border-t-0">
              <p className="text-xs font-black text-[#D2AD70]">
                مسیر سفارش
              </p>

              <div className="mt-5 grid gap-3">
                {orderSteps.map((step, index) => (
                  <div
                    key={step}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D2AD70] text-xs font-black text-[#333230]">
                      {(index + 1).toLocaleString("fa-IR", {
                        minimumIntegerDigits: 2,
                      })}
                    </span>
                    <span className="text-sm font-black text-white/86">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 border-b border-[#E3DED5] py-10 md:grid-cols-2 lg:grid-cols-[1.15fr_0.9fr_0.9fr_1fr]">
          <div>
            <p className="text-sm font-black text-[#333230]">درباره چاپی چاپ</p>
            <p className="mt-4 max-w-sm text-sm font-medium leading-8 text-[#77736D]">
              چاپ و آماده‌سازی هدیه‌های اختصاصی برای آدم‌هایی که دوست دارند
              سفارششان جزئیات شخصی و ظاهر مرتب داشته باشد.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {trustItems.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#E3DED5] bg-white px-3 py-1.5 text-xs font-black text-[#6F6A63]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black text-[#333230]">مسیرهای اصلی</p>
            <div className="mt-4 grid gap-1">
              {quickLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black text-[#333230]">خدمات مشتریان</p>
            <div className="mt-4 grid gap-1">
              {supportLinks.map((link) => (
                <FooterLink key={link.href} {...link} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-black text-[#333230]">طراحی اختصاصی</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {designServices.map((service) => (
                <Link
                  key={service.type}
                  href={`/design-request?type=${service.type}`}
                  className="rounded-full border border-[#D8CFC0] bg-[#F6F1E8] px-3 py-1.5 text-xs font-black text-[#333230] transition duration-300 hover:border-[#D2AD70] hover:bg-white"
                >
                  {service.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-[#D2AD70]/35 bg-white p-4">
              <p className="text-sm font-black text-[#333230]">
                سفارش خاص داری؟
              </p>
              <p className="mt-2 text-xs font-medium leading-7 text-[#77736D]">
                طرح، عکس یا مناسبت را بفرست تا بهترین مسیر اجرا را پیشنهاد
                کنیم.
              </p>
              <Link
                href="/design-request"
                className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-[#D2AD70] px-4 text-xs font-black text-[#333230] shadow-[0_12px_24px_-18px_rgba(178,137,76,0.85)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C]"
              >
                ارسال ایده
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-5 text-xs font-bold text-[#77736D] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © تمام حقوق برای{" "}
            <span className="font-black text-[#333230]">چاپی چاپ</span> محفوظ
            است.
          </p>

          <p className="text-[#B2894C]">
            هدیه‌ای شخصی، چاپی تمیز، تجربه‌ای ماندگار
          </p>
        </div>
      </div>
    </footer>
  );
}
