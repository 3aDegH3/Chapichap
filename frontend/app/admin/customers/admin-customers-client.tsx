"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import { getAdminCustomers } from "@/lib/admin-api";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const moneyFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" });
const inputClass = "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "-";
}

export default function AdminCustomersClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [ordering, setOrdering] = useState("-date_joined");

  const customersQuery = useQuery({
    queryKey: ["admin-customers", page, search, isActive, ordering],
    queryFn: async () => (await getAdminCustomers({ page, search, isActive, ordering })).data,
  });
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((customersQuery.data?.count || 0) / 10)),
    [customersQuery.data?.count]
  );

  function updateFilter(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPage(1);
      handler(event);
    };
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">مدیریت مشتریان</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">پرونده و سابقه مشتریان</h2>
          </div>
          <button type="button" onClick={() => void customersQuery.refetch()} disabled={customersQuery.isFetching} className="h-10 rounded-md border border-[#D5DAE1] px-4 text-sm font-black text-[#364152] disabled:opacity-60">
            {customersQuery.isFetching ? "در حال به‌روزرسانی" : "به‌روزرسانی"}
          </button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_0.8fr_1fr_auto]">
          <input value={search} onChange={updateFilter((event) => setSearch(event.target.value))} placeholder="جستجو با نام، شماره تماس یا ایمیل" className={inputClass} />
          <select value={isActive} onChange={updateFilter((event) => setIsActive(event.target.value))} className={inputClass}>
            <option value="">همه حساب‌ها</option>
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
          <select value={ordering} onChange={updateFilter((event) => setOrdering(event.target.value))} className={inputClass}>
            <option value="-date_joined">جدیدترین ثبت‌نام</option>
            <option value="-last_order_at">جدیدترین سفارش</option>
            <option value="-order_count">بیشترین سفارش</option>
            <option value="-total_order_amount">بیشترین مبلغ سفارش</option>
          </select>
          <button type="button" onClick={() => { setPage(1); setSearch(""); setIsActive(""); setOrdering("-date_joined"); }} className="h-11 rounded-md bg-[#EEF1F4] px-4 text-sm font-black text-[#364152]">پاک‌کردن</button>
        </div>
      </section>

      {customersQuery.isLoading ? (
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      ) : customersQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">{getApiErrorMessage(customersQuery.error)}</section>
      ) : customersQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center text-sm font-black text-[#697586]">مشتری‌ای با این فیلترها پیدا نشد.</section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                <tr><th className="px-4 py-3">نام</th><th className="px-4 py-3">تماس</th><th className="px-4 py-3">ثبت‌نام</th><th className="px-4 py-3">تعداد سفارش</th><th className="px-4 py-3">مجموع سفارش‌ها</th><th className="px-4 py-3">آخرین سفارش</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th></tr>
              </thead>
              <tbody>
                {customersQuery.data?.results.map((customer) => (
                  <tr key={customer.id} className="border-t border-[#E3E8EF]">
                    <td className="px-4 py-3"><p className="font-black text-[#1F2933]">{customer.full_name}</p><p className="mt-1 text-xs font-bold text-[#697586]">{customer.email}</p></td>
                    <td className="px-4 py-3 font-bold text-[#364152]" dir="ltr">{customer.phone_number || "-"}</td>
                    <td className="px-4 py-3 font-bold text-[#697586]">{formatDate(customer.date_joined)}</td>
                    <td className="px-4 py-3 font-black text-[#364152]">{numberFormatter.format(customer.order_count)}</td>
                    <td className="px-4 py-3 font-black text-[#364152]">{moneyFormatter.format(Number(customer.total_order_amount))} تومان</td>
                    <td className="px-4 py-3 font-bold text-[#697586]">{formatDate(customer.last_order_at)}</td>
                    <td className="px-4 py-3"><span className={`rounded-md px-2.5 py-1 text-xs font-black ${customer.account_status === "active" ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{customer.account_status_label}</span></td>
                    <td className="px-4 py-3"><Link href={`/admin/customers/${customer.id}`} className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] px-3 text-xs font-black text-[#364152]">پرونده مشتری</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 lg:hidden">
            {customersQuery.data?.results.map((customer) => (
              <article key={customer.id} className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="font-black text-[#1F2933]">{customer.full_name}</p><p className="mt-1 text-xs font-bold text-[#697586]">{customer.email}</p></div><span className={`rounded-md px-2.5 py-1 text-xs font-black ${customer.account_status === "active" ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{customer.account_status_label}</span></div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs font-bold text-[#697586]">تعداد سفارش</p><p className="mt-1 font-black text-[#364152]">{numberFormatter.format(customer.order_count)}</p></div><div><p className="text-xs font-bold text-[#697586]">مجموع</p><p className="mt-1 font-black text-[#364152]">{moneyFormatter.format(Number(customer.total_order_amount))} تومان</p></div></div>
                <Link href={`/admin/customers/${customer.id}`} className="mt-4 inline-flex h-9 items-center rounded-md border border-[#D5DAE1] px-3 text-xs font-black text-[#364152]">پرونده مشتری</Link>
              </article>
            ))}
          </div>
          <div className="border-t border-[#E3E8EF] px-4 pb-5"><Pagination page={page} totalPages={totalPages} label="صفحه‌بندی مشتریان" onPageChange={setPage} /></div>
        </section>
      )}
    </div>
  );
}
