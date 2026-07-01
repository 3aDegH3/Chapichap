"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import { AdminActivityLog, getAdminActivityLogs } from "@/lib/admin-api";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const inputClass = "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

const actionOptions = [
  ["order_status_changed", "تغییر وضعیت سفارش"],
  ["product_price_changed", "تغییر قیمت محصول"],
  ["product_inventory_changed", "تغییر موجودی محصول"],
  ["product_deleted", "حذف محصول"],
  ["sensitive_file_viewed", "مشاهده فایل حساس"],
  ["sensitive_file_downloaded", "دانلود فایل حساس"],
  ["design_request_replied", "پاسخ به درخواست طراحی"],
  ["admin_access_changed", "تغییر دسترسی مدیر"],
] as const;

const entityOptions = [
  ["order", "سفارش"],
  ["product", "محصول"],
  ["customer_file", "فایل مشتری"],
  ["design_request", "درخواست طراحی"],
  ["admin_user", "مدیر"],
] as const;

function entityHref(item: AdminActivityLog) {
  if (!/^\d+$/.test(item.entity_id)) return null;
  if (item.entity_type === "order") return `/admin/orders/${item.entity_id}`;
  if (item.entity_type === "product") return `/admin/products/${item.entity_id}`;
  if (item.entity_type === "design_request") return `/admin/design-requests/${item.entity_id}`;
  return null;
}

function ActionBadge({ item }: { item: AdminActivityLog }) {
  const tone = item.action.includes("deleted")
    ? "bg-[#FEF3F2] text-[#B42318]"
    : item.action.includes("file")
      ? "bg-[#FFF6ED] text-[#B54708]"
      : item.action.includes("order")
        ? "bg-[#EFF8FF] text-[#175CD3]"
        : "bg-[#EEF1F4] text-[#364152]";
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ${tone}`}>{item.action_label}</span>;
}

export default function AdminActivityLogsClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const logsQuery = useQuery({
    queryKey: ["admin-activity-logs", page, search, action, entityType, dateFrom, dateTo],
    queryFn: async () => (await getAdminActivityLogs({ page, search, action, entityType, dateFrom, dateTo })).data,
  });
  const totalPages = useMemo(() => Math.max(1, Math.ceil((logsQuery.data?.count || 0) / 10)), [logsQuery.data?.count]);

  function updateFilter(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPage(1);
      handler(event);
    };
  }

  function clearFilters() {
    setPage(1);
    setSearch("");
    setAction("");
    setEntityType("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">گزارش فعالیت مدیران</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">ردیابی عملیات حساس پنل</h2>
          </div>
          <button type="button" onClick={() => void logsQuery.refetch()} disabled={logsQuery.isFetching} className="h-10 rounded-md border border-[#D5DAE1] px-4 text-sm font-black text-[#364152] disabled:opacity-60">
            {logsQuery.isFetching ? "در حال به‌روزرسانی" : "به‌روزرسانی"}
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_0.8fr_0.9fr_0.9fr_auto]">
          <input value={search} onChange={updateFilter((event) => setSearch(event.target.value))} placeholder="مدیر، توضیح، شناسه یا IP" className={inputClass} />
          <select value={action} onChange={updateFilter((event) => setAction(event.target.value))} className={inputClass}><option value="">همه فعالیت‌ها</option>{actionOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select value={entityType} onChange={updateFilter((event) => setEntityType(event.target.value))} className={inputClass}><option value="">همه موجودیت‌ها</option>{entityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <input type="date" value={dateFrom} onChange={updateFilter((event) => setDateFrom(event.target.value))} aria-label="از تاریخ" className={inputClass} />
          <input type="date" value={dateTo} onChange={updateFilter((event) => setDateTo(event.target.value))} aria-label="تا تاریخ" className={inputClass} />
          <button type="button" onClick={clearFilters} className="h-11 rounded-md bg-[#EEF1F4] px-4 text-sm font-black text-[#364152]">پاک‌کردن</button>
        </div>
      </section>

      {logsQuery.isLoading ? <div className="h-96 animate-pulse rounded-lg bg-white" /> : logsQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">{getApiErrorMessage(logsQuery.error)}</section>
      ) : logsQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center text-sm font-black text-[#697586]">فعالیتی با این فیلترها ثبت نشده است.</section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]"><tr><th className="px-4 py-3">مدیر</th><th className="px-4 py-3">فعالیت</th><th className="px-4 py-3">موجودیت</th><th className="min-w-80 px-4 py-3">شرح</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">زمان</th></tr></thead>
              <tbody>{logsQuery.data?.results.map((item) => {
                const href = entityHref(item);
                return <tr key={item.id} className="border-t border-[#E3E8EF]"><td className="px-4 py-4 font-black text-[#1F2933]">{item.actor_label}</td><td className="px-4 py-4"><ActionBadge item={item} /></td><td className="px-4 py-4 font-bold text-[#364152]">{href ? <Link href={href} className="underline-offset-4 hover:underline">{item.entity_type_label} #{item.entity_id}</Link> : `${item.entity_type_label} #${item.entity_id}`}</td><td className="px-4 py-4 font-bold leading-6 text-[#364152]">{item.description}</td><td className="px-4 py-4 font-mono text-xs text-[#697586]" dir="ltr">{item.ip_address || "-"}</td><td className="px-4 py-4 font-bold text-[#697586]">{dateFormatter.format(new Date(item.created_at))}</td></tr>;
              })}</tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 lg:hidden">{logsQuery.data?.results.map((item) => {
            const href = entityHref(item);
            return <article key={item.id} className="rounded-lg border border-[#E3E8EF] p-4"><div className="flex flex-wrap items-start justify-between gap-2"><ActionBadge item={item} /><span className="text-xs font-bold text-[#697586]">{dateFormatter.format(new Date(item.created_at))}</span></div><p className="mt-3 text-sm font-black text-[#1F2933]">{item.actor_label}</p><p className="mt-2 text-sm font-bold leading-7 text-[#364152]">{item.description}</p><div className="mt-3 flex items-center justify-between gap-3 text-xs font-bold text-[#697586]"><span>{href ? <Link href={href} className="text-[#A15C38]">{item.entity_type_label} #{item.entity_id}</Link> : `${item.entity_type_label} #${item.entity_id}`}</span><span dir="ltr">{item.ip_address || "-"}</span></div></article>;
          })}</div>
          <div className="border-t border-[#E3E8EF] px-4 pb-5"><Pagination page={page} totalPages={totalPages} label="صفحه‌بندی گزارش فعالیت‌ها" onPageChange={setPage} /></div>
        </section>
      )}
    </div>
  );
}
