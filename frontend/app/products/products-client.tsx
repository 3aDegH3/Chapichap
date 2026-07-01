"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import ProductCard from "@/components/products/ProductCard";
import Pagination from "@/components/ui/Pagination";
import {
  getCategories,
  getProducts,
  giftUsageOptions,
  productSortOptions,
  productTypeOptions,
  type Category,
  type Product,
} from "@/lib/products-api";

const PAGE_SIZE = 10;

export default function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  const initialPage = Number(searchParams.get("page") || "1");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(Number.isFinite(initialPage) ? initialPage : 1);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [productType, setProductType] = useState(searchParams.get("type") || "");
  const [giftUsage, setGiftUsage] = useState(searchParams.get("gift") || "");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [debouncedMinPrice, setDebouncedMinPrice] = useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState(maxPrice);
  const [ordering, setOrdering] = useState(searchParams.get("sort") || "-created_at");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setDebouncedMinPrice(normalizePrice(minPrice));
      setDebouncedMaxPrice(normalizePrice(maxPrice));
      setPage(1);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [search, minPrice, maxPrice]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (productType) params.set("type", productType);
    if (giftUsage) params.set("gift", giftUsage);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (debouncedMinPrice) params.set("min_price", debouncedMinPrice);
    if (debouncedMaxPrice) params.set("max_price", debouncedMaxPrice);
    if (ordering && ordering !== "-created_at") params.set("sort", ordering);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [
    category,
    productType,
    giftUsage,
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    ordering,
    page,
    pathname,
    router,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await getCategories();
        if (isMounted) setCategories(data);
      } catch {
        if (isMounted) setCategories([]);
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getProducts({
          page,
          category,
          productType,
          giftUsage,
          search: debouncedSearch,
          minPrice: debouncedMinPrice,
          maxPrice: debouncedMaxPrice,
          ordering,
        });

        if (!isMounted) return;

        setProducts(data.results);
        setCount(data.count);
      } catch {
        if (!isMounted) return;
        setProducts([]);
        setCount(0);
        setError("فعلا امکان دریافت محصولات وجود ندارد.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [page, category, productType, giftUsage, debouncedSearch, debouncedMinPrice, debouncedMaxPrice, ordering]);

  const activeCategoryTitle = useMemo(() => {
    return categories.find((item) => item.slug === category)?.title;
  }, [categories, category]);

  const activeProductTypeLabel = useMemo(() => {
    return productTypeOptions.find((item) => item.value === productType)?.label;
  }, [productType]);

  const activeGiftUsageLabel = useMemo(() => {
    return giftUsageOptions.find((item) => item.value === giftUsage)?.label;
  }, [giftUsage]);

  const hasActiveFilters =
    Boolean(category) ||
    Boolean(productType) ||
    Boolean(giftUsage) ||
    Boolean(debouncedSearch) ||
    Boolean(debouncedMinPrice) ||
    Boolean(debouncedMaxPrice) ||
    ordering !== "-created_at";

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    setPage(1);
  }

  function selectProductType(nextType: string) {
    setProductType(nextType);
    setPage(1);
  }

  function selectGiftUsage(nextUsage: string) {
    setGiftUsage(nextUsage);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#E3DED5] bg-[#F2EEE6]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-[#B2894C]">
              محصولات چاپ و هدیه اختصاصی
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[#333230] sm:text-5xl">
              محصول مناسب سفارش خودت را سریع پیدا کن
            </h1>
            <p className="mt-5 leading-8 text-[#77736D]">
              دسته‌بندی، جستجو و صفحه‌بندی کمک می‌کند بدون شلوغی بین محصولات
              چاپی انتخاب کنی و وارد جزئیات شوی.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-2xl border border-[#E3DED5] bg-white p-4 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
            <label
              htmlFor="product-search"
              className="text-sm font-black text-[#333230]"
            >
              جستجوی محصول
            </label>
            <input
              id="product-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="مثلا ماگ، تیشرت، هدیه تبلیغاتی"
              className="mt-3 h-12 w-full rounded-xl border border-[#E3DED5] px-4 text-sm outline-none transition placeholder:text-[#A8A29A] focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
            />

            <div className="mt-6">
              <p className="text-sm font-black text-[#333230]">دسته‌بندی</p>
              <div className="mt-3 grid gap-2">
                <button
                  type="button"
                  onClick={() => selectCategory("")}
                  className={filterButtonClass(!category)}
                >
                  همه محصولات
                </button>

                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectCategory(item.slug)}
                    className={filterButtonClass(category === item.slug)}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#E3DED5] pt-6">
              <p className="text-sm font-black text-[#333230]">نوع محصول</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectProductType("")}
                  className={filterButtonClass(!productType)}
                >
                  همه
                </button>
                {productTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectProductType(option.value)}
                    className={filterButtonClass(productType === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#E3DED5] pt-6">
              <p className="text-sm font-black text-[#333230]">کاربرد هدیه</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => selectGiftUsage("")}
                  className={filterButtonClass(!giftUsage)}
                >
                  همه
                </button>
                {giftUsageOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectGiftUsage(option.value)}
                    className={filterButtonClass(giftUsage === option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-[#E3DED5] pt-6">
              <p className="text-sm font-black text-[#333230]">بازه قیمت</p>
              <div className="mt-3 grid gap-3">
                <label className="block">
                  <span className="text-xs font-bold text-[#77736D]">از قیمت</span>
                  <input
                    inputMode="numeric"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="مثلا 200000"
                    className="mt-2 h-11 w-full rounded-xl border border-[#E3DED5] px-3 text-sm outline-none transition placeholder:text-[#A8A29A] focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-[#77736D]">تا قیمت</span>
                  <input
                    inputMode="numeric"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="مثلا 800000"
                    className="mt-2 h-11 w-full rounded-xl border border-[#E3DED5] px-3 text-sm outline-none transition placeholder:text-[#A8A29A] focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
                  />
                </label>
              </div>
            </div>

            <div className="mt-6 border-t border-[#E3DED5] pt-6">
              <label
                htmlFor="product-sort"
                className="text-sm font-black text-[#333230]"
              >
                مرتب‌سازی
              </label>
              <select
                id="product-sort"
                value={ordering}
                onChange={(event) => {
                  setOrdering(event.target.value);
                  setPage(1);
                }}
                className="mt-3 h-11 w-full rounded-xl border border-[#E3DED5] bg-white px-3 text-sm font-black text-[#333230] outline-none transition focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
              >
                {productSortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          <div ref={resultsRef} className="scroll-mt-28" aria-busy={isLoading}>
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-2xl border border-[#E3DED5] bg-white p-4 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.55)] sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-black text-[#333230]">
                  {count > 0 ? `${count.toLocaleString("fa-IR")} محصول` : "محصولی یافت نشد"}
                </p>
                <p className="mt-1 text-sm text-[#77736D]">
                  {getFilterSummary({
                    categoryTitle: activeCategoryTitle,
                    productTypeLabel: activeProductTypeLabel,
                    giftUsageLabel: activeGiftUsageLabel,
                    search: debouncedSearch,
                    minPrice: debouncedMinPrice,
                    maxPrice: debouncedMaxPrice,
                  })}
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    setProductType("");
                    setGiftUsage("");
                    setSearch("");
                    setDebouncedSearch("");
                    setMinPrice("");
                    setMaxPrice("");
                    setDebouncedMinPrice("");
                    setDebouncedMaxPrice("");
                    setOrdering("-created_at");
                    setPage(1);
                  }}
                  className="h-10 rounded-xl border border-[#E3DED5] px-4 text-sm font-black text-[#77736D] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] hover:text-[#333230]"
                >
                  پاک کردن فیلترها
                </button>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination
                  page={page}
                  totalPages={totalPages}
                  label="صفحه‌بندی محصولات"
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <EmptyProductsState />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function filterButtonClass(isActive: boolean) {
  return [
    "flex h-11 items-center justify-center rounded-xl px-3 text-center text-sm font-black transition",
    isActive
      ? "border border-[#D2AD70]/55 bg-[#F6F1E8] text-[#B2894C]"
      : "border border-transparent bg-[#FAFAF8] text-[#77736D] hover:border-[#D2AD70]/35 hover:bg-[#F6F1E8] hover:text-[#333230]",
  ].join(" ");
}

function normalizePrice(value: string) {
  return value.replace(/[^\d]/g, "");
}

function getFilterSummary({
  categoryTitle,
  productTypeLabel,
  giftUsageLabel,
  search,
  minPrice,
  maxPrice,
}: {
  categoryTitle?: string;
  productTypeLabel?: string;
  giftUsageLabel?: string;
  search: string;
  minPrice: string;
  maxPrice: string;
}) {
  const filters = [
    categoryTitle ? `دسته: ${categoryTitle}` : "",
    productTypeLabel ? `نوع: ${productTypeLabel}` : "",
    giftUsageLabel ? `کاربرد: ${giftUsageLabel}` : "",
    search ? `جستجو: ${search}` : "",
    minPrice ? `از ${Number(minPrice).toLocaleString("fa-IR")} تومان` : "",
    maxPrice ? `تا ${Number(maxPrice).toLocaleString("fa-IR")} تومان` : "",
  ].filter(Boolean);

  return filters.length > 0 ? filters.join("، ") : "نمایش همه دسته‌بندی‌ها";
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-[#E3DED5] bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#E3DED5]" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-[#E3DED5]" />
            <div className="h-12 animate-pulse rounded bg-[#E3DED5]" />
            <div className="h-10 animate-pulse rounded bg-[#E3DED5]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyProductsState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] px-6 py-16 text-center">
      <h2 className="text-xl font-black text-[#333230]">محصولی پیدا نشد</h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-[#77736D]">
        عبارت جستجو یا دسته‌بندی را تغییر بده تا محصولات بیشتری نمایش داده شود.
      </p>
    </div>
  );
}
