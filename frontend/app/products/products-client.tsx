"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  type SVGProps,
} from "react";

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

type IconProps = SVGProps<SVGSVGElement>;

type FilterPanelProps = {
  categories: Category[];
  category: string;
  productType: string;
  giftUsage: string;
  minPrice: string;
  maxPrice: string;
  ordering: string;
  search: string;
  onCategoryChange: (value: string) => void;
  onProductTypeChange: (value: string) => void;
  onGiftUsageChange: (value: string) => void;
  onMinPriceChange: Dispatch<SetStateAction<string>>;
  onMaxPriceChange: Dispatch<SetStateAction<string>>;
  onOrderingChange: (value: string) => void;
  onSearchChange: Dispatch<SetStateAction<string>>;
  onClear: () => void;
  hasActiveFilters: boolean;
  compact?: boolean;
};

type ActiveFilter = {
  key:
    | "category"
    | "productType"
    | "giftUsage"
    | "search"
    | "minPrice"
    | "maxPrice"
    | "ordering";
  label: string;
};

const PAGE_SIZE = 10;

/**
 * بعداً تصویر طراحی‌شده هیرو را داخل public قرار بده و مسیرش را اینجا بنویس:
 * مثال:
 * const HERO_IMAGE_URL = "/store/store-hero.webp";
 */
const HERO_IMAGE_URL = "/store/store-hero.webp";


const storeBenefits = [
  {
    title: "بررسی فایل پیش از چاپ",
    description: "فایل سفارش قبل از اجرا بررسی می‌شود.",
    icon: SearchCheckIcon,
  },
  {
    title: "سفارش تکی و عمده",
    description: "برای هدیه شخصی یا سفارش سازمانی.",
    icon: PackageIcon,
  },
  {
    title: "پشتیبانی تا تحویل",
    description: "در تمام مراحل سفارش همراهت هستیم.",
    icon: HeadsetIcon,
  },
] as const;

export default function ProductsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const resultsRef = useRef<HTMLDivElement>(null);

  const initialPage = parsePositiveInteger(searchParams.get("page"));

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(initialPage);
  const [category, setCategory] = useState(
    searchParams.get("category") || "",
  );
  const [productType, setProductType] = useState(
    searchParams.get("type") || "",
  );
  const [giftUsage, setGiftUsage] = useState(
    searchParams.get("gift") || "",
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [minPrice, setMinPrice] = useState(
    searchParams.get("min_price") || "",
  );
  const [maxPrice, setMaxPrice] = useState(
    searchParams.get("max_price") || "",
  );
  const [debouncedMinPrice, setDebouncedMinPrice] =
    useState(minPrice);
  const [debouncedMaxPrice, setDebouncedMaxPrice] =
    useState(maxPrice);

  const [ordering, setOrdering] = useState(
    searchParams.get("sort") || "-created_at",
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] =
    useState(false);

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
    if (debouncedMinPrice) {
      params.set("min_price", debouncedMinPrice);
    }
    if (debouncedMaxPrice) {
      params.set("max_price", debouncedMaxPrice);
    }
    if (ordering && ordering !== "-created_at") {
      params.set("sort", ordering);
    }
    if (page > 1) params.set("page", String(page));

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
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
      setIsCategoriesLoading(true);

      try {
        const data = await getCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch {
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsCategoriesLoading(false);
        }
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

        const responseTotalPages = Math.max(
          1,
          Math.ceil(data.count / PAGE_SIZE),
        );

        if (data.count > 0 && page > responseTotalPages) {
          setPage(responseTotalPages);
          return;
        }

        setProducts(data.results);
        setCount(data.count);
      } catch {
        if (!isMounted) return;

        setProducts([]);
        setCount(0);
        setError(
          "در حال حاضر امکان دریافت محصولات وجود ندارد. لطفاً دوباره تلاش کن.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [
    page,
    category,
    productType,
    giftUsage,
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    ordering,
    retryToken,
  ]);

  useEffect(() => {
    if (!isMobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileFiltersOpen]);

  const activeCategoryTitle = useMemo(() => {
    return categories.find((item) => item.slug === category)?.title;
  }, [categories, category]);

  const activeProductTypeLabel = useMemo(() => {
    return productTypeOptions.find(
      (item) => item.value === productType,
    )?.label;
  }, [productType]);

  const activeGiftUsageLabel = useMemo(() => {
    return giftUsageOptions.find(
      (item) => item.value === giftUsage,
    )?.label;
  }, [giftUsage]);

  const activeOrderingLabel = useMemo(() => {
    return productSortOptions.find(
      (item) => item.value === ordering,
    )?.label;
  }, [ordering]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const items: ActiveFilter[] = [];

    if (activeCategoryTitle) {
      items.push({
        key: "category",
        label: activeCategoryTitle,
      });
    }

    if (activeProductTypeLabel) {
      items.push({
        key: "productType",
        label: activeProductTypeLabel,
      });
    }

    if (activeGiftUsageLabel) {
      items.push({
        key: "giftUsage",
        label: activeGiftUsageLabel,
      });
    }

    if (debouncedSearch) {
      items.push({
        key: "search",
        label: `جستجو: ${debouncedSearch}`,
      });
    }

    if (debouncedMinPrice) {
      items.push({
        key: "minPrice",
        label: `از ${formatPrice(debouncedMinPrice)} تومان`,
      });
    }

    if (debouncedMaxPrice) {
      items.push({
        key: "maxPrice",
        label: `تا ${formatPrice(debouncedMaxPrice)} تومان`,
      });
    }

    if (ordering !== "-created_at" && activeOrderingLabel) {
      items.push({
        key: "ordering",
        label: activeOrderingLabel,
      });
    }

    return items;
  }, [
    activeCategoryTitle,
    activeProductTypeLabel,
    activeGiftUsageLabel,
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    ordering,
    activeOrderingLabel,
  ]);

  const hasActiveFilters = activeFilters.length > 0;

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

  function changeOrdering(nextOrdering: string) {
    setOrdering(nextOrdering);
    setPage(1);
  }

  function clearAllFilters() {
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
  }

  function removeFilter(key: ActiveFilter["key"]) {
    if (key === "category") setCategory("");
    if (key === "productType") setProductType("");
    if (key === "giftUsage") setGiftUsage("");

    if (key === "search") {
      setSearch("");
      setDebouncedSearch("");
    }

    if (key === "minPrice") {
      setMinPrice("");
      setDebouncedMinPrice("");
    }

    if (key === "maxPrice") {
      setMaxPrice("");
      setDebouncedMaxPrice("");
    }

    if (key === "ordering") {
      setOrdering("-created_at");
    }

    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);

    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <main className="store-page min-h-screen overflow-hidden bg-[#fbfaf7]">
      <StoreHero
        search={search}
        onSearchChange={setSearch}
        count={count}
        isLoading={isLoading}
      />

      <QuickCategoryNavigation
        categories={categories}
        selectedCategory={category}
        isLoading={isCategoriesLoading}
        onSelect={selectCategory}
      />

      <StoreBenefits />

      <section className="relative py-10 sm:py-12 lg:py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#f3eee6]/65 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <SectionHeading />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <MobileFilterButton
                activeCount={activeFilters.length}
                onClick={() => setIsMobileFiltersOpen(true)}
              />

              <div className="relative hidden min-w-[260px] lg:block">
                <select
                  value={ordering}
                  onChange={(event) =>
                    changeOrdering(event.target.value)
                  }
                  className="h-[58px] w-full appearance-none rounded-[17px] border border-[#ddd5c9] bg-white px-5 pl-12 text-[20px] font-black text-[#39342f] shadow-[0_14px_35px_-28px_rgba(45,39,33,0.35)] outline-none transition focus:border-[#c99a52] focus:ring-4 focus:ring-[#c99a52]/10"
                  aria-label="مرتب‌سازی محصولات"
                >
                  {productSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDownIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8c8176]" />
              </div>
            </div>
          </div>

          <div className="grid items-start gap-7 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:gap-9">
            <aside className="hidden xl:sticky xl:top-[168px] xl:block">
              <FilterPanel
                categories={categories}
                category={category}
                productType={productType}
                giftUsage={giftUsage}
                minPrice={minPrice}
                maxPrice={maxPrice}
                ordering={ordering}
                search={search}
                onCategoryChange={selectCategory}
                onProductTypeChange={selectProductType}
                onGiftUsageChange={selectGiftUsage}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onOrderingChange={changeOrdering}
                onSearchChange={setSearch}
                onClear={clearAllFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </aside>

            <div
              ref={resultsRef}
              className="min-w-0 scroll-mt-36"
              aria-busy={isLoading}
            >
              <ProductsToolbar
                count={count}
                isLoading={isLoading}
                activeFilters={activeFilters}
                onRemoveFilter={removeFilter}
                onClearFilters={clearAllFilters}
              />

              {error && (
                <ErrorState
                  message={error}
                  onRetry={() =>
                    setRetryToken((value) => value + 1)
                  }
                />
              )}

              {!error && isLoading && <ProductGridSkeleton />}

              {!error && !isLoading && products.length > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-10 rounded-[24px] border border-[#e3dbd0] bg-white px-4 py-5 shadow-[0_18px_45px_-34px_rgba(45,39,33,0.28)] sm:px-6">
                      <Pagination
                        page={page}
                        totalPages={totalPages}
                        label="صفحه‌بندی محصولات"
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}

              {!error && !isLoading && products.length === 0 && (
                <EmptyProductsState onClear={clearAllFilters} />
              )}
            </div>
          </div>
        </div>
      </section>

      <CustomOrderBanner />

      <MobileFilterDrawer
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
      >
        <FilterPanel
          categories={categories}
          category={category}
          productType={productType}
          giftUsage={giftUsage}
          minPrice={minPrice}
          maxPrice={maxPrice}
          ordering={ordering}
          search={search}
          onCategoryChange={selectCategory}
          onProductTypeChange={selectProductType}
          onGiftUsageChange={selectGiftUsage}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onOrderingChange={changeOrdering}
          onSearchChange={setSearch}
          onClear={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
          compact
        />
      </MobileFilterDrawer>

      <style jsx global>{`
        .store-page {
          isolation: isolate;
        }

        .store-hero-grid {
          background-image:
            linear-gradient(
              rgba(114, 83, 45, 0.07) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(114, 83, 45, 0.07) 1px,
              transparent 1px
            );
          background-size: 34px 34px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent 95%
          );
        }

        .store-hero-artwork {
          box-shadow:
            0 35px 80px -50px rgba(55, 43, 29, 0.55),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .store-hero-frame::before {
          content: "";
          position: absolute;
          inset: 10px;
          pointer-events: none;
          border: 1px solid rgba(201, 154, 82, 0.23);
          border-radius: 28px;
        }

        .store-category-scroll,
        .store-filter-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(180, 139, 77, 0.35) transparent;
        }

        .store-category-scroll::-webkit-scrollbar,
        .store-filter-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }

        .store-category-scroll::-webkit-scrollbar-track,
        .store-filter-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .store-category-scroll::-webkit-scrollbar-thumb,
        .store-filter-scroll::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(180, 139, 77, 0.35);
        }

        .store-hero-search {
          transform: translateZ(0);
        }

        .store-hero-main-image {
          will-change: transform;
        }

        .store-hero-badge-float {
          animation: store-hero-badge-float 4.8s ease-in-out infinite;
        }

        @keyframes store-hero-badge-float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        .store-skeleton {
          background: linear-gradient(
            105deg,
            #ece5dc 20%,
            #faf7f2 38%,
            #ece5dc 56%
          );
          background-size: 220% 100%;
          animation: store-skeleton 1.55s linear infinite;
        }

        @keyframes store-skeleton {
          from {
            background-position: 200% 0;
          }

          to {
            background-position: -20% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .store-page *,
          .store-page *::before,
          .store-page *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function StoreHero({
  search,
  onSearchChange,
  count,
  isLoading,
}: {
  search: string;
  onSearchChange: Dispatch<SetStateAction<string>>;
  count: number;
  isLoading: boolean;
}) {
  return (
    <section className="relative overflow-hidden border-b border-[#ded3c5] bg-[#efe8dc]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="store-hero-grid absolute inset-0 opacity-55" />
        <div className="absolute -right-56 -top-64 h-[700px] w-[700px] rounded-full bg-[#c99a52]/20 blur-[120px]" />
        <div className="absolute -bottom-80 -left-48 h-[620px] w-[620px] rounded-full bg-white/80 blur-[125px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#c99a52]/70 to-transparent" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1840px] items-center gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)] lg:px-8 lg:py-16 xl:gap-14 xl:px-10 2xl:px-12">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-[52px] items-center gap-3 rounded-full border border-[#cba66d]/55 bg-white/80 px-5 text-[20px] font-black text-[#78501f] shadow-[0_14px_34px_-25px_rgba(80,56,26,0.48)] backdrop-blur-xl">
              <SparklesIcon className="h-6 w-6 text-[#ad7430]" />
              فروشگاه چاپی چاپ
            </span>

            <span className="inline-flex min-h-[52px] items-center gap-3 rounded-full border border-[#d9cfc1] bg-[#2f2a26] px-5 text-[20px] font-black text-white shadow-[0_14px_34px_-26px_rgba(43,36,29,0.55)]">
              <PackageIcon className="h-6 w-6 text-[#dfb46f]" />
              سفارش تکی و عمده
            </span>
          </div>

          <h1 className="mt-7 max-w-5xl text-[42px] font-black leading-[1.5] text-[#2c2824] sm:text-[52px] lg:text-[60px] xl:text-[66px]">
            محصولی را انتخاب کن که
            <span className="relative mx-2 inline-block text-[#9c6828]">
              دقیقاً برای تو ساخته شود
              <span className="absolute inset-x-0 bottom-2 -z-10 h-4 rounded-full bg-[#d2ad70]/22" />
            </span>
          </h1>

          <p className="mt-6 max-w-4xl text-[20px] font-medium leading-[2] text-[#6d655d] sm:text-[22px]">
            میان محصولات چاپی، هدیه‌های شخصی و سفارش‌های اختصاصی جستجو کن؛
            فایل تو قبل از چاپ بررسی می‌شود و از انتخاب محصول تا تحویل کنارت
            هستیم.
          </p>

          <div className="store-hero-search mt-8 max-w-4xl rounded-[26px] border border-[#d5c6b2] bg-white/90 p-2.5 shadow-[0_30px_75px_-42px_rgba(52,41,28,0.52)] backdrop-blur-xl transition-all duration-300 focus-within:border-[#c99a52] focus-within:shadow-[0_34px_85px_-40px_rgba(130,84,30,0.42)]">
            <label htmlFor="hero-product-search" className="sr-only">
              جستجوی محصول
            </label>

            <div className="relative flex min-h-[72px] items-center gap-3 rounded-[20px] bg-[#faf7f2] px-4 transition focus-within:bg-white">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f1e5d3] text-[#956329]">
                <SearchIcon className="h-6 w-6" />
              </span>

              <input
                id="hero-product-search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="نام محصول، هدیه یا نوع چاپ را بنویس..."
                className="min-w-0 flex-1 bg-transparent py-3 text-[20px] font-bold text-[#35302c] outline-none placeholder:text-[#9e958c]"
              />

              <a
                href="#products-results"
                className="hidden min-h-[56px] shrink-0 items-center justify-center gap-2.5 rounded-[17px] bg-[#302c28] px-7 text-[20px] font-black text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#a16e2d] sm:inline-flex"
              >
                مشاهده محصولات
                <ArrowDownIcon className="h-6 w-6" />
              </a>
            </div>
          </div>

          <div className="mt-7 grid max-w-4xl gap-3 sm:grid-cols-3">
            <div className="flex min-h-[92px] items-center gap-4 rounded-[21px] border border-[#dbd0c2] bg-white/70 px-4 py-3 backdrop-blur-md">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#302c28] text-[#e4ba73]">
                <PackageIcon className="h-6 w-6" />
              </span>
              <div>
                <strong className="block text-[24px] font-black text-[#302b27]">
                  {isLoading ? "..." : count.toLocaleString("fa-IR")}
                </strong>
                <span className="mt-1 block text-[20px] font-bold text-[#81776d]">
                  محصول قابل سفارش
                </span>
              </div>
            </div>

            <div className="flex min-h-[92px] items-center gap-4 rounded-[21px] border border-[#dbd0c2] bg-white/70 px-4 py-3 backdrop-blur-md">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f1e5d3] text-[#956329]">
                <SearchCheckIcon className="h-6 w-6" />
              </span>
              <div>
                <strong className="block text-[20px] font-black text-[#302b27]">
                  بررسی پیش از چاپ
                </strong>
                <span className="mt-1 block text-[20px] font-bold text-[#81776d]">
                  کنترل فایل و جزئیات
                </span>
              </div>
            </div>

            <div className="flex min-h-[92px] items-center gap-4 rounded-[21px] border border-[#dbd0c2] bg-white/70 px-4 py-3 backdrop-blur-md">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f1e5d3] text-[#956329]">
                <HeadsetIcon className="h-6 w-6" />
              </span>
              <div>
                <strong className="block text-[20px] font-black text-[#302b27]">
                  پشتیبانی سفارش
                </strong>
                <span className="mt-1 block text-[20px] font-bold text-[#81776d]">
                  همراهی تا زمان تحویل
                </span>
              </div>
            </div>
          </div>
        </div>

        <HeroArtwork />
      </div>
    </section>
  );
}

function HeroArtwork() {
  return (
    <div className="relative mx-auto w-full max-w-[700px] py-5 lg:py-0">
      <div className="pointer-events-none absolute -right-8 top-12 h-[82%] w-[84%] rotate-3 rounded-[42px] border border-[#c99a52]/25 bg-[#c99a52]/10" />
      <div className="pointer-events-none absolute -left-7 bottom-10 h-[76%] w-[82%] -rotate-3 rounded-[42px] border border-white/80 bg-white/45" />

      <div className="store-hero-artwork store-hero-frame group relative overflow-hidden rounded-[42px] border border-[#d7cbbb] bg-white/78 p-3.5 shadow-[0_40px_100px_-52px_rgba(56,43,27,0.62)] backdrop-blur-xl">
        <div className="relative min-h-[520px] overflow-hidden rounded-[32px] border border-[#e0d5c7] bg-[linear-gradient(145deg,#ebe0d1,#faf7f1)] sm:min-h-[620px]">
          {HERO_IMAGE_URL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={HERO_IMAGE_URL}
              alt="محصولات چاپی و هدیه اختصاصی چاپی چاپ"
              className="store-hero-main-image absolute inset-0 h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative flex h-[320px] w-[320px] items-center justify-center rounded-full border border-[#d2ad70]/55 bg-white/80 shadow-[0_30px_70px_-42px_rgba(85,60,26,0.5)] sm:h-[370px] sm:w-[370px]">
                <span className="absolute inset-4 rounded-full border border-dashed border-[#d2ad70]/35" />
                <div className="text-center">
                  <ImageIcon className="mx-auto h-16 w-16 text-[#a97431]" />
                  <p className="mt-5 text-[24px] font-black text-[#4a4035]">
                    تصویر فروشگاه
                  </p>
                  <p className="mx-auto mt-2 max-w-[250px] text-[20px] font-bold leading-9 text-[#8c8176]">
                    تصویر اختصاصی محصولات را در این بخش قرار بده.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1d1915]/72 via-[#1d1915]/10 to-white/20" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/25 to-transparent" />

          <div className="absolute inset-x-5 top-5 flex items-start justify-between gap-3 sm:inset-x-6 sm:top-6">


            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/40 bg-[#292521]/75 text-[#e7bf7b] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <GiftIcon className="h-7 w-7" />
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:bottom-6 sm:left-6 sm:right-6 sm:grid-cols-[1fr_auto]">



          </div>
        </div>
      </div>


    </div>
  );
}

function QuickCategoryNavigation({
  categories,
  selectedCategory,
  isLoading,
  onSelect,
}: {
  categories: Category[];
  selectedCategory: string;
  isLoading: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <section className="border-b border-[#e7e0d7] bg-white">
      <div className="mx-auto w-full max-w-[1840px] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center gap-4">
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f4ead9] text-[#946326]">
              <GridIcon className="h-5 w-5" />
            </span>

            <div>
              <p className="text-[20px] font-black text-[#3b3631]">
                دسته‌بندی سریع
              </p>

              <p className="text-[20px] font-bold text-[#958a7f]">
                انتخاب مستقیم محصولات
              </p>
            </div>
          </div>

          <div className="store-category-scroll flex min-w-0 flex-1 gap-2.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => onSelect("")}
              className={categoryChipClass(!selectedCategory)}
            >
              همه محصولات
            </button>

            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className="store-skeleton h-[46px] w-32 shrink-0 rounded-full"
                  />
                ))
              : categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect(item.slug)}
                    className={categoryChipClass(
                      selectedCategory === item.slug,
                    )}
                  >
                    {item.title}
                  </button>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreBenefits() {
  return (
    <section className="border-b border-[#e7e0d7] bg-[#fcfbf8]">
      <div className="mx-auto grid w-full max-w-[1840px] gap-3 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        {storeBenefits.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="flex min-h-[92px] items-center gap-4 rounded-[20px] border border-[#e6dfd6] bg-white p-4 shadow-[0_14px_35px_-30px_rgba(45,39,33,0.28)]"
            >
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] border border-[#e3d5c0] bg-[#f8f1e6] text-[#9a6a2e]">
                <Icon className="h-6 w-6" />
              </span>

              <div>
                <p className="text-[20px] font-black text-[#39342f]">
                  {item.title}
                </p>

                <p className="mt-1.5 text-[20px] font-bold leading-7 text-[#8b8177]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SectionHeading() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-12 rounded-full bg-[#c99a52]" />
        <p className="text-[20px] font-black text-[#a16e2d]">
          انتخاب و خرید
        </p>
      </div>

      <h2 className="mt-3 text-[31px] font-black leading-[1.5] text-[#302b27] sm:text-[38px]">
        محصولات فروشگاه
      </h2>

      <p className="mt-3 max-w-3xl text-[20px] font-medium leading-9 text-[#7b736b]">
        با استفاده از فیلترها و جستجو، سریع‌تر به محصول مناسب سفارش خودت
        برس.
      </p>
    </div>
  );
}

function ProductsToolbar({
  count,
  isLoading,
  activeFilters,
  onRemoveFilter,
  onClearFilters,
}: {
  count: number;
  isLoading: boolean;
  activeFilters: ActiveFilter[];
  onRemoveFilter: (key: ActiveFilter["key"]) => void;
  onClearFilters: () => void;
}) {
  return (
    <div
      id="products-results"
      className="mb-6 rounded-[24px] border border-[#e1d9ce] bg-white p-5 shadow-[0_18px_45px_-34px_rgba(45,39,33,0.28)] sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#302c28] text-white">
            <PackageIcon className="h-7 w-7" />
          </span>

          <div>
            <p className="text-[20px] font-black text-[#302b27]">
              {isLoading
                ? "در حال دریافت محصولات..."
                : count > 0
                  ? `${count.toLocaleString("fa-IR")} محصول`
                  : "محصولی یافت نشد"}
            </p>

            <p className="mt-1.5 text-[20px] font-bold text-[#8d8379]">
              نتایج بر اساس انتخاب‌های فعلی شما
            </p>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[14px] border border-[#ddd5ca] bg-[#faf8f5] px-5 text-[20px] font-black text-[#625a52] transition hover:border-[#c99a52] hover:bg-[#f6ede0] hover:text-[#7e541f]"
          >
            <TrashIcon className="h-5 w-5" />
            پاک‌کردن همه فیلترها
          </button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[#eee8e0] pt-5">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onRemoveFilter(filter.key)}
              className="group inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#e1d3bd] bg-[#faf3e8] px-4 text-[20px] font-black text-[#7d5727] transition hover:border-[#b98038] hover:bg-[#f3e4ce]"
              aria-label={`حذف فیلتر ${filter.label}`}
            >
              {filter.label}
              <CloseIcon className="h-4 w-4 transition-transform group-hover:rotate-90" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  categories,
  category,
  productType,
  giftUsage,
  minPrice,
  maxPrice,
  ordering,
  search,
  onCategoryChange,
  onProductTypeChange,
  onGiftUsageChange,
  onMinPriceChange,
  onMaxPriceChange,
  onOrderingChange,
  onSearchChange,
  onClear,
  hasActiveFilters,
  compact = false,
}: FilterPanelProps) {
  return (
    <div
      className={[
        "overflow-hidden border border-[#ded6cb] bg-white shadow-[0_20px_55px_-40px_rgba(45,39,33,0.35)]",
        compact
          ? "rounded-none border-x-0 border-b-0 shadow-none"
          : "rounded-[26px]",
      ].join(" ")}
    >
      {!compact && (
        <div className="border-b border-[#ece5dc] bg-[#302c28] p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.07] text-[#e2b973]">
              <FilterIcon className="h-6 w-6" />
            </span>

            <div>
              <p className="text-[20px] font-black">
                فیلتر محصولات
              </p>

              <p className="mt-1.5 text-[20px] font-bold text-[#cfc3b7]">
                نتیجه‌ها را دقیق‌تر کن
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="store-filter-scroll max-h-[calc(100dvh-200px)] overflow-y-auto p-5">
        <FilterSection
          title="جستجوی محصول"
          icon={SearchIcon}
          first
        >
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a0753c]" />

            <input
              value={search}
              onChange={(event) =>
                onSearchChange(event.target.value)
              }
              placeholder="نام محصول را بنویس..."
              className="h-[58px] w-full rounded-[15px] border border-[#e1d9ce] bg-[#faf8f5] pr-12 pl-4 text-[20px] font-bold text-[#39342f] outline-none transition placeholder:text-[#aaa198] focus:border-[#c99a52] focus:bg-white focus:ring-4 focus:ring-[#c99a52]/10"
            />
          </div>
        </FilterSection>

        <FilterSection title="دسته‌بندی" icon={GridIcon}>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange("")}
              className={filterOptionClass(!category)}
            >
              <span>همه محصولات</span>
              {!category && <CheckIcon className="h-5 w-5" />}
            </button>

            {categories.map((item) => {
              const isActive = category === item.slug;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onCategoryChange(item.slug)
                  }
                  className={filterOptionClass(isActive)}
                >
                  <span>{item.title}</span>
                  {isActive && (
                    <CheckIcon className="h-5 w-5" />
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="نوع محصول" icon={BoxIcon}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onProductTypeChange("")}
              className={filterChipClass(!productType)}
            >
              همه
            </button>

            {productTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onProductTypeChange(option.value)
                }
                className={filterChipClass(
                  productType === option.value,
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="کاربرد هدیه" icon={GiftIcon}>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onGiftUsageChange("")}
              className={filterChipClass(!giftUsage)}
            >
              همه
            </button>

            {giftUsageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  onGiftUsageChange(option.value)
                }
                className={filterChipClass(
                  giftUsage === option.value,
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="بازه قیمت" icon={WalletIcon}>
          <div className="grid gap-3">
            <PriceField
              label="حداقل قیمت"
              value={minPrice}
              placeholder="مثلاً ۲۰۰٬۰۰۰"
              onChange={onMinPriceChange}
            />

            <PriceField
              label="حداکثر قیمت"
              value={maxPrice}
              placeholder="مثلاً ۸۰۰٬۰۰۰"
              onChange={onMaxPriceChange}
            />
          </div>
        </FilterSection>

        <FilterSection
          title="مرتب‌سازی"
          icon={SortIcon}
        >
          <div className="relative">
            <select
              value={ordering}
              onChange={(event) =>
                onOrderingChange(event.target.value)
              }
              className="h-[56px] w-full appearance-none rounded-[15px] border border-[#e1d9ce] bg-[#faf8f5] px-4 pl-11 text-[20px] font-black text-[#39342f] outline-none transition focus:border-[#c99a52] focus:bg-white focus:ring-4 focus:ring-[#c99a52]/10"
            >
              {productSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <ChevronDownIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8c8176]" />
          </div>
        </FilterSection>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[16px] border border-[#e4d7c4] bg-[#faf4eb] px-5 text-[20px] font-black text-[#815924] transition hover:border-[#c99a52] hover:bg-[#f3e3cb]"
          >
            <TrashIcon className="h-5 w-5" />
            حذف همه فیلترها
          </button>
        )}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  icon: Icon,
  children,
  first = false,
}: {
  title: string;
  icon: (props: IconProps) => ReactNode;
  children: ReactNode;
  first?: boolean;
}) {
  return (
    <section
      className={first ? "" : "mt-6 border-t border-[#eee7de] pt-6"}
    >
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#f5ede0] text-[#98672c]">
          <Icon className="h-5 w-5" />
        </span>

        <h3 className="text-[20px] font-black text-[#37322e]">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function PriceField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: Dispatch<SetStateAction<string>>;
}) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-[20px] font-bold text-[#8f857b]">
        {label}
      </span>

      <div className="relative">
        <input
          inputMode="numeric"
          value={value}
          onChange={(event) =>
            onChange(normalizePrice(event.target.value))
          }
          placeholder={placeholder}
          className="h-[54px] w-full rounded-[14px] border border-[#e1d9ce] bg-[#faf8f5] px-4 pl-14 text-[20px] font-black text-[#39342f] outline-none transition placeholder:font-bold placeholder:text-[#aaa198] focus:border-[#c99a52] focus:bg-white focus:ring-4 focus:ring-[#c99a52]/10"
        />

        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] font-black text-[#9a9086]">
          تومان
        </span>
      </div>
    </label>
  );
}

function MobileFilterButton({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-[58px] items-center justify-center gap-3 rounded-[17px] border border-[#d9cdbd] bg-white px-6 text-[20px] font-black text-[#3b3631] shadow-[0_14px_35px_-28px_rgba(45,39,33,0.35)] transition hover:border-[#c99a52] hover:bg-[#faf5ed] xl:hidden"
    >
      <FilterIcon className="h-6 w-6 text-[#9a6b30]" />
      فیلتر محصولات

      {activeCount > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#302c28] px-1.5 text-[20px] font-black text-white">
          {activeCount.toLocaleString("fa-IR")}
        </span>
      )}
    </button>
  );
}

function MobileFilterDrawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={[
        "fixed inset-0 z-[120] xl:hidden",
        isOpen
          ? "visible pointer-events-auto"
          : "invisible pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        className={[
          "absolute inset-0 bg-[#1b1815]/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-label="بستن فیلترها"
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        className={[
          "absolute right-0 top-0 flex h-dvh w-[min(94vw,470px)] flex-col bg-[#fbfaf7] shadow-[-30px_0_80px_-40px_rgba(0,0,0,0.75)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
        aria-label="فیلتر محصولات"
      >
        <div className="flex min-h-[82px] items-center justify-between border-b border-[#e5ddd2] bg-white px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#302c28] text-white">
              <FilterIcon className="h-6 w-6" />
            </span>

            <div>
              <p className="text-[20px] font-black text-[#302b27]">
                فیلتر محصولات
              </p>

              <p className="mt-1.5 text-[20px] font-bold text-[#958a7f]">
                انتخاب‌های خودت را دقیق‌تر کن
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#e1d9ce] bg-[#faf8f5] text-[#5f5851] transition hover:border-[#c99a52] hover:bg-[#f5ecdf]"
            aria-label="بستن"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {children}
        </div>

        <div className="border-t border-[#e5ddd2] bg-white p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#302c28] px-5 text-[20px] font-black text-white transition hover:bg-[#9a6b30]"
          >
            مشاهده نتایج
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[26px] border border-red-200 bg-red-50 px-6 py-12 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-red-600 shadow-sm">
        <WarningIcon className="h-8 w-8" />
      </span>

      <h3 className="mt-5 text-[22px] font-black text-[#392f2e]">
        دریافت محصولات انجام نشد
      </h3>

      <p className="mx-auto mt-3 max-w-xl text-[20px] font-bold leading-9 text-red-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[15px] bg-red-600 px-7 text-[20px] font-black text-white transition hover:bg-red-700"
      >
        <RefreshIcon className="h-5 w-5" />
        تلاش دوباره
      </button>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-[#e3dcd2] bg-white shadow-[0_18px_45px_-35px_rgba(45,39,33,0.28)]"
        >
          <div className="store-skeleton aspect-[4/3]" />

          <div className="space-y-4 p-5 sm:p-6">
            <div className="flex gap-2">
              <div className="store-skeleton h-9 w-24 rounded-lg" />
              <div className="store-skeleton h-9 w-20 rounded-lg" />
            </div>

            <div className="store-skeleton h-7 w-4/5 rounded-lg" />
            <div className="store-skeleton h-16 rounded-xl" />

            <div className="border-t border-[#eee8e0] pt-4">
              <div className="store-skeleton h-8 w-2/3 rounded-lg" />
            </div>

            <div className="grid grid-cols-[1fr_54px] gap-3">
              <div className="store-skeleton h-[54px] rounded-[15px]" />
              <div className="store-skeleton h-[54px] rounded-[15px]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyProductsState({
  onClear,
}: {
  onClear: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-dashed border-[#d3b47f] bg-[#f8f2e9] px-6 py-16 text-center sm:py-20">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#d2ad70]/15 blur-[65px]" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-white blur-[60px]" />

      <div className="relative">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#dfc69d] bg-white text-[#9a6a2d] shadow-[0_18px_40px_-28px_rgba(73,52,27,0.4)]">
          <SearchOffIcon className="h-9 w-9" />
        </span>

        <h2 className="mt-6 text-[27px] font-black text-[#302b27]">
          محصولی با این مشخصات پیدا نشد
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-[20px] font-medium leading-9 text-[#766e66]">
          عبارت جستجو یا فیلترها را تغییر بده تا محصولات بیشتری نمایش داده
          شود.
        </p>

        <button
          type="button"
          onClick={onClear}
          className="mt-7 inline-flex min-h-[54px] items-center justify-center gap-2 rounded-[16px] bg-[#302c28] px-7 text-[20px] font-black text-white transition hover:bg-[#9a6b30]"
        >
          <RefreshIcon className="h-5 w-5" />
          نمایش همه محصولات
        </button>
      </div>
    </div>
  );
}

function CustomOrderBanner() {
  return (
    <section className="border-t border-[#e5ddd2] bg-[#f2eee6] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="relative overflow-hidden rounded-[32px] border border-[#d2ad70]/30 bg-[#302c28] px-6 py-9 text-white shadow-[0_35px_90px_-55px_rgba(0,0,0,0.75)] sm:px-9 lg:flex lg:items-center lg:justify-between lg:gap-8 lg:px-12 lg:py-11">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#d2ad70]/20 blur-[85px]" />
          <div className="pointer-events-none absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-white/[0.06] blur-[85px]" />

          <div className="relative flex items-start gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[21px] bg-[#d2ad70] text-[#302c28]">
              <PaletteIcon className="h-8 w-8" />
            </span>

            <div>
              <p className="text-[20px] font-black text-[#ddb77b]">
                سفارش اختصاصی
              </p>

              <h2 className="mt-2 text-[27px] font-black leading-[1.55] sm:text-[33px]">
                محصول موردنظرت در فروشگاه نیست؟
              </h2>

              <p className="mt-3 max-w-3xl text-[20px] font-medium leading-9 text-[#d3c8bc]">
                تصویر، طرح یا توضیحات ایده‌ات را بفرست تا امکان طراحی و
                اجرای اختصاصی آن را بررسی کنیم.
              </p>
            </div>
          </div>

          <a
            href="/design-request"
            className="relative mt-7 inline-flex min-h-[58px] items-center justify-center gap-3 rounded-[18px] bg-[#d2ad70] px-7 text-[20px] font-black text-[#302c28] transition hover:bg-[#e1bb79] lg:mt-0"
          >
            ثبت درخواست طراحی
            <ArrowLeftIcon className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  );
}

function categoryChipClass(isActive: boolean) {
  return [
    "inline-flex h-[50px] shrink-0 items-center justify-center rounded-full border px-5 text-[20px] font-black transition",
    isActive
      ? "border-[#302c28] bg-[#302c28] text-white shadow-[0_12px_28px_-20px_rgba(45,39,33,0.55)]"
      : "border-[#e1d9ce] bg-[#faf8f5] text-[#6f675f] hover:border-[#c99a52] hover:bg-[#f7efe3] hover:text-[#815723]",
  ].join(" ");
}

function filterOptionClass(isActive: boolean) {
  return [
    "flex min-h-[52px] w-full items-center justify-between rounded-[14px] border px-4 text-right text-[20px] font-black transition",
    isActive
      ? "border-[#c99a52] bg-[#f5ead8] text-[#794f1c]"
      : "border-transparent bg-[#faf8f5] text-[#6e665e] hover:border-[#dfcfb7] hover:bg-[#f7f1e8] hover:text-[#37322e]",
  ].join(" ");
}

function filterChipClass(isActive: boolean) {
  return [
    "flex min-h-[50px] items-center justify-center rounded-[13px] border px-3 text-center text-[20px] font-black transition",
    isActive
      ? "border-[#c99a52] bg-[#f5ead8] text-[#794f1c]"
      : "border-[#e5ddd3] bg-[#faf8f5] text-[#716960] hover:border-[#d2ad70] hover:bg-[#f7f0e6]",
  ].join(" ");
}

function normalizePrice(value: string) {
  return value.replace(/[^\d]/g, "");
}

function formatPrice(value: string) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "۰";
  }

  return number.toLocaleString("fa-IR");
}

function parsePositiveInteger(value: string | null) {
  const parsed = Number(value || "1");

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

/* Icons */

function SparklesIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />
      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
    </svg>
  );
}

function PackageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" />
      <path d="m8 5.2 8 4.5" />
    </svg>
  );
}

function GiftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M3 9h18v4H3z" />
      <path d="M5 13h14v8H5z" />
      <path d="M12 9v12" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9Z" />
      <path d="M12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </svg>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SearchCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M8 10.5l1.5 1.5L13 8.5" />
    </svg>
  );
}

function HeadsetIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M18 19h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-2v7h1Z" />
      <path d="M6 19H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2v7H6Z" />
      <path d="M18 19c0 1.1-.9 2-2 2h-3" />
    </svg>
  );
}

function ImageIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4-4L5 21" />
    </svg>
  );
}

function GridIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function FilterIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}

function BoxIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" />
    </svg>
  );
}

function WalletIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </svg>
  );
}

function SortIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M8 6h12M8 12h8M8 18h4" />
      <path d="M4 4v16M2 18l2 2 2-2" />
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function WarningIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 18h.01" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M20 7v5h-5" />
      <path d="M18.5 15a7 7 0 1 1-1-8.5L20 9" />
    </svg>
  );
}

function SearchOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5M4 4l16 16" />
    </svg>
  );
}
