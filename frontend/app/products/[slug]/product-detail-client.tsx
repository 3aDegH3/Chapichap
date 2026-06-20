"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import ProductGallery from "@/components/products/ProductGallery";
import { getProduct, type ProductDetail } from "@/lib/products-api";

function formatPrice(price: string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price));
}

export default function ProductDetailClient() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getProduct(params.slug);
        if (isMounted) setProduct(data);
      } catch {
        if (!isMounted) return;
        setProduct(null);
        setError("این محصول پیدا نشد یا فعلا در دسترس نیست.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (params.slug) void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [params.slug]);

  if (isLoading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black text-[var(--dark)]">محصول پیدا نشد</h1>
          <p className="mt-4 leading-7 text-gray-600">{error}</p>
          <Link
            href="/products"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--dark)] px-6 text-sm font-black text-white transition hover:bg-[var(--primary)]"
          >
            برگشت به محصولات
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white pb-24 md:pb-0">
      <section className="border-b border-gray-100 bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-gray-500">
            <Link href="/products" className="transition hover:text-[var(--secondary)]">
              محصولات
            </Link>
            <span>/</span>
            {product.category && (
              <>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="transition hover:text-[var(--secondary)]"
                >
                  {product.category.title}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-[var(--dark)]">{product.title}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:px-8">
        <ProductGallery product={product} />

        <div className="lg:sticky lg:top-28 lg:h-fit">
          {product.category && (
            <span className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-black text-[var(--secondary)]">
              {product.category.title}
            </span>
          )}

          <h1 className="mt-5 text-3xl font-black leading-tight text-[var(--dark)] sm:text-4xl">
            {product.title}
          </h1>

          <p className="mt-5 text-base leading-8 text-gray-600">
            {product.short_description ||
              "محصول اختصاصی برای هدیه، برندینگ و سفارش‌های شخصی‌سازی‌شده."}
          </p>

          <div className="mt-7 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500">شروع قیمت</p>
                <p className="mt-1 text-3xl font-black text-[var(--dark)]">
                  {formatPrice(product.price)} تومان
                </p>
              </div>

              <Link
                href={`/design-request?product=${product.slug}`}
                className="inline-flex h-13 items-center justify-center rounded-full bg-[var(--primary)] px-7 text-sm font-black text-white shadow-lg shadow-pink-900/20 transition hover:opacity-90"
              >
                شروع سفارش
              </Link>
            </div>

            <div className="mt-5 grid gap-3 border-t border-gray-100 pt-5 sm:grid-cols-3">
              {["مشاوره قبل از چاپ", "تایید نهایی طرح", "آماده‌سازی سفارش"].map((item) => (
                <div key={item} className="rounded-lg bg-gray-50 px-3 py-3 text-sm font-black text-gray-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-black text-[var(--dark)]">توضیحات محصول</h2>
            <p className="mt-4 whitespace-pre-line leading-8 text-gray-600">
              {product.description ||
                product.short_description ||
                "جزئیات این محصول به‌زودی کامل‌تر می‌شود. برای سفارش می‌توانی طرح، متن یا ایده مورد نظرت را ارسال کنی."}
            </p>
          </div>
        </div>
      </section>

      {product.related_products.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50 py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-black text-[var(--secondary)]">
                  پیشنهادهای مشابه
                </p>
                <h2 className="mt-2 text-2xl font-black text-[var(--dark)]">
                  محصولات مرتبط
                </h2>
              </div>

              <Link
                href="/products"
                className="text-sm font-black text-gray-600 transition hover:text-[var(--primary)]"
              >
                مشاهده همه محصولات
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {product.related_products.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_-18px_rgba(0,0,0,0.35)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-gray-500">شروع قیمت</p>
            <p className="text-base font-black text-[var(--dark)]">
              {formatPrice(product.price)} تومان
            </p>
          </div>
          <Link
            href={`/design-request?product=${product.slug}`}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white shadow-lg shadow-pink-900/20"
          >
            شروع سفارش
          </Link>
        </div>
      </div>
    </main>
  );
}

function ProductDetailSkeleton() {
  return (
    <main className="bg-white">
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <div className="aspect-square animate-pulse rounded-lg bg-gray-100" />
          <div className="mt-4 grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </div>

        <div>
          <div className="h-8 w-28 animate-pulse rounded bg-gray-100" />
          <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="mt-5 h-24 animate-pulse rounded bg-gray-100" />
          <div className="mt-7 h-44 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </section>
    </main>
  );
}
