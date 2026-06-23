"use client";

import Link from "next/link";

import { useCart } from "@/contexts/CartContext";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#E3DED5] bg-[#F2EEE6]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[#B2894C]">سبد خرید</p>
          <h1 className="mt-3 text-3xl font-black leading-snug text-[#333230] sm:text-5xl">
            سفارش‌های انتخاب‌شده
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-[#77736D]">
            تعداد محصول‌ها را تنظیم کن و وقتی همه چیز آماده بود، سفارش چاپ و هدیه را نهایی کن.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="min-w-0">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#D2AD70]/70 bg-[#F6F1E8] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D2AD70]/60 bg-white text-2xl font-black text-[#B2894C]">
                ۰
              </div>
              <h2 className="mt-6 text-xl font-black text-[#333230]">سبد خرید خالی است</h2>
              <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-[#77736D]">
                از صفحه محصولات، آیتم مورد نظرت را انتخاب کن و سفارش را شروع کن.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:-translate-y-0.5 hover:bg-[#B2894C]"
              >
                مشاهده محصولات
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-34px_rgba(51,50,48,0.6)] sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[#333230]">
                    {totalItems.toLocaleString("fa-IR")} آیتم در سبد خرید
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#77736D]">تعداد را تغییر بده؛ جمع کل فوری به‌روزرسانی می‌شود.</p>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="h-10 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] px-4 text-sm font-black text-[#77736D] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  خالی کردن
                </button>
              </div>

              {items.map((item) => {
                const lineTotal = Number(item.product.price) * item.quantity;

                return (
                  <article
                    key={item.product.id}
                    className="grid gap-4 rounded-2xl border border-[#E3DED5] bg-white p-4 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] sm:grid-cols-[128px_1fr] sm:items-center"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E3DED5] bg-[#F6F1E8]"
                    >
                      {item.product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.image_url}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-black text-[#B2894C]">
                          چاپ
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="line-clamp-1 text-lg font-black text-[#333230] transition hover:text-[#B2894C]"
                          >
                            {item.product.title}
                          </Link>
                          <p className="mt-1 text-sm font-bold text-[#77736D]">
                            قیمت واحد: {formatPrice(item.product.price)} تومان
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="h-10 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100"
                        >
                          حذف
                        </button>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-grid h-11 w-36 grid-cols-3 overflow-hidden rounded-xl border border-[#E3DED5] bg-[#FAFAF8]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="text-lg font-black text-[#B2894C] transition hover:bg-[#F6F1E8]"
                            aria-label="افزایش تعداد"
                          >
                            +
                          </button>
                          <input
                            value={item.quantity}
                            inputMode="numeric"
                            onChange={(event) =>
                              updateQuantity(item.product.id, Number(event.target.value) || 1)
                            }
                            className="min-w-0 border-x border-[#E3DED5] bg-white text-center text-sm font-black text-[#333230] outline-none"
                            aria-label="تعداد"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-lg font-black text-[#77736D] transition hover:bg-[#F6F1E8]"
                            aria-label="کاهش تعداد"
                          >
                            -
                          </button>
                        </div>

                        <p className="text-lg font-black text-[#333230]">
                          {formatPrice(lineTotal)} تومان
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-[#D8CFC0] bg-white p-5 shadow-[0_20px_55px_-38px_rgba(51,50,48,0.75)] lg:sticky lg:top-28">
          <p className="text-sm font-black text-[#B2894C]">مرحله بعد</p>
          <h2 className="mt-2 text-xl font-black text-[#333230]">خلاصه سفارش</h2>
          <div className="mt-5 space-y-3 border-b border-[#E3DED5] pb-5 text-sm font-bold text-[#77736D]">
            <div className="flex justify-between gap-4">
              <span>تعداد آیتم</span>
              <span className="text-[#333230]">{totalItems.toLocaleString("fa-IR")}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>جمع کل</span>
              <span className="text-[#333230]">{formatPrice(totalPrice)} تومان</span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="text-sm font-bold text-[#77736D]">قابل پرداخت</span>
            <span className="text-2xl font-black text-[#333230]">
              {formatPrice(totalPrice)} تومان
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/checkout"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] transition hover:-translate-y-0.5 hover:bg-[#B2894C]"
            >
              تسویه حساب
            </Link>
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
            >
              ادامه خرید از فروشگاه
            </Link>
          </div>
          <p className="mt-5 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] px-4 py-3 text-xs font-bold leading-6 text-[#77736D]">
            مبلغ نهایی و روش تحویل در مرحله بعد، پیش از ثبت سفارش، دوباره بررسی می‌شود.
          </p>
        </aside>
      </section>
    </main>
  );
}
