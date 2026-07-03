import Link from "next/link";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(
    Number(price) || 0,
  );
}

export default function CartSummary({
  totalItems,
  totalPrice,
  issueCount,
  canCheckout,
  checkoutHref,
  isAuthenticated,
  isSyncing,
}: {
  totalItems: number;
  totalPrice: number;
  issueCount: number;
  canCheckout: boolean;
  checkoutHref: string;
  isAuthenticated: boolean;
  isSyncing: boolean;
}) {
  return (
    <aside className="cart-summary-enter h-fit overflow-hidden rounded-[30px] border border-[#D8CFC0] bg-white shadow-[0_28px_75px_-48px_rgba(48,40,32,0.72)] lg:sticky lg:top-28">
      <div className="border-b border-[#E9E1D7] bg-[#302C28] p-6 text-white">
        <p className="text-[20px] font-black text-[#E1B976]">
          مرحله بعد
        </p>

        <h2 className="mt-2 text-[32px] font-black leading-[1.55]">
          خلاصه سفارش
        </h2>

        <p className="mt-3 text-[20px] font-medium leading-[1.85] text-white/70">
          پیش از ورود به تسویه حساب، مبلغ و موجودی
          کالاها را بررسی کن.
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-4">
          <SummaryRow
            label="تعداد آیتم‌ها"
            value={totalItems.toLocaleString("fa-IR")}
          />

          <SummaryRow
            label="جمع کالاها"
            value={`${formatPrice(totalPrice)} تومان`}
          />

          <SummaryRow
            label="هزینه ارسال"
            value="مرحله بعد"
          />
        </div>

        <div className="mt-6 rounded-[22px] border border-[#E3DBD0] bg-[#FBFAF7] p-5">
          <p className="text-[20px] font-bold text-[#756E66]">
            مبلغ فعلی
          </p>

          <p className="mt-2 text-[32px] font-black leading-[1.55] text-[#302B27]">
            {formatPrice(totalPrice)} تومان
          </p>

          <p className="mt-2 text-[20px] font-medium leading-[1.8] text-[#8A8178]">
            مبلغ نهایی بعد از انتخاب روش تحویل و کد
            پیشنهاد محاسبه می‌شود.
          </p>
        </div>

        {issueCount > 0 && (
          <p className="mt-5 rounded-[18px] border border-red-200 bg-red-50 px-4 py-4 text-[20px] font-bold leading-[1.85] text-red-700">
            موجودی یا تعداد{" "}
            {issueCount.toLocaleString("fa-IR")} محصول
            نیاز به اصلاح دارد.
          </p>
        )}

        {!isAuthenticated && canCheckout && (
          <p className="mt-5 rounded-[18px] border border-[#D2AD70]/40 bg-[#F6F1E8] px-4 py-4 text-[20px] font-bold leading-[1.85] text-[#85591F]">
            برای ادامه فرایند، ابتدا وارد حساب کاربری
            می‌شوی و سپس به تسویه حساب برمی‌گردی.
          </p>
        )}

        <div className="mt-6 grid gap-4">
          {canCheckout ? (
            <Link
              href={checkoutHref}
              aria-disabled={isSyncing}
              className={[
                "cart-shine-button inline-flex min-h-[64px] items-center justify-center rounded-[20px] px-7 text-[20px] font-black shadow-[0_20px_42px_-26px_rgba(48,44,40,0.75)] transition-all duration-500",
                isSyncing
                  ? "pointer-events-none bg-[#D8CFC0] text-[#8A8178]"
                  : "bg-[#D2AD70] text-[#302B27] hover:-translate-y-1 hover:bg-[#B2894C]",
              ].join(" ")}
            >
              {isSyncing
                ? "در حال ذخیره تغییرات..."
                : "ادامه فرایند خرید"}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-[64px] cursor-not-allowed items-center justify-center rounded-[20px] bg-[#E3DED5] px-7 text-[20px] font-black text-[#8F8981]"
            >
              ادامه فرایند خرید
            </button>
          )}

          <Link
            href="/products"
            className="inline-flex min-h-[60px] items-center justify-center rounded-[20px] border border-[#DDD5CA] bg-white px-7 text-[20px] font-black text-[#302B27] transition-all duration-500 hover:-translate-y-1 hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
          >
            ادامه خرید از فروشگاه
          </Link>
        </div>

        <div className="mt-6 grid gap-3">
          {[
            "بررسی موجودی قبل از ثبت سفارش",
            "نمایش مبلغ نهایی پیش از ثبت",
            "امکان ویرایش سبد تا مرحله آخر",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 text-[20px] font-bold leading-[1.75] text-[#6F6861]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[20px] font-black text-emerald-700">
                ✓
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#EEE7DE] pb-4 last:border-0 last:pb-0">
      <span className="text-[20px] font-bold text-[#756E66]">
        {label}
      </span>

      <span className="text-left text-[20px] font-black leading-[1.75] text-[#302B27]">
        {value}
      </span>
    </div>
  );
}