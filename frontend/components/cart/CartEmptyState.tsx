import Link from "next/link";

export default function CartEmptyState() {
  return (
    <div className="cart-enter relative overflow-hidden rounded-[34px] border border-dashed border-[#D2AD70]/70 bg-[#F6F1E8] px-6 py-16 text-center shadow-[0_28px_70px_-52px_rgba(74,53,28,0.45)]">
      <span className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full bg-white/80 blur-[80px]" />
      <span className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-[#D2AD70]/16 blur-[80px]" />

      <div className="relative">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-[#D2AD70]/55 bg-white text-[34px] font-black text-[#A16E2D] shadow-[0_22px_48px_-32px_rgba(84,59,28,0.52)]">
          ۰
        </div>

        <h2 className="mt-7 text-[34px] font-black leading-[1.55] text-[#302B27]">
          سبد خرید هنوز خالی است
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-[20px] font-medium leading-[2] text-[#756E66]">
          محصول موردنظرت را انتخاب کن یا برای ساخت یک محصول
          کاملاً اختصاصی، درخواست طراحی ثبت کن.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/products"
            className="cart-shine-button inline-flex min-h-[62px] items-center justify-center rounded-[20px] bg-[#302C28] px-8 text-[20px] font-black text-white transition-all duration-500 hover:-translate-y-1 hover:bg-[#A87431]"
          >
            مشاهده محصولات
          </Link>

          <Link
            href="/design-request"
            className="inline-flex min-h-[62px] items-center justify-center rounded-[20px] border border-[#D8CFC0] bg-white px-8 text-[20px] font-black text-[#302B27] transition-all duration-500 hover:-translate-y-1 hover:border-[#D2AD70] hover:bg-[#FBFAF7]"
          >
            ثبت درخواست طراحی
          </Link>
        </div>
      </div>
    </div>
  );
}