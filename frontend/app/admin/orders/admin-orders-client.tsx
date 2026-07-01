"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import { AdminOrder, exportAdminOrdersCSV, getAdminOrders } from "@/lib/admin-api";

const currencyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const orderStatusOptions = [
  { value: "REGISTERED", label: "ثبت‌شده" },
  { value: "REVIEWING", label: "در حال بررسی" },
  { value: "WAITING_DESIGN_APPROVAL", label: "در انتظار تأیید طرح" },
  { value: "READY_FOR_PRINT", label: "آماده چاپ" },
  { value: "PRINTING", label: "در حال چاپ" },
  { value: "READY_TO_SHIP", label: "آماده ارسال" },
  { value: "SHIPPED", label: "ارسال‌شده" },
  { value: "DELIVERED", label: "تحویل‌شده" },
  { value: "CANCELLED", label: "لغوشده" },
];

const paymentStatusOptions = [
  { value: "pending", label: "در انتظار پرداخت" },
  { value: "successful", label: "موفق" },
  { value: "failed", label: "ناموفق" },
  { value: "canceled", label: "لغوشده" },
  { value: "expired", label: "منقضی‌شده" },
];

const deliveryMethodOptions = [
  { value: "SHIPPING", label: "ارسال به آدرس" },
  { value: "PICKUP", label: "تحویل حضوری" },
];

const inputClass =
  "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function formatCurrency(value: string) {
  return `${currencyFormatter.format(Number(value))} تومان`;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "warning" | "success" | "danger" }) {
  const className =
    tone === "warning"
      ? "bg-[#FFFBEB] text-[#92400E]"
      : tone === "success"
        ? "bg-[#ECFDF3] text-[#027A48]"
        : tone === "danger"
          ? "bg-[#FEF3F2] text-[#B42318]"
          : "bg-[#EEF1F4] text-[#364152]";

  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function getOrderTone(status: string) {
  if (["REGISTERED", "REVIEWING", "WAITING_DESIGN_APPROVAL"].includes(status)) return "warning" as const;
  if (["READY_FOR_PRINT", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(status)) return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "neutral" as const;
}

function getPaymentTone(status: string | null) {
  if (status === "successful") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "failed" || status === "canceled" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

function OrderActions({ order }: { order: AdminOrder }) {
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
    >
      جزئیات
    </Link>
  );
}

function OrdersLoading() {
  return (
    <div className="space-y-4">
      <div className="h-40 animate-pulse rounded-lg bg-white" />
      <div className="h-96 animate-pulse rounded-lg bg-white" />
    </div>
  );
}

export default function AdminOrdersClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders", page, search, status, paymentStatus, deliveryMethod, dateFrom, dateTo],
    queryFn: async () => {
      const response = await getAdminOrders({
        page,
        search,
        status,
        paymentStatus,
        deliveryMethod,
        dateFrom,
        dateTo,
      });
      return response.data;
    },
  });

  const totalPages = useMemo(() => {
    if (!ordersQuery.data?.count) return 1;
    return Math.max(1, Math.ceil(ordersQuery.data.count / 10));
  }, [ordersQuery.data?.count]);

  function resetPageOnChange(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPage(1);
      handler(event);
    };
  }

  function clearFilters() {
    setPage(1);
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setDeliveryMethod("");
    setDateFrom("");
    setDateTo("");
  }

  async function handleExport() {
    try {
      setIsExporting(true);
      setExportError(null);
      const response = await exportAdminOrdersCSV({
        search,
        status,
        paymentStatus,
        deliveryMethod,
        dateFrom,
        dateTo,
      });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      setExportError(getApiErrorMessage(error));
    } finally {
      setIsExporting(false);
    }
  }

  if (ordersQuery.isLoading) return <OrdersLoading />;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">مدیریت سفارش‌ها</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
              جستجو و پیگیری سفارش‌ها
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleExport()}
              disabled={isExporting}
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827] disabled:opacity-60"
            >
              {isExporting ? "در حال ساخت CSV" : "خروجی CSV"}
            </button>
            <button
              type="button"
              onClick={() => void ordersQuery.refetch()}
              disabled={ordersQuery.isFetching}
              className="inline-flex h-10 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4] disabled:opacity-60"
            >
              {ordersQuery.isFetching ? "در حال به‌روزرسانی" : "به‌روزرسانی"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr_auto]">
          <input
            value={search}
            onChange={resetPageOnChange((event) => setSearch(event.target.value))}
            placeholder="شماره سفارش، نام، تلفن، ایمیل یا کد پیگیری"
            className={inputClass}
          />
          <select
            value={status}
            onChange={resetPageOnChange((event) => setStatus(event.target.value))}
            className={inputClass}
          >
            <option value="">همه وضعیت‌ها</option>
            {orderStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={resetPageOnChange((event) => setPaymentStatus(event.target.value))}
            className={inputClass}
          >
            <option value="">همه پرداخت‌ها</option>
            {paymentStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={deliveryMethod}
            onChange={resetPageOnChange((event) => setDeliveryMethod(event.target.value))}
            className={inputClass}
          >
            <option value="">همه ارسال‌ها</option>
            {deliveryMethodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={resetPageOnChange((event) => setDateFrom(event.target.value))}
            className={inputClass}
          />
          <input
            type="date"
            value={dateTo}
            onChange={resetPageOnChange((event) => setDateTo(event.target.value))}
            className={inputClass}
          />
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4]"
          >
            پاک‌کردن
          </button>
        </div>
      </section>

      {exportError && (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
          {exportError}
        </section>
      )}

      {ordersQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
          <p className="text-sm font-black text-[#B42318]">خطا در دریافت سفارش‌ها</p>
          <p className="mt-2 text-sm font-medium text-[#697586]">
            {getApiErrorMessage(ordersQuery.error)}
          </p>
        </section>
      ) : ordersQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center">
          <p className="text-base font-black text-[#1F2933]">سفارشی پیدا نشد.</p>
          <p className="mt-2 text-sm font-bold text-[#697586]">
            فیلترها را تغییر بده یا جستجو را پاک کن.
          </p>
        </section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                <tr>
                  <th className="min-w-40 px-4 py-3">شماره سفارش</th>
                  <th className="min-w-48 px-4 py-3">مشتری</th>
                  <th className="px-4 py-3">شماره تماس</th>
                  <th className="px-4 py-3">مبلغ کل</th>
                  <th className="px-4 py-3">پرداخت</th>
                  <th className="px-4 py-3">وضعیت سفارش</th>
                  <th className="px-4 py-3">روش ارسال</th>
                  <th className="px-4 py-3">تاریخ ثبت</th>
                  <th className="px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data?.results.map((order) => (
                  <tr key={order.id} className="border-t border-[#E3E8EF]">
                    <td className="px-4 py-3">
                      <p className="font-black text-[#1F2933]">{order.order_number}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">
                        {numberFormatter.format(order.items_count)} قلم
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-[#1F2933]">{order.receiver_name}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">
                        {order.customer_email || "بدون ایمیل"}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{order.phone}</td>
                    <td className="px-4 py-3 font-black text-[#1F2933]">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={order.payment_status_label}
                        tone={getPaymentTone(order.payment_status)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={order.status_label} tone={getOrderTone(order.status)} />
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">
                      {order.delivery_method_label}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#697586]">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderActions order={order} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 xl:hidden">
            {ordersQuery.data?.results.map((order) => (
              <article key={order.id} className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#1F2933]">{order.order_number}</p>
                    <p className="mt-1 text-sm font-bold text-[#697586]">
                      {order.receiver_name} · {order.phone}
                    </p>
                  </div>
                  <StatusBadge label={order.status_label} tone={getOrderTone(order.status)} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-black text-[#697586]">مبلغ کل</p>
                    <p className="mt-1 font-black text-[#1F2933]">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#697586]">پرداخت</p>
                    <div className="mt-1">
                      <StatusBadge
                        label={order.payment_status_label}
                        tone={getPaymentTone(order.payment_status)}
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#697586]">روش ارسال</p>
                    <p className="mt-1 font-bold text-[#364152]">{order.delivery_method_label}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-[#697586]">تاریخ</p>
                    <p className="mt-1 font-bold text-[#364152]">{formatDate(order.created_at)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <OrderActions order={order} />
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[#E3E8EF] px-4 pb-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              label="صفحه‌بندی سفارش‌های مدیریت"
              onPageChange={setPage}
            />
          </div>
        </section>
      )}
    </div>
  );
}
