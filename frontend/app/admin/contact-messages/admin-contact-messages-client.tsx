"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import {
  AdminContactMessage,
  deleteAdminContactMessage,
  getAdminContactMessages,
  markAdminContactMessagesRead,
} from "@/lib/admin-api";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusOptions = [
  { value: "new", label: "جدید" },
  { value: "read", label: "خوانده‌شده" },
  { value: "replied", label: "پاسخ داده‌شده" },
  { value: "closed", label: "بسته‌شده" },
];

const subjectOptions = [
  { value: "order", label: "سفارش محصول" },
  { value: "custom_design", label: "طراحی اختصاصی" },
  { value: "collaboration", label: "همکاری" },
  { value: "follow_up", label: "پیگیری سفارش" },
  { value: "general", label: "سؤال عمومی" },
];

const inputClass =
  "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function StatusBadge({ item }: { item: AdminContactMessage }) {
  const tone =
    item.status === "new"
      ? "bg-[#FFFBEB] text-[#92400E]"
      : item.status === "replied"
        ? "bg-[#ECFDF3] text-[#027A48]"
        : item.status === "closed"
          ? "bg-[#EEF1F4] text-[#364152]"
          : "bg-[#EFF8FF] text-[#175CD3]";
  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ${tone}`}>{item.status_label}</span>;
}

export default function AdminContactMessagesClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const messagesQuery = useQuery({
    queryKey: ["admin-contact-messages", page, search, status, subject],
    queryFn: async () => {
      const response = await getAdminContactMessages({ page, search, status, subject });
      return response.data;
    },
  });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((messagesQuery.data?.count || 0) / 10)),
    [messagesQuery.data?.count]
  );
  const currentIds = messagesQuery.data?.results.map((item) => item.id) || [];
  const allCurrentSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id));

  const bulkReadMutation = useMutation({
    mutationFn: () => markAdminContactMessagesRead(Array.from(selectedIds)),
    onSuccess: async () => {
      setSelectedIds(new Set());
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const deleteMutation = useMutation({
    mutationFn: (messageId: number) => deleteAdminContactMessage(messageId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  function updateFilter(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPage(1);
      setSelectedIds(new Set());
      handler(event);
    };
  }

  function toggleItem(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCurrentPage() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allCurrentSelected) currentIds.forEach((id) => next.delete(id));
      else currentIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function handleDelete(item: AdminContactMessage) {
    if (window.confirm(`پیام «${item.subject_label}» از ${item.full_name} حذف نرم شود؟`)) {
      deleteMutation.mutate(item.id);
    }
  }

  function clearFilters() {
    setPage(1);
    setSearch("");
    setStatus("");
    setSubject("");
    setSelectedIds(new Set());
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">مدیریت پیام‌های تماس</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">صندوق پیام‌های مشتریان</h2>
          </div>
          <button
            type="button"
            onClick={() => void messagesQuery.refetch()}
            disabled={messagesQuery.isFetching}
            className="inline-flex h-10 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] disabled:opacity-60"
          >
            {messagesQuery.isFetching ? "در حال به‌روزرسانی" : "به‌روزرسانی"}
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_auto]">
          <input
            value={search}
            onChange={updateFilter((event) => setSearch(event.target.value))}
            placeholder="جستجو با شماره تماس، نام یا متن پیام"
            className={inputClass}
          />
          <select value={status} onChange={updateFilter((event) => setStatus(event.target.value))} className={inputClass}>
            <option value="">همه وضعیت‌ها</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={subject} onChange={updateFilter((event) => setSubject(event.target.value))} className={inputClass}>
            <option value="">همه موضوع‌ها</option>
            {subjectOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={clearFilters} className="h-11 rounded-md bg-[#EEF1F4] px-4 text-sm font-black text-[#364152]">
            پاک‌کردن
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E3E8EF] pt-4">
            <p className="text-sm font-black text-[#364152]">{new Intl.NumberFormat("fa-IR").format(selectedIds.size)} پیام انتخاب شده</p>
            <button
              type="button"
              onClick={() => bulkReadMutation.mutate()}
              disabled={bulkReadMutation.isPending}
              className="h-10 rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60"
            >
              علامت‌گذاری به‌عنوان خوانده‌شده
            </button>
          </div>
        )}
      </section>

      {error && <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">{error}</section>}

      {messagesQuery.isLoading ? (
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      ) : messagesQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">
          {getApiErrorMessage(messagesQuery.error)}
        </section>
      ) : messagesQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center text-sm font-black text-[#697586]">
          پیامی با این فیلترها پیدا نشد.
        </section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                <tr>
                  <th className="w-12 px-4 py-3"><input type="checkbox" checked={allCurrentSelected} onChange={toggleCurrentPage} aria-label="انتخاب همه پیام‌های صفحه" /></th>
                  <th className="px-4 py-3">نام</th>
                  <th className="px-4 py-3">شماره تماس</th>
                  <th className="px-4 py-3">موضوع</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3">تاریخ</th>
                  <th className="px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {messagesQuery.data?.results.map((item) => (
                  <tr key={item.id} className="border-t border-[#E3E8EF]">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} aria-label={`انتخاب پیام ${item.full_name}`} /></td>
                    <td className="px-4 py-3 font-black text-[#1F2933]">{item.full_name}</td>
                    <td className="px-4 py-3 font-bold text-[#364152]" dir="ltr">{item.phone}</td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{item.subject_label}</td>
                    <td className="px-4 py-3"><StatusBadge item={item} /></td>
                    <td className="px-4 py-3 font-bold text-[#697586]">{dateFormatter.format(new Date(item.created_at))}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/contact-messages/${item.id}`} className="h-9 rounded-md border border-[#D5DAE1] px-3 py-2 text-xs font-black text-[#364152]">جزئیات</Link>
                        <button type="button" onClick={() => handleDelete(item)} className="h-9 rounded-md border border-[#F3B1A6] px-3 text-xs font-black text-[#B42318]">حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {messagesQuery.data?.results.map((item) => (
              <article key={item.id} className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3">
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleItem(item.id)} className="mt-1" />
                    <span><strong className="block text-sm text-[#1F2933]">{item.full_name}</strong><span className="mt-1 block text-xs font-bold text-[#697586]">{item.phone}</span></span>
                  </label>
                  <StatusBadge item={item} />
                </div>
                <p className="mt-4 text-sm font-black text-[#364152]">{item.subject_label}</p>
                <p className="mt-2 text-xs font-bold text-[#697586]">{dateFormatter.format(new Date(item.created_at))}</p>
                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/contact-messages/${item.id}`} className="h-9 rounded-md border border-[#D5DAE1] px-3 py-2 text-xs font-black text-[#364152]">جزئیات</Link>
                  <button type="button" onClick={() => handleDelete(item)} className="h-9 rounded-md border border-[#F3B1A6] px-3 text-xs font-black text-[#B42318]">حذف</button>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[#E3E8EF] px-4 pb-5">
            <Pagination page={page} totalPages={totalPages} label="صفحه‌بندی پیام‌های تماس" onPageChange={(nextPage) => { setPage(nextPage); setSelectedIds(new Set()); }} />
          </div>
        </section>
      )}
    </div>
  );
}
