import Image from "next/image";
import Link from "next/link";

export default function AboutHero() {
  return (
    <section className="bg-[#F2EEE6]">
      <div className="mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-8 lg:py-20">
        <div>
          <p className="text-sm font-black text-[#B2894C]">درباره چاپی چاپ</p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-[1.45] text-[#333230] sm:text-5xl">
            ایده‌های شما را به هدیه‌های ماندگار تبدیل می‌کنیم
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-9 text-[#77736D]">
            چاپی چاپ یک تیم تازه، خلاق و حرفه‌ای در زمینه طراحی، چاپ و تولید
            هدایای اختصاصی است. ما کمک می‌کنیم تصویر، خاطره یا ایده شما به
            محصولی واقعی و شخصی تبدیل شود.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/design-request"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] shadow-[0_16px_30px_-22px_rgba(178,137,76,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C]"
            >
              ثبت سفارش اختصاصی
            </Link>
            <Link
              href="/portfolio"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D8CFC0] bg-white px-6 text-sm font-black text-[#333230] transition duration-300 hover:-translate-y-0.5 hover:border-[#D2AD70] hover:bg-[#FAFAF8]"
            >
              دیدن نمونه‌کارها
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-[#D8CFC0] bg-[#FAFAF8] p-5 shadow-[0_26px_70px_-52px_rgba(51,50,48,0.75)]">
          <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#D2AD70_0_28px,#333230_28px_56px,#FAFAF8_56px_84px)]" />
          <div className="pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black text-[#B2894C]">
                  استودیو چاپ و هدیه
                </p>
                <p className="mt-2 text-xl font-black text-[#333230]">
                  Chapi Chap
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[#D2AD70]/45 bg-white">
                <Image
                  src="/brand/logo.png"
                  alt="لوگوی چاپی چاپ"
                  width={128}
                  height={128}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["ماگ", "عکس و متن شخصی"],
                ["تیشرت", "طرح آماده چاپ"],
                ["هدیه", "بسته‌بندی مرتب"],
                ["طراحی", "آماده‌سازی فایل"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#E3DED5] bg-white p-4"
                >
                  <p className="text-sm font-black text-[#333230]">{title}</p>
                  <p className="mt-2 text-xs font-bold leading-6 text-[#77736D]">
                    {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-[#333230] p-5 text-white">
              <p className="text-sm font-black text-[#D2AD70]">
                از ایده تا محصول
              </p>
              <p className="mt-2 text-sm font-medium leading-7 text-white/70">
                طرح را بررسی می‌کنیم، برای چاپ آماده می‌کنیم و محصول نهایی را
                با جزئیات تمیز تحویل می‌دهیم.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
