import Link from "next/link";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(price) || 0,
  );
}

export default function CartHero({
  totalItems,
  totalPrice,
  hasItems,
}: {
  totalItems: number;
  totalPrice: number;
  hasItems: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#E2D9CD] bg-[#F2EEE6]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div className="cart-hero-grid absolute inset-0 opacity-65" />
        <span className="absolute -right-44 -top-52 h-[540px] w-[540px] rounded-full bg-[#D2AD70]/20 blur-[110px]" />
        <span className="absolute -bottom-60 -left-36 h-[500px] w-[500px] rounded-full bg-white/80 blur-[105px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1760px] gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end lg:px-12 lg:py-20">
        <div>
          <div className="inline-flex min-h-[54px] items-center gap-3 rounded-full border border-[#D8C39F] bg-white/75 px-6 text-[20px] font-black text-[#8A5B20] shadow-[0_16px_35px_-28px_rgba(91,63,27,0.45)] backdrop-blur-xl">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E7D5]">
              {totalItems.toLocaleString("fa-IR")}
            </span>
            سبد خرید چاپی چاپ
          </div>

          <h1 className="mt-6 max-w-5xl text-[40px] font-black leading-[1.55] text-[#2D2925] sm:text-[50px] lg:text-[60px]">
            انتخاب‌هایت را مرور کن و
            <span className="mx-3 inline-block text-[#A87431]">
              سفارش را نهایی کن.
            </span>
          </h1>

          <p className="mt-5 max-w-4xl text-[20px] font-medium leading-[2] text-[#6F6861] sm:text-[22px]">
            تعداد، موجودی و مبلغ هر محصول را بررسی کن. هزینه
            ارسال و روش تحویل در مرحله بعد محاسبه خواهد شد.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {[
              ["۰۱", "سبد خرید", true],
              ["۰۲", "اطلاعات تحویل", false],
              ["۰۳", "ثبت سفارش", false],
            ].map(([number, label, active]) => (
              <div
                key={String(label)}
                className={[
                  "inline-flex min-h-[52px] items-center gap-3 rounded-full border px-5 text-[20px] font-black",
                  active
                    ? "border-[#302C28] bg-[#302C28] text-white"
                    : "border-[#D8CFC0] bg-white/70 text-[#756E66]",
                ].join(" ")}
              >
                <span
                  className={
                    active
                      ? "text-[#E3BB78]"
                      : "text-[#A87431]"
                  }
                >
                  {number}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[30px] border border-white/80 bg-white/75 p-6 shadow-[0_30px_80px_-52px_rgba(48,40,32,0.62)] backdrop-blur-xl">
          <p className="text-[20px] font-black text-[#A16E2D]">
            وضعیت فعلی سفارش
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-[22px] border border-[#E3DBD0] bg-[#FBFAF7] p-4">
              <p className="text-[20px] font-bold text-[#756E66]">
                تعداد آیتم
              </p>
              <p className="mt-2 text-[30px] font-black text-[#302B27]">
                {totalItems.toLocaleString("fa-IR")}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#E3DBD0] bg-[#FBFAF7] p-4">
              <p className="text-[20px] font-bold text-[#756E66]">
                مبلغ کالاها
              </p>
              <p className="mt-2 text-[24px] font-black leading-[1.7] text-[#302B27]">
                {formatPrice(totalPrice)} تومان
              </p>
            </div>
          </div>

          <Link
            href="/products"
            className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-[18px] border border-[#D2AD70]/45 bg-[#F6F1E8] px-6 text-[20px] font-black text-[#302B27] transition-all duration-500 hover:-translate-y-1 hover:border-[#D2AD70] hover:bg-white"
          >
            {hasItems
              ? "اضافه‌کردن محصول دیگر"
              : "مشاهده محصولات"}
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .cart-hero-grid {
          background-image:
            linear-gradient(
              rgba(112, 82, 46, 0.07) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(112, 82, 46, 0.07) 1px,
              transparent 1px
            );
          background-size: 38px 38px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 96%
          );
        }
      `}</style>
    </section>
  );
}