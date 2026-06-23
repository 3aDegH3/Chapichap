import Image from "next/image";
import Link from "next/link";

const services = [
  "چاپ روی تیشرت",
  "چاپ روی ماگ",
  "قاب موبایل",
  "چاپ روی کوسن",
  "هدیه اختصاصی",
];

const quickLinks = [
  { href: "/", label: "خانه" },
  { href: "/products", label: "فروشگاه" },
  { href: "/portfolio", label: "نمونه‌کارها" },
  { href: "/design-request", label: "سفارش چاپ دلخواه" },
  { href: "/cart", label: "سبد خرید" },
];

const supportLinks = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/account/orders", label: "پیگیری سفارش" },
  { href: "/account/tickets", label: "پشتیبانی سفارش" },
  { href: "/account/profile", label: "اطلاعات کاربری" },
];

const features = [
  { value: "01", label: "چاپ باکیفیت و ماندگار" },
  { value: "02", label: "طراحی مطابق ایده شما" },
  { value: "03", label: "سفارش تکی و عمده" },
  { value: "04", label: "بسته‌بندی مناسب هدیه" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[#E3DED5] bg-[#F2EEE6]">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-l from-[#333230] via-[#D2AD70] to-[#333230]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#D8CFC0] bg-[#FAFAF8] shadow-[0_24px_70px_-42px_rgba(51,50,48,0.65)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.45fr)]">
            <div className="border-b border-[#E3DED5] p-6 sm:p-8 lg:border-b-0 lg:border-l">
              <Link
                href="/"
                className="inline-flex items-center gap-4"
                aria-label="Chapi Chap"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#D2AD70]/60 bg-white shadow-[0_16px_34px_-24px_rgba(51,50,48,0.75)]">
                  <Image
                    src="/brand/logo.png"
                    alt="لوگوی چاپی چاپ"
                    width={160}
                    height={160}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <p className="text-2xl font-black text-[#333230]">
                    چاپی چاپ
                  </p>
                  <p className="mt-1 text-sm font-black text-[#B2894C]">
                    طراحی، چاپ، هدیه
                  </p>
                </div>
              </Link>

              <p className="mt-6 max-w-xl text-sm font-medium leading-8 text-[#77736D]">
                ایده‌ات را بفرست؛ ما آن را روی تیشرت، ماگ، قاب و هدیه‌ای
                ماندگار با جزئیات تمیز و بسته‌بندی شایسته اجرا می‌کنیم.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {services.map((service) => (
                  <span
                    key={service}
                    className="rounded-lg border border-[#E3DED5] bg-white px-3 py-1.5 text-xs font-black text-[#333230] transition duration-300 hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <p className="border-b border-[#E3DED5] pb-3 text-sm font-black text-[#333230]">
                    مسیرهای اصلی
                  </p>

                  <div className="mt-4 grid gap-1 text-sm font-bold text-[#77736D]">
                    {quickLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group inline-flex items-center justify-between rounded-lg px-2 py-2 transition duration-300 hover:bg-[#F6F1E8] hover:text-[#333230]"
                      >
                        <span>{link.label}</span>
                        <span className="h-px w-6 bg-[#D2AD70]/55 transition duration-300 group-hover:w-10 group-hover:bg-[#B2894C]" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="border-b border-[#E3DED5] pb-3 text-sm font-black text-[#333230]">
                    خدمات مشتریان
                  </p>

                  <div className="mt-4 grid gap-1 text-sm font-bold text-[#77736D]">
                    {supportLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group inline-flex items-center justify-between rounded-lg px-2 py-2 transition duration-300 hover:bg-[#F6F1E8] hover:text-[#333230]"
                      >
                        <span>{link.label}</span>
                        <span className="h-px w-6 bg-[#D2AD70]/55 transition duration-300 group-hover:w-10 group-hover:bg-[#B2894C]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl border border-[#D2AD70]/35 bg-[#F6F1E8] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-black text-[#333230]">
                      سفارش اختصاصی داری؟
                    </p>
                    <p className="mt-2 text-sm font-medium leading-7 text-[#77736D]">
                      طرح، مناسبت یا محصولت را بفرست تا مسیر چاپ را دقیق شروع
                      کنیم.
                    </p>
                  </div>

                  <Link
                    href="/design-request"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-[#D2AD70] bg-white px-5 text-sm font-black text-[#333230] shadow-[0_12px_26px_-22px_rgba(51,50,48,0.7)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D2AD70]/18"
                  >
                    شروع سفارش
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid border-t border-[#E3DED5] sm:grid-cols-2 lg:grid-cols-4">
            {features.map((item) => (
              <div
                key={item.label}
                className="border-b border-[#E3DED5] px-5 py-4 sm:border-l lg:border-b-0"
              >
                <p className="text-xs font-black text-[#B2894C]">
                  {Number(item.value).toLocaleString("fa-IR", {
                    minimumIntegerDigits: 2,
                  })}
                </p>
                <p className="mt-2 text-sm font-black leading-7 text-[#333230]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-[#E3DED5] px-5 py-4 text-xs font-bold text-[#77736D] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © تمام حقوق برای{" "}
              <span className="font-black text-[#333230]">چاپی چاپ</span>{" "}
              محفوظ است.
            </p>

            <p className="text-[#B2894C]">هدیه‌ای شخصی، چاپی تمیز، تجربه‌ای ماندگار</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
