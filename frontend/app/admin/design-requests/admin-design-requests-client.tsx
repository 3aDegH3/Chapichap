"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import { AdminDesignRequest, getAdminDesignRequests } from "@/lib/admin-api";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const designStatusOptions = [
  { value: "received", label: "جدید" },
  { value: "reviewing", label: "در حال بررسی" },
  { value: "needs_info", label: "نیازمند اطلاعات بیشتر" },
  { value: "designing", label: "در حال طراحی" },
  { value: "ready_for_approval", label: "آماده تأیید" },
  { value: "approved", label: "تأییدشده" },
  { value: "rejected", label: "ردشده" },
  { value: "closed", label: "بسته‌شده" },
];

const orderTypeOptions = [
  { value: "print", label: "طرح آماده برای چاپ" },
  { value: "custom_print", label: "طرح اختصاصی برای چاپ" },
  { value: "gift", label: "هدیه اختصاصی" },
  { value: "caricature", label: "طراحی کاریکاتور" },
  { value: "consulting", label: "مشاوره طراحی" },
  { value: "other", label: "سایر" },
];

const inputClass =
  "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function getStatusTone(status: string) {
  if (["received", "reviewing", "needs_info"].includes(status)) return "warning" as const;
  if (["ready_for_approval", "approved"].includes(status)) return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "neutral" as const;
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

function RequestActions({ item }: { item: AdminDesignRequest }) {
  return (
    <Link
      href={`/admin/design-requests/${item.id}`}
      className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
    >
      جزئیات
    </Link>
  );
}

export default function AdminDesignRequestsClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [orderType, setOrderType] = useState("");

  const requestsQuery = useQuery({
    queryKey: ["admin-design-requests", page, search, status, orderType],
    queryFn: async () => {
      const response = await getAdminDesignRequests({ page, search, status, orderType });
      return response.data;
    },
  });

  const totalPages = useMemo(() => {
    if (!requestsQuery.data?.count) return 1;
    return Math.max(1, Math.ceil(requestsQuery.data.count / 10));
  }, [requestsQuery.data?.count]);

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
    setOrderType("");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">مدیریت درخواست‌های طراحی</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
              بررسی و پیگیری درخواست‌های طراحی
            </h2>
          </div>
          <button
            type="button"
            onClick={() => void requestsQuery.refetch()}
            disabled={requestsQuery.isFetching}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4] disabled:opacity-60"
          >
            {requestsQuery.isFetching ? "در حال به‌روزرسانی" : "به‌روزرسانی"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.6fr_1fr_1fr_auto]">
          <input
            value={search}
            onChange={resetPageOnChange((event) => setSearch(event.target.value))}
            placeholder="شماره، نام مشتری، تماس، محصول، سفارش یا فایل"
            className={inputClass}
          />
          <select
            value={status}
            onChange={resetPageOnChange((event) => setStatus(event.target.value))}
            className={inputClass}
          >
            <option value="">همه وضعیت‌ها</option>
            {designStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={orderType}
            onChange={resetPageOnChange((event) => setOrderType(event.target.value))}
            className={inputClass}
          >
            <option value="">همه نوع‌ها</option>
            {orderTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#EEF1F4] px-4 text-sm font-black text-[#364152] transition hover:bg-[#E3E8EF]"
          >
            پاک‌کردن
          </button>
        </div>
      </section>

      {requestsQuery.isLoading ? (
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      ) : requestsQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
          <p className="text-sm font-black text-[#B42318]">خطا در دریافت درخواست‌ها</p>
          <p className="mt-2 text-sm font-medium text-[#697586]">{getApiErrorMessage(requestsQuery.error)}</p>
        </section>
      ) : requestsQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center">
          <p className="text-base font-black text-[#1F2933]">درخواستی پیدا نشد.</p>
          <p className="mt-2 text-sm font-bold text-[#697586]">فیلترها را تغییر بده یا جستجو را پاک کن.</p>
        </section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                <tr>
                  <th className="px-4 py-3">شماره درخواست</th>
                  <th className="min-w-48 px-4 py-3">مشتری</th>
                  <th className="px-4 py-3">نوع محصول</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3">تعداد فایل</th>
                  <th className="px-4 py-3">تاریخ ثبت</th>
                  <th className="px-4 py-3">ارتباط</th>
                  <th className="px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {requestsQuery.data?.results.map((item) => (
                  <tr key={item.id} className="border-t border-[#E3E8EF]">
                    <td className="px-4 py-3 font-black text-[#1F2933]">{item.request_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-black text-[#1F2933]">{item.customer_name}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">{item.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{item.product_title || item.order_type_label}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={item.status_label} tone={getStatusTone(item.status)} />
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{numberFormatter.format(item.files_count)}</td>
                    <td className="px-4 py-3 font-bold text-[#697586]">{formatDate(item.created_at)}</td>
                    <td className="px-4 py-3 font-bold text-[#364152]">
                      {item.order ? (
                        <Link href={`/admin/orders/${item.order}`} className="underline-offset-4 hover:underline">
                          {item.order_number}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RequestActions item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {requestsQuery.data?.results.map((item) => (
              <article key={item.id} className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-[#1F2933]">{item.request_number}</p>
                    <p className="mt-1 text-sm font-bold text-[#697586]">{item.customer_name}</p>
                  </div>
                  <StatusBadge label={item.status_label} tone={getStatusTone(item.status)} />
                </div>
                <div className="mt-4 grid gap-2 text-sm font-bold text-[#364152]">
                  <p>{item.product_title || item.order_type_label}</p>
                  <p>{numberFormatter.format(item.files_count)} فایل</p>
                  <p className="text-[#697586]">{formatDate(item.created_at)}</p>
                </div>
                <div className="mt-4">
                  <RequestActions item={item} />
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[#E3E8EF] px-4 pb-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              label="صفحه‌بندی درخواست‌های طراحی"
              onPageChange={setPage}
            />
          </div>
        </section>
      )}
    </div>
  );
}
