"use client";

import Link from "next/link";

import { useCart } from "@/contexts/CartContext";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

export default function CartPage() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[var(--secondary)]">سبد خرید</p>
          <h1 className="mt-3 text-3xl font-black text-[var(--dark)] sm:text-5xl">
            سفارش‌های انتخاب‌شده
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="min-w-0">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
              <h2 className="text-xl font-black text-[var(--dark)]">سبد خرید خالی است</h2>
              <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
                از صفحه محصولات، آیتم مورد نظرت را انتخاب کن و سفارش را شروع کن.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--secondary)] px-6 text-sm font-black text-white transition hover:opacity-90"
              >
                مشاهده محصولات
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="text-sm font-black text-[var(--dark)]">
                    {totalItems.toLocaleString("fa-IR")} آیتم در سبد خرید
                  </p>
                  <p className="mt-1 text-sm text-gray-500">تعداد را تغییر بده؛ جمع کل فوری به‌روزرسانی می‌شود.</p>
                </div>
                <button
                  type="button"
                  onClick={clearCart}
                  className="h-10 rounded-full border border-gray-200 px-4 text-sm font-black text-gray-700 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  خالی کردن
                </button>
              </div>

              {items.map((item) => {
                const lineTotal = Number(item.product.price) * item.quantity;

                return (
                  <article
                    key={item.product.id}
                    className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr] sm:items-center"
                  >
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-sky-50 via-white to-pink-50"
                    >
                      {item.product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.product.image_url}
                          alt={item.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-black text-[var(--secondary)]">
                          چاپ
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="line-clamp-1 text-lg font-black text-[var(--dark)] transition hover:text-[var(--primary)]"
                          >
                            {item.product.title}
                          </Link>
                          <p className="mt-1 text-sm font-bold text-gray-500">
                            قیمت واحد: {formatPrice(item.product.price)} تومان
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="h-10 rounded-full border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100"
                        >
                          حذف
                        </button>
                      </div>

                      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-grid h-11 w-36 grid-cols-3 overflow-hidden rounded-full border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="text-lg font-black text-[var(--secondary)] transition hover:bg-sky-50"
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
                            className="min-w-0 border-x border-gray-200 text-center text-sm font-black outline-none"
                            aria-label="تعداد"
                          />
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="text-lg font-black text-[var(--primary)] transition hover:bg-pink-50"
                            aria-label="کاهش تعداد"
                          >
                            -
                          </button>
                        </div>

                        <p className="text-lg font-black text-[var(--dark)]">
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

        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-[var(--dark)]">خلاصه سفارش</h2>
          <div className="mt-5 space-y-3 border-b border-gray-100 pb-5 text-sm font-bold text-gray-600">
            <div className="flex justify-between gap-4">
              <span>تعداد آیتم</span>
              <span>{totalItems.toLocaleString("fa-IR")}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>جمع کل</span>
              <span>{formatPrice(totalPrice)} تومان</span>
            </div>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="text-sm font-bold text-gray-500">قابل پرداخت</span>
            <span className="text-2xl font-black text-[var(--dark)]">
              {formatPrice(totalPrice)} تومان
            </span>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href="/design-request"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90"
            >
              پرداخت / ثبت سفارش
            </Link>
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
            >
              ادامه خرید
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
