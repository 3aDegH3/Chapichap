"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";

import PortfolioCard from "@/components/portfolio/PortfolioCard";
import PortfolioPreviewModal from "@/components/portfolio/PortfolioPreviewModal";
import Pagination from "@/components/ui/Pagination";
import {
  getPortfolioItems,
  type PortfolioItem,
  workTypeOptions,
} from "@/lib/portfolio-api";

type IconProps = SVGProps<SVGSVGElement>;

const PAGE_SIZE = 10;
const PORTFOLIO_HERO_IMAGE = "/portfolio/portfolio-hero.webp";

function getSafeInitialPage(value: string | null) {
  const parsedPage = Number(value || "1");

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return Math.floor(parsedPage);
}

export default function PortfolioClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resultsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const initialPage = getSafeInitialPage(searchParams.get("page"));

  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [count, setCount] = useState(0);

  const [page, setPage] = useState(initialPage);

  const [workType, setWorkType] = useState(searchParams.get("type") || "");

  const [search, setSearch] = useState(searchParams.get("q") || "");

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");

  const [retryKey, setRetryKey] = useState(0);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  const hasActiveFilters = Boolean(workType || debouncedSearch);

  const activeWorkTypeLabel = useMemo(() => {
    if (!workType) {
      return "";
    }

    return (
      workTypeOptions.find((option) => option.value === workType)?.label ||
      workType
    );
  }, [workType]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 450);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (workType) {
      params.set("type", workType);
    }

    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [workType, debouncedSearch, page, pathname, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadPortfolio() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getPortfolioItems({
          page,
          workType,
          search: debouncedSearch,
        });

        if (!isMounted) {
          return;
        }

        const calculatedTotalPages = Math.max(
          1,
          Math.ceil(data.count / PAGE_SIZE),
        );

        if (page > calculatedTotalPages && data.count > 0) {
          setPage(calculatedTotalPages);
          return;
        }

        setItems(data.results);
        setCount(data.count);
      } catch {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setCount(0);

        setError(
          "در حال حاضر امکان دریافت نمونه‌کارها وجود ندارد. اتصال اینترنت یا وضعیت سرور را بررسی کن و دوباره تلاش کن.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadPortfolio();

    return () => {
      isMounted = false;
    };
  }, [page, workType, debouncedSearch, retryKey]);

  function selectWorkType(nextWorkType: string) {
    setWorkType(nextWorkType);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);

    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  function clearAllFilters() {
    setWorkType("");
    setSearch("");
    setDebouncedSearch("");
    setPage(1);

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }

  function clearSearch() {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);

    window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }

  return (
    <main className="portfolio-page-shell min-h-screen overflow-hidden bg-[#fafaf8]">
      {/* Hero */}
      <section className="portfolio-hero relative overflow-hidden border-b border-[#dfd7cc] bg-[#f1ece3]">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="portfolio-hero-grid absolute inset-0 opacity-70" />

          <div className="absolute -right-56 -top-64 h-[680px] w-[680px] rounded-full bg-[#d2ad70]/20 blur-[120px]" />

          <div className="absolute -bottom-72 -left-48 h-[620px] w-[620px] rounded-full bg-white/75 blur-[120px]" />

          <div className="absolute left-[43%] top-[12%] h-4 w-4 rotate-45 rounded-[4px] border border-[#b98542]/45" />

          <div className="absolute left-[47%] top-[18%] h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#c89b59]/45" />
        </div>

        <div className="relative mx-auto grid max-w-[1840px] items-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(440px,0.95fr)] lg:px-12 lg:py-20 xl:gap-16 xl:py-24">
          <div className="max-w-5xl">
            <div className="inline-flex min-h-[56px] items-center gap-3 rounded-full border border-[#d7bd91] bg-white/80 px-5 text-[20px] font-black text-[#8b5c22] shadow-[0_14px_35px_-27px_rgba(80,55,25,0.5)] backdrop-blur-xl">
              <SparklesIcon className="h-7 w-7 text-[#ad7632]" />
              نمونه‌کارهای واقعی چاپی چاپ
            </div>

            <h1 className="mt-7 max-w-5xl text-[40px] font-black leading-[1.55] text-[#2f2b27] sm:text-[50px] lg:text-[58px] xl:text-[64px]">
              نتیجه واقعی طراحی و چاپ را
              <span className="portfolio-hero-title-highlight relative mx-2 inline-block text-[#a66f2d]">
                قبل از سفارش
              </span>
              ببین.
            </h1>

            <p className="mt-6 max-w-4xl text-[21px] font-medium leading-[2.05] text-[#706960] sm:text-[23px]">
              از ماگ و پوشاک چاپی تا پک‌های هدیه و پروژه‌های سازمانی؛ نمونه‌های
              اجراشده را بررسی کن، جزئیات کیفیت را ببین و برای سفارش اختصاصی
              خودت ایده بگیر.
            </p>

            <div className="mt-7 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="portfolio-hero-benefit flex min-h-[74px] items-center gap-3 rounded-[19px] border border-[#ded4c6] bg-white/65 px-4 backdrop-blur-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#efe1ca] text-[#946126]">
                  <GalleryIcon className="h-6 w-6" />
                </span>
                <span className="text-[20px] font-black leading-8 text-[#464039]">
                  اجرای واقعی
                </span>
              </div>

              <div className="portfolio-hero-benefit flex min-h-[74px] items-center gap-3 rounded-[19px] border border-[#ded4c6] bg-white/65 px-4 backdrop-blur-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#efe1ca] text-[#946126]">
                  <PaletteIcon className="h-6 w-6" />
                </span>
                <span className="text-[20px] font-black leading-8 text-[#464039]">
                  قابل شخصی‌سازی
                </span>
              </div>

              <div className="portfolio-hero-benefit flex min-h-[74px] items-center gap-3 rounded-[19px] border border-[#ded4c6] bg-white/65 px-4 backdrop-blur-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#efe1ca] text-[#946126]">
                  <SearchIcon className="h-6 w-6" />
                </span>
                <span className="text-[20px] font-black leading-8 text-[#464039]">
                  جزئیات کامل
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => {
                  resultsRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
                className="group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[19px] bg-[#302d29] px-8 text-[21px] font-black text-white shadow-[0_24px_45px_-26px_rgba(48,45,41,0.8)] transition duration-300 hover:-translate-y-1 hover:bg-[#a87332]"
              >
                <GalleryIcon className="h-7 w-7" />
                مشاهده نمونه‌کارها
                <ArrowDownIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1" />
              </button>

              <Link
                href="/design-request"
                className="group inline-flex min-h-[66px] items-center justify-center gap-3 rounded-[19px] border border-[#d2c2aa] bg-white/80 px-8 text-[21px] font-black text-[#453e37] shadow-[0_18px_38px_-30px_rgba(60,47,32,0.45)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-[#c3924c] hover:bg-white hover:text-[#895a22]"
              >
                <PaletteIcon className="h-7 w-7 text-[#a16d2d]" />
                سفارش طراحی اختصاصی
                <ArrowLeftIcon className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="portfolio-hero-artwork relative mx-auto w-full max-w-[670px] lg:justify-self-end">
            <div
              className="pointer-events-none absolute -inset-5 rotate-3 rounded-[46px] border border-[#d2ad70]/35"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-7 -right-7 h-40 w-40 rounded-[35px] bg-[#d2ad70]/20 blur-[35px]"
              aria-hidden="true"
            />

            <div className="portfolio-hero-image-shell relative overflow-hidden rounded-[38px] border border-white/90 bg-white p-3 shadow-[0_45px_100px_-55px_rgba(55,43,29,0.72)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[30px] bg-[#e9dfd0]">
                <Image
                  src={PORTFOLIO_HERO_IMAGE}
                  alt="نمونه محصولات چاپی، هدیه اختصاصی و بسته‌بندی چاپی چاپ"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 42vw"
                  className="portfolio-hero-image absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1f1a15]/70 via-transparent to-white/10" />




              </div>
            </div>


          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1840px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        {/* Search and filters */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="rounded-[26px] border border-[#e3ded5] bg-white p-5 shadow-[0_22px_55px_-42px_rgba(51,50,48,0.5)] sm:p-6">
            <label
              htmlFor="portfolio-search"
              className="flex items-center gap-3 text-[21px] font-black text-[#333230]"
            >
              <SearchIcon className="h-7 w-7 text-[#a16d2d]" />
              جست‌وجوی نمونه‌کار
            </label>

            <p className="mt-2 text-[20px] font-medium leading-9 text-[#77716a]">
              عنوان، نوع محصول، مناسبت یا نام پروژه موردنظرت را وارد کن.
            </p>

            <div className="relative mt-5">
              <SearchIcon className="pointer-events-none absolute right-5 top-1/2 h-7 w-7 -translate-y-1/2 text-[#a2773d]" />

              <input
                ref={searchInputRef}
                id="portfolio-search"
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
                placeholder="مثلاً ماگ، پک نوروزی، برند، تولد یا تیشرت"
                className="h-[66px] w-full rounded-[18px] border border-[#ded7ce] bg-[#fffdf9] pr-14 pl-16 text-[20px] font-bold text-[#333230] outline-none transition duration-300 placeholder:text-[20px] placeholder:font-medium placeholder:text-[#9b948c] focus:border-[#d2ad70] focus:bg-white focus:ring-4 focus:ring-[#d2ad70]/20"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-[13px] text-[#77716a] transition hover:bg-[#f2eee6] hover:text-[#333230]"
                  aria-label="پاک کردن عبارت جست‌وجو"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[26px] border border-[#e3ded5] bg-white p-5 shadow-[0_22px_55px_-42px_rgba(51,50,48,0.5)] sm:p-6">
            <label
              htmlFor="portfolio-work-type"
              className="flex items-center gap-3 text-[21px] font-black text-[#333230]"
            >
              <FilterIcon className="h-7 w-7 text-[#a16d2d]" />
              نوع نمونه‌کار
            </label>

            <p className="mt-2 text-[20px] font-medium leading-9 text-[#77716a]">
              نمونه‌ها را بر اساس نوع اجرا محدود کن.
            </p>

            <div className="relative mt-5">
              <select
                id="portfolio-work-type"
                value={workType}
                onChange={(event) => {
                  selectWorkType(event.target.value);
                }}
                className="h-[66px] w-full appearance-none rounded-[18px] border border-[#ded7ce] bg-[#fffdf9] px-5 pl-14 text-[20px] font-black text-[#333230] outline-none transition duration-300 focus:border-[#d2ad70] focus:bg-white focus:ring-4 focus:ring-[#d2ad70]/20"
              >
                <option value="">همه نمونه‌کارها</option>

                {workTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDownIcon className="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-[#8c6029]" />
            </div>
          </div>
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[22px] border border-[#dfd5c7] bg-[#f7f2ea] p-4 sm:p-5">
            <span className="inline-flex items-center gap-2 text-[20px] font-black text-[#514a43]">
              <FilterIcon className="h-6 w-6 text-[#9e6b2b]" />
              فیلترهای فعال:
            </span>

            {activeWorkTypeLabel && (
              <button
                type="button"
                onClick={() => {
                  selectWorkType("");
                }}
                className="inline-flex min-h-[50px] items-center gap-3 rounded-full border border-[#d8bd8c] bg-white px-5 text-[20px] font-black text-[#875820] transition hover:border-[#b2894c] hover:bg-[#f4eadb]"
              >
                {activeWorkTypeLabel}

                <CloseIcon className="h-5 w-5" />
              </button>
            )}

            {debouncedSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="inline-flex min-h-[50px] items-center gap-3 rounded-full border border-[#d8bd8c] bg-white px-5 text-[20px] font-black text-[#875820] transition hover:border-[#b2894c] hover:bg-[#f4eadb]"
              >
                جست‌وجو: {debouncedSearch}
                <CloseIcon className="h-5 w-5" />
              </button>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="mr-auto inline-flex min-h-[50px] items-center gap-2 rounded-[15px] border border-[#d8d0c6] bg-white px-5 text-[20px] font-black text-[#625b54] transition hover:border-[#d2ad70] hover:bg-[#333230] hover:text-white"
            >
              <RefreshIcon className="h-6 w-6" />
              پاک کردن همه
            </button>
          </div>
        )}

        {/* Results summary */}
        <div
          ref={resultsRef}
          className="mt-7 scroll-mt-28 rounded-[26px] border border-[#e3ded5] bg-white p-5 shadow-[0_22px_55px_-42px_rgba(51,50,48,0.5)] sm:p-6"
        >
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#f4ebdd] text-[#956326]">
                <GalleryIcon className="h-8 w-8" />
              </span>

              <div>
                <p
                  className="text-[25px] font-black leading-10 text-[#333230]"
                  aria-live="polite"
                >
                  {count > 0
                    ? `${count.toLocaleString("fa-IR")} نمونه‌کار پیدا شد`
                    : isLoading
                      ? "در حال دریافت نمونه‌کارها"
                      : "نمونه‌کاری پیدا نشد"}
                </p>

                <p className="mt-1 text-[20px] font-medium leading-9 text-[#77716a]">
                  برای مشاهده تصاویر، توضیحات و جزئیات کامل روی هر نمونه‌کار
                  کلیک کن.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex min-h-[52px] items-center rounded-full border border-[#e1d8cd] bg-[#faf8f4] px-5 text-[20px] font-black text-[#655e57]">
                صفحه {page.toLocaleString("fa-IR")} از{" "}
                {totalPages.toLocaleString("fa-IR")}
              </span>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="inline-flex min-h-[52px] items-center gap-2 rounded-[15px] border border-[#ded6cc] bg-white px-5 text-[20px] font-black text-[#6d655e] transition hover:border-[#d2ad70] hover:bg-[#f6f1e8] hover:text-[#333230]"
                >
                  <RefreshIcon className="h-6 w-6" />
                  نمایش همه نمونه‌ها
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mt-7" aria-busy={isLoading}>
          {error && (
            <ErrorState
              message={error}
              onRetry={() => {
                setRetryKey((currentKey) => currentKey + 1);
              }}
            />
          )}

          {!error && isLoading && <PortfolioGridSkeleton />}

          {!error && !isLoading && items.length > 0 && (
            <>
              <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {items.map((portfolioItem) => (
                  <div
                    key={portfolioItem.id}
                    className="portfolio-card-font-guard"
                  >
                    <PortfolioCard
                      item={portfolioItem}
                      onPreview={setSelectedItem}
                    />
                  </div>
                ))}
              </div>

              <div className="portfolio-pagination-zone mt-10">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  label="صفحه‌بندی نمونه‌کارها"
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}

          {!error && !isLoading && items.length === 0 && (
            <EmptyPortfolioState
              hasActiveFilters={hasActiveFilters}
              onClear={clearAllFilters}
            />
          )}
        </div>

        {/* Bottom CTA */}
        <section className="mt-12 overflow-hidden rounded-[32px] border border-[#d8c5a4] bg-[#302c28] shadow-[0_35px_80px_-50px_rgba(48,44,40,0.8)]">
          <div className="relative grid gap-7 px-6 py-9 sm:px-9 lg:grid-cols-[1fr_auto] lg:items-center lg:px-12 lg:py-11">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d2ad70]/15 blur-3xl" />

              <div className="absolute -bottom-20 left-[25%] h-56 w-56 rounded-full bg-white/5 blur-3xl" />
            </div>

            <div className="relative">
              <p className="text-[21px] font-black text-[#d9b97e]">
                ایده‌ای متفاوت داری؟
              </p>

              <h2 className="mt-3 text-[31px] font-black leading-[1.65] text-white sm:text-[38px]">
                پروژه اختصاصی خودت را برای ما تعریف کن
              </h2>

              <p className="mt-3 max-w-4xl text-[21px] font-medium leading-10 text-white/75">
                فایل، تصویر یا توضیحات سفارشت را ارسال کن تا پیش از اجرا بررسی
                شود و مناسب‌ترین روش طراحی و چاپ به تو پیشنهاد داده شود.
              </p>
            </div>

            <Link
              href="/design-request"
              className="relative inline-flex min-h-[68px] items-center justify-center gap-3 rounded-[20px] bg-[#d2ad70] px-8 text-[22px] font-black text-[#302c28] transition duration-300 hover:-translate-y-1 hover:bg-white"
            >
              ثبت سفارش اختصاصی
              <ArrowLeftIcon className="h-7 w-7" />
            </Link>
          </div>
        </section>
      </section>

      <PortfolioPreviewModal
        key={selectedItem?.id ?? "closed"}
        item={selectedItem}
        onClose={() => {
          setSelectedItem(null);
        }}
        onPreview={(relatedItem) => {
          setSelectedItem(relatedItem);
        }}
      />

      <style jsx global>{`
        /*
         * محافظ فونت کارت‌ها:
         * حتی اگر داخل PortfolioCard کلاس text-sm یا text-xs
         * باقی مانده باشد، نوشته‌ها کمتر از ۲۰ پیکسل نمی‌شوند.
         */
        .portfolio-card-font-guard p,
        .portfolio-card-font-guard span,
        .portfolio-card-font-guard button {
          font-size: 20px !important;
          line-height: 1.9 !important;
        }

        .portfolio-card-font-guard h2 {
          font-size: 27px !important;
          line-height: 1.65 !important;
        }

        .portfolio-card-font-guard article > button {
          font-size: 20px !important;
        }

        /*
         * محافظ فونت صفحه‌بندی
         */
        .portfolio-pagination-zone button,
        .portfolio-pagination-zone a,
        .portfolio-pagination-zone span,
        .portfolio-pagination-zone p {
          min-height: 48px;
          font-size: 20px !important;
          line-height: 1.7 !important;
        }

        /*
         * حداقل اندازه نوشته‌های فرم
         */
        .portfolio-page-shell input,
        .portfolio-page-shell select,
        .portfolio-page-shell option {
          font-size: 20px !important;
        }

        .portfolio-page-shell input::placeholder {
          font-size: 20px !important;
        }

        .portfolio-hero-grid {
          background-image:
            linear-gradient(rgba(116, 84, 44, 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(116, 84, 44, 0.07) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, black, transparent 96%);
        }

        .portfolio-hero-title-highlight::after {
          content: "";
          position: absolute;
          right: 0;
          bottom: 5px;
          z-index: -1;
          width: 100%;
          height: 13px;
          border-radius: 999px;
          background: rgba(210, 173, 112, 0.2);
        }

        .portfolio-hero-benefit {
          transition:
            transform 300ms ease,
            border-color 300ms ease,
            background-color 300ms ease,
            box-shadow 300ms ease;
        }

        .portfolio-hero-benefit:hover {
          transform: translateY(-4px);
          border-color: rgba(185, 133, 66, 0.48);
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 20px 40px -32px rgba(61, 45, 28, 0.55);
        }

        .portfolio-hero-image-shell {
          transform: translateZ(0);
        }

        .portfolio-hero-image {
          transition:
            transform 1.1s cubic-bezier(0.22, 1, 0.36, 1),
            filter 1.1s ease;
        }

        .portfolio-hero-artwork:hover .portfolio-hero-image {
          transform: scale(1.045);
          filter: saturate(1.04) contrast(1.015);
        }

        .portfolio-hero-floating-card {
          animation: portfolio-hero-floating 4.8s ease-in-out infinite;
        }

        @keyframes portfolio-hero-floating {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }

          50% {
            transform: translateY(-9px) rotate(1deg);
          }
        }

        .portfolio-page-shell ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .portfolio-page-shell ::-webkit-scrollbar-track {
          background: #f1ece5;
        }

        .portfolio-page-shell ::-webkit-scrollbar-thumb {
          border: 2px solid #f1ece5;
          border-radius: 999px;
          background: #c8a36a;
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-hero-floating-card {
            animation: none !important;
          }

          .portfolio-hero-image {
            transition: none !important;
          }

          .portfolio-hero-artwork:hover .portfolio-hero-image {
            transform: none !important;
          }
        }
      `}</style>
    </main>
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
    <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-white text-red-600 shadow-sm">
          <AlertIcon className="h-8 w-8" />
        </span>

        <div className="flex-1">
          <h2 className="text-[26px] font-black leading-10 text-red-900">
            دریافت نمونه‌کارها ناموفق بود
          </h2>

          <p className="mt-2 text-[20px] font-bold leading-10 text-red-700">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-[58px] items-center justify-center gap-3 rounded-[17px] border border-red-200 bg-white px-6 text-[20px] font-black text-red-700 transition hover:bg-red-700 hover:text-white"
        >
          <RefreshIcon className="h-6 w-6" />
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

function PortfolioGridSkeleton() {
  return (
    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[28px] border border-[#e3ded5] bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-[#e3ded5]" />

          <div className="space-y-5 p-6">
            <div className="flex justify-between gap-4">
              <div className="h-12 w-32 animate-pulse rounded-[15px] bg-[#e3ded5]" />

              <div className="h-12 w-28 animate-pulse rounded-[15px] bg-[#e3ded5]" />
            </div>

            <div className="h-9 w-4/5 animate-pulse rounded-xl bg-[#e3ded5]" />

            <div className="space-y-3">
              <div className="h-6 animate-pulse rounded bg-[#e8e3dc]" />

              <div className="h-6 animate-pulse rounded bg-[#e8e3dc]" />

              <div className="h-6 w-2/3 animate-pulse rounded bg-[#e8e3dc]" />
            </div>

            <div className="h-16 animate-pulse rounded-[18px] bg-[#e8e3dc]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPortfolioState({
  hasActiveFilters,
  onClear,
}: {
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-[30px] border border-dashed border-[#d2ad70]/65 bg-[#f6f1e8] px-6 py-16 text-center sm:px-10 sm:py-20">
      <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#dec493] bg-white text-[#9c692b] shadow-[0_18px_38px_-27px_rgba(70,47,23,0.4)]">
        <SearchIcon className="h-11 w-11" />
      </span>

      <h2 className="mt-7 text-[31px] font-black leading-[1.6] text-[#333230] sm:text-[36px]">
        نمونه‌کاری پیدا نشد
      </h2>

      <p className="mx-auto mt-4 max-w-3xl text-[22px] font-medium leading-[2] text-[#746e67]">
        عبارت جست‌وجو یا نوع کار را تغییر بده تا نمونه‌کارهای بیشتری نمایش داده
        شود.
      </p>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-7 inline-flex min-h-[62px] items-center justify-center gap-3 rounded-[18px] bg-[#333230] px-7 text-[21px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[#b2894c]"
        >
          <RefreshIcon className="h-7 w-7" />
          حذف فیلترها و نمایش همه
        </button>
      )}
    </div>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />
      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
    </svg>
  );
}

function GalleryIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />

      <circle cx="9" cy="10" r="2" />

      <path d="m21 15-5-5L5 20" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />

      <path d="m20 20-4-4" />
    </svg>
  );
}

function FilterIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />

      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />

      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />

      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrowDownIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18.5 9A7 7 0 0 0 6.7 6.7L4 9M5.5 15A7 7 0 0 0 17.3 17.3L20 15" />
    </svg>
  );
}

function AlertIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 2.5 20h19L12 3Z" />

      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}
