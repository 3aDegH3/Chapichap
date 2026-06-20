import Link from "next/link";

import type { Product } from "@/lib/products-api";

function formatPrice(price: string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price));
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-sky-50 via-white to-pink-50">
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
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-sky-100 bg-white text-4xl font-black text-[var(--secondary)] shadow-sm">
                چاپ
              </div>
            </div>
          )}

          {product.category && (
            <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[var(--secondary)] shadow-sm backdrop-blur">
              {product.category.title}
            </span>
          )}
        </div>

        <div className="p-5">
          <h2 className="line-clamp-1 text-lg font-black text-[var(--dark)] transition group-hover:text-[var(--primary)]">
            {product.title}
          </h2>

          <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
            {product.short_description ||
              product.description ||
              "محصول اختصاصی مناسب هدیه، برندینگ و سفارش‌های شخصی‌سازی‌شده."}
          </p>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500">شروع قیمت</p>
              <p className="mt-1 text-lg font-black text-[var(--dark)]">
                {formatPrice(product.price)} تومان
              </p>
            </div>

            <span className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--dark)] px-4 text-sm font-black text-white transition group-hover:bg-[var(--primary)]">
              جزئیات
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
