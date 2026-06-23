"use client";

import Link from "next/link";

import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/products-api";

function formatPrice(price: string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price));
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E3DED5] bg-white shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] transition duration-300 hover:-translate-y-1 hover:border-[#D2AD70] hover:shadow-[0_22px_55px_-36px_rgba(51,50,48,0.75)]">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F6F1E8]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#D2AD70]/50 bg-white text-4xl font-black text-[#B2894C] shadow-sm">
                چاپ
              </div>
            </div>
          )}

          {product.category && (
            <span className="absolute right-3 top-3 rounded-lg border border-[#E3DED5] bg-white/90 px-3 py-1 text-xs font-black text-[#B2894C] shadow-sm backdrop-blur">
              {product.category.title}
            </span>
          )}
        </div>

        <div className="p-5">
          <h2 className="line-clamp-1 text-lg font-black text-[#333230] transition group-hover:text-[#B2894C]">
            {product.title}
          </h2>

          <p className="mt-3 min-h-12 text-sm leading-6 text-[#77736D]">
            {product.short_description ||
              product.description ||
              "محصول اختصاصی مناسب هدیه، برندینگ و سفارش‌های شخصی‌سازی‌شده."}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#77736D]">شروع قیمت</p>
              <p className="mt-1 text-lg font-black text-[#333230]">
                {formatPrice(product.price)} تومان
              </p>
            </div>

            <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl bg-[#333230] px-4 text-sm font-black text-white transition group-hover:bg-[#B2894C]">
              جزئیات
            </span>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-2 gap-2 border-t border-[#E3DED5] p-4">
        <button
          type="button"
          onClick={() => addItem(product)}
          className="h-11 rounded-xl bg-[#D2AD70] px-3 text-sm font-black text-[#333230] transition hover:bg-[#B2894C]"
        >
          افزودن به سبد
        </button>
        <Link
          href={`/design-request?product=${product.slug}`}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-3 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
        >
          سفارش طراحی
        </Link>
      </div>
    </article>
  );
}
