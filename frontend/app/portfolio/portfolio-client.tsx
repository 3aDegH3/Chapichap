"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import PortfolioCard from "@/components/portfolio/PortfolioCard";
import PortfolioPreviewModal from "@/components/portfolio/PortfolioPreviewModal";
import {
  getPortfolioItems,
  type PortfolioItem,
  workTypeOptions,
} from "@/lib/portfolio-api";

const PAGE_SIZE = 10;

export default function PortfolioClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialPage = Number(searchParams.get("page") || "1");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(Number.isFinite(initialPage) ? initialPage : 1);
  const [workType, setWorkType] = useState(searchParams.get("type") || "");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (workType) params.set("type", workType);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
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

        if (!isMounted) return;
        setItems(data.results);
        setCount(data.count);
      } catch {
        if (!isMounted) return;
        setItems([]);
        setCount(0);
        setError("فعلا امکان دریافت نمونه‌کارها وجود ندارد.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadPortfolio();

    return () => {
      isMounted = false;
    };
  }, [page, workType, debouncedSearch]);

  function selectWorkType(nextWorkType: string) {
    setWorkType(nextWorkType);
    setPage(1);
  }

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-b from-pink-50/70 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black text-[var(--primary)]">
              نمونه‌کارهای واقعی
            </p>
            <h1 className="mt-4 text-3xl font-black leading-tight text-[var(--dark)] sm:text-5xl">
              کیفیت چاپ و طراحی را قبل از سفارش ببین
            </h1>
            <p className="mt-5 leading-8 text-gray-600">
              اینجا نمونه‌هایی از سفارش‌های انجام‌شده را می‌بینی؛ از ماگ و
              تیشرت تا پک‌های تبلیغاتی و هدیه‌های کاملا شخصی‌سازی‌شده.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <label
              htmlFor="portfolio-search"
              className="text-sm font-black text-[var(--dark)]"
            >
              جستجوی نمونه‌کار
            </label>
            <input
              id="portfolio-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="مثلا ماگ، برند، تولد، تیشرت"
              className="mt-3 h-12 w-full rounded-lg border border-gray-200 px-4 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-4 focus:ring-pink-100"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-black text-[var(--dark)]">نوع کار</p>
            <select
              value={workType}
              onChange={(event) => selectWorkType(event.target.value)}
              className="mt-3 h-12 w-full rounded-lg border border-gray-200 bg-white px-4 text-sm font-black text-gray-700 outline-none transition focus:border-[var(--secondary)] focus:ring-4 focus:ring-sky-100"
            >
              <option value="">همه نمونه‌کارها</option>
              {workTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-5 flex flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-black text-[var(--dark)]">
              {count > 0
                ? `${count.toLocaleString("fa-IR")} نمونه‌کار`
                : "نمونه‌کاری یافت نشد"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              برای دیدن جزئیات، روی هر نمونه‌کار کلیک کن.
            </p>
          </div>

          {(workType || debouncedSearch) && (
            <button
              type="button"
              onClick={() => {
                setWorkType("");
                setSearch("");
                setDebouncedSearch("");
                setPage(1);
              }}
              className="h-10 rounded-full border border-gray-200 px-4 text-sm font-black text-gray-700 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
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
          <PortfolioGridSkeleton />
        ) : items.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onPreview={setSelectedItem}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <EmptyPortfolioState />
        )}
      </section>

      <PortfolioPreviewModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </main>
  );
}

function PortfolioGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          <div className="aspect-square animate-pulse bg-gray-100" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-12 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyPortfolioState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
      <h2 className="text-xl font-black text-[var(--dark)]">
        نمونه‌کاری پیدا نشد
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
        عبارت جستجو یا نوع کار را تغییر بده تا نمونه‌کارهای بیشتری نمایش داده
        شود.
      </p>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="صفحه‌بندی نمونه‌کارها">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="h-11 rounded-full border border-gray-200 px-4 text-sm font-black text-gray-700 transition hover:border-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        قبلی
      </button>

      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1;

        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={[
              "h-11 min-w-11 rounded-full px-3 text-sm font-black transition",
              pageNumber === page
                ? "bg-[var(--dark)] text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:border-[var(--secondary)]",
            ].join(" ")}
          >
            {pageNumber.toLocaleString("fa-IR")}
          </button>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-11 rounded-full border border-gray-200 px-4 text-sm font-black text-gray-700 transition hover:border-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        بعدی
      </button>
    </nav>
  );
}
