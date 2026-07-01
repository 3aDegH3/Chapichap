"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, useMemo, useState } from "react";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import {
  AdminProduct,
  getAdminProductCategories,
  getAdminProducts,
  softDeleteAdminProduct,
  toggleAdminProductActive,
} from "@/lib/admin-api";

const currencyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const orderingOptions = [
  { value: "-updated_at", label: "آخرین تغییر" },
  { value: "price", label: "قیمت کم به زیاد" },
  { value: "-price", label: "قیمت زیاد به کم" },
  { value: "stock_quantity", label: "موجودی کم به زیاد" },
  { value: "-stock_quantity", label: "موجودی زیاد به کم" },
  { value: "title", label: "نام محصول" },
];

function formatCurrency(value: string) {
  return `${currencyFormatter.format(Number(value))} تومان`;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function ProductImage({ product }: { product: AdminProduct }) {
  if (!product.image_url) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#D5DAE1] bg-[#F8FAFC] text-xs font-black text-[#697586]">
        بدون
      </div>
    );
  }

  return (
    <Image
      src={product.image_url}
      alt={product.title}
      width={56}
      height={56}
      className="h-14 w-14 rounded-md border border-[#D5DAE1] object-cover"
      unoptimized
    />
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={[
        "inline-flex rounded-md px-2.5 py-1 text-xs font-black",
        isActive ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#EEF1F4] text-[#697586]",
      ].join(" ")}
    >
      {isActive ? "فعال" : "غیرفعال"}
    </span>
  );
}

function StockBadge({ quantity }: { quantity: number }) {
  const isLow = quantity <= 5;
  const isEmpty = quantity === 0;

  return (
    <span
      className={[
        "inline-flex rounded-md px-2.5 py-1 text-xs font-black",
        isEmpty
          ? "bg-[#FEF3F2] text-[#B42318]"
          : isLow
            ? "bg-[#FFFBEB] text-[#92400E]"
            : "bg-[#EEF1F4] text-[#364152]",
      ].join(" ")}
    >
      {numberFormatter.format(quantity)}
    </span>
  );
}

function ProductStockBadge({ product }: { product: AdminProduct }) {
  if (product.unlimited_stock) {
    return (
      <span className="inline-flex rounded-md bg-[#ECFDF3] px-2.5 py-1 text-xs font-black text-[#027A48]">
        نامحدود
      </span>
    );
  }

  return <StockBadge quantity={product.stock_quantity} />;
}

function ProductActions({
  product,
  onToggle,
  onDelete,
  isBusy,
}: {
  product: AdminProduct;
  onToggle: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
  isBusy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/products/${product.id}`}
        className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
      >
        ویرایش
      </Link>
      <button
        type="button"
        disabled={isBusy}
        onClick={() => onToggle(product)}
        className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4] disabled:opacity-60"
      >
        {product.is_active ? "غیرفعال‌کردن" : "فعال‌کردن"}
      </button>
      <button
        type="button"
        disabled={isBusy || !product.is_active}
        onClick={() => onDelete(product)}
        className="inline-flex h-9 items-center rounded-md border border-[#F3B1A6] bg-white px-3 text-xs font-black text-[#B42318] transition hover:bg-[#FEF3F2] disabled:opacity-50"
      >
        حذف نرم
      </button>
    </div>
  );
}

function ProductsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-36 animate-pulse rounded-lg bg-white" />
      <div className="h-96 animate-pulse rounded-lg bg-white" />
    </div>
  );
}

export default function AdminProductsClient() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState<"in_stock" | "out_of_stock" | "">("");
  const [isActive, setIsActive] = useState<"true" | "false" | "">("");
  const [ordering, setOrdering] = useState("-updated_at");

  const productsQuery = useQuery({
    queryKey: ["admin-products", page, search, category, availability, isActive, ordering],
    queryFn: async () => {
      const response = await getAdminProducts({
        page,
        search,
        category,
        availability,
        isActive,
        ordering,
      });
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: async () => {
      const response = await getAdminProductCategories();
      return response.data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (productId: number) => toggleAdminProductActive(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => softDeleteAdminProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const totalPages = useMemo(() => {
    if (!productsQuery.data?.count) return 1;
    return Math.max(1, Math.ceil(productsQuery.data.count / 10));
  }, [productsQuery.data?.count]);

  function resetPageOnChange(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPage(1);
      handler(event);
    };
  }

  function handleToggle(product: AdminProduct) {
    toggleMutation.mutate(product.id);
  }

  function handleDelete(product: AdminProduct) {
    const confirmed = window.confirm(`محصول «${product.title}» غیرفعال شود؟`);
    if (confirmed) deleteMutation.mutate(product.id);
  }

  const busyProductId =
    Number(toggleMutation.variables || 0) || Number(deleteMutation.variables || 0) || null;
  const mutationError = toggleMutation.error || deleteMutation.error;

  if (productsQuery.isLoading) return <ProductsLoading />;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">مدیریت محصولات</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
              لیست محصولات فروشگاه
            </h2>
          </div>
          <Link
            href="/admin/products/new"
            className="inline-flex h-10 items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827]"
          >
            افزودن محصول
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]">
          <input
            value={search}
            onChange={resetPageOnChange((event) => setSearch(event.target.value))}
            placeholder="جستجو با نام، slug یا توضیحات"
            className="h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20"
          />
          <select
            value={category}
            onChange={resetPageOnChange((event) => setCategory(event.target.value))}
            className="h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20"
          >
            <option value="">همه دسته‌ها</option>
            {categoriesQuery.data?.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.title}
              </option>
            ))}
          </select>
          <select
            value={availability}
            onChange={resetPageOnChange((event) => setAvailability(event.target.value as typeof availability))}
            className="h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20"
          >
            <option value="">همه موجودی‌ها</option>
            <option value="in_stock">موجود</option>
            <option value="out_of_stock">ناموجود</option>
          </select>
          <select
            value={isActive}
            onChange={resetPageOnChange((event) => setIsActive(event.target.value as typeof isActive))}
            className="h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
          <select
            value={ordering}
            onChange={resetPageOnChange((event) => setOrdering(event.target.value))}
            className="h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20"
          >
            {orderingOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {mutationError && (
        <div className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
          {getApiErrorMessage(mutationError)}
        </div>
      )}

      {productsQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
          <p className="text-sm font-black text-[#B42318]">خطا در دریافت محصولات</p>
          <p className="mt-2 text-sm font-medium text-[#697586]">
            {getApiErrorMessage(productsQuery.error)}
          </p>
          <button
            type="button"
            onClick={() => void productsQuery.refetch()}
            className="mt-5 inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827]"
          >
            تلاش دوباره
          </button>
        </section>
      ) : productsQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center">
          <p className="text-base font-black text-[#1F2933]">محصولی پیدا نشد.</p>
          <p className="mt-2 text-sm font-bold text-[#697586]">
            فیلترها را تغییر بده یا محصول جدید اضافه کن.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                <tr>
                  <th className="w-20 px-4 py-3">تصویر</th>
                  <th className="min-w-56 px-4 py-3">نام محصول</th>
                  <th className="px-4 py-3">دسته‌بندی</th>
                  <th className="px-4 py-3">قیمت</th>
                  <th className="px-4 py-3">قیمت تخفیف</th>
                  <th className="px-4 py-3">موجودی</th>
                  <th className="px-4 py-3">انتشار</th>
                  <th className="px-4 py-3">آخرین تغییر</th>
                  <th className="min-w-64 px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {productsQuery.data?.results.map((product) => (
                  <tr key={product.id} className="border-t border-[#E3E8EF]">
                    <td className="px-4 py-3">
                      <ProductImage product={product} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-[#1F2933]">{product.title}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">{product.slug}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">
                      {product.category_detail?.title || "بدون دسته‌بندی"}
                    </td>
                    <td className="px-4 py-3 font-black text-[#1F2933]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#697586]">
                      {product.has_active_discount && product.discount_price
                        ? formatCurrency(product.discount_price)
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <ProductStockBadge product={product} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={product.is_active} />
                    </td>
                    <td className="px-4 py-3 font-bold text-[#697586]">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <ProductActions
                        product={product}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        isBusy={busyProductId === product.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {productsQuery.data?.results.map((product) => (
              <article key={product.id} className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex gap-3">
                  <ProductImage product={product} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-[#1F2933]">{product.title}</p>
                    <p className="mt-1 text-xs font-bold text-[#697586]">
                      {product.category_detail?.title || "بدون دسته‌بندی"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-black text-[#697586]">قیمت</p>
                    <p className="mt-1 font-black text-[#1F2933]">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#697586]">موجودی</p>
                    <div className="mt-1">
                      <ProductStockBadge product={product} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#697586]">انتشار</p>
                    <div className="mt-1">
                      <StatusBadge isActive={product.is_active} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#697586]">آخرین تغییر</p>
                    <p className="mt-1 font-bold text-[#364152]">{formatDate(product.updated_at)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <ProductActions
                    product={product}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                    isBusy={busyProductId === product.id}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[#E3E8EF] px-4 pb-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              label="صفحه‌بندی محصولات مدیریت"
              onPageChange={setPage}
            />
          </div>
        </section>
      )}
    </div>
  );
}
