import Link from "next/link";

const services = [
  "چاپ روی تیشرت",
  "چاپ روی ماگ",
  "قاب موبایل",
  "چاپ روی کوسن",
  "پرینتر سه‌بعدی",
];

const quickLinks = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "محصولات" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/design-request", label: "سفارش طراحی" },
];

const supportLinks = [
  { href: "/faq", label: "سوالات متداول" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
  { href: "/account", label: "حساب کاربری" },
];

const features = [
  { icon: "🛡️", label: "چاپ باکیفیت" },
  { icon: "🎨", label: "طراحی اختصاصی" },
  { icon: "🚚", label: "ارسال سریع" },
  { icon: "⭐", label: "رضایت مشتریان" },
  { icon: "💬", label: "پشتیبانی پاسخگو" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-sky-100 bg-white">
      {/* Bottom gradient ribbon — mirrors the header (blue dominant) */}
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-l from-[#00AEEF] via-[#0090C8] to-[#00AEEF]" />
      <div className="absolute inset-x-0 bottom-[3px] h-px bg-gradient-to-l from-transparent via-[#E6007E]/30 to-transparent" />

      {/* Ambient blue glows */}
      <div className="pointer-events-none absolute -left-20 -top-10 h-44 w-44 rounded-full bg-[#00AEEF]/12 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-20 h-40 w-40 rounded-full bg-[#00AEEF]/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-24 -translate-x-1/2 rounded-full bg-[#FFD100]/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-sky-200/70 bg-gradient-to-br from-sky-50/80 via-white to-sky-50/50 p-6 shadow-[0_18px_50px_-20px_rgba(0,174,239,0.35)] sm:p-8">
          <div className="grid gap-10 md:grid-cols-4">
            {/* ===== Brand ===== */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-sky-200 bg-gradient-to-br from-[#00AEEF] to-[#0090C8] shadow-[0_10px_28px_-8px_rgba(0,174,239,0.6)] sm:h-16 sm:w-16">
                  <span className="text-2xl font-black text-white drop-shadow">
                    چ
                  </span>

                  <span className="absolute -bottom-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#FFD100] text-[10px] font-black text-[#1A1A1A] shadow-md">
                    ★
                  </span>
                </div>

                <div>
                  <p className="text-xl font-black tracking-tight text-[#1A1A1A] sm:text-2xl">
                    Chapi chap
                  </p>
                  <p className="mt-0.5 text-xs font-black text-[#00AEEF] sm:text-sm">
                    خدمات چاپ و هدایای اختصاصی
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-xl text-sm font-medium leading-8 text-gray-600">
                چاپی‌چاپ جاییه که طرح، رنگ و ایده‌های شخصی تبدیل به هدیه‌های خاص
                می‌شن؛ از ماگ و تیشرت تا قاب موبایل، کوسن و محصولات سفارشی.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-sky-200/80 bg-white px-3 py-1.5 text-xs font-black text-[#0090C8] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#00AEEF] hover:text-[#00AEEF] hover:shadow-[0_8px_18px_-6px_rgba(0,174,239,0.4)]"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* ===== Quick Links ===== */}
            <div>
              <p className="inline-flex items-center rounded-full border border-sky-200/80 bg-gradient-to-l from-[#00AEEF] to-[#0090C8] px-4 py-2 text-sm font-black text-white shadow-[0_8px_20px_-6px_rgba(0,174,239,0.55)]">
                دسترسی سریع
              </p>

              <div className="mt-5 grid gap-1 text-sm font-bold text-gray-600">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition duration-300 hover:bg-sky-50 hover:text-[#00AEEF]"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#00AEEF]/40 transition duration-300 group-hover:w-3 group-hover:bg-[#00AEEF]" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* ===== Support Links ===== */}
            <div>
              <p className="inline-flex items-center rounded-full border border-sky-200/80 bg-white px-4 py-2 text-sm font-black text-[#00AEEF] shadow-[0_8px_20px_-10px_rgba(0,174,239,0.4)]">
                پشتیبانی
              </p>

              <div className="mt-5 grid gap-1 text-sm font-bold text-gray-600">
                {supportLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition duration-300 hover:bg-sky-50 hover:text-[#00AEEF]"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#00AEEF]/40 transition duration-300 group-hover:w-3 group-hover:bg-[#00AEEF]" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Feature Strip ===== */}
          <div className="mt-8 grid gap-3 border-t border-sky-100 pt-6 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((item) => (
              <div
                key={item.label}
                className="group flex items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-white px-3 py-3 text-xs font-black text-[#1A1A1A] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#00AEEF] hover:shadow-[0_10px_22px_-8px_rgba(0,174,239,0.4)]"
              >
                <span className="text-base transition duration-300 group-hover:scale-110">
                  {item.icon}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* ===== Copyright ===== */}
        <div className="py-5 text-center text-xs font-bold text-gray-500">
          © تمام حقوق برای{" "}
          <span className="font-black text-[#00AEEF]">Chapi chap</span> محفوظ
          است.
        </div>
      </div>
    </footer>
  );
}
