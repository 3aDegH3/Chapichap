"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import RatingStars from "@/components/reviews/RatingStars";
import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import {
  AdminReview,
  ReviewStatus,
  bulkUpdateAdminReviews,
  deleteAdminReview,
  getAdminReviews,
  updateAdminReview,
} from "@/lib/reviews-api";

const inputClass = "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";
const statuses: Array<{ value: ReviewStatus; label: string }> = [
  { value: "pending", label: "در انتظار بررسی" },
  { value: "approved", label: "تأییدشده" },
  { value: "rejected", label: "ردشده" },
  { value: "hidden", label: "مخفی" },
];

function StatusBadge({ review }: { review: AdminReview }) {
  const tone = review.status === "approved"
    ? "bg-[#ECFDF3] text-[#027A48]"
    : review.status === "pending"
      ? "bg-[#FFFBEB] text-[#92400E]"
      : review.status === "rejected"
        ? "bg-[#FEF3F2] text-[#B42318]"
        : "bg-[#EEF1F4] text-[#364152]";
  return <span className={`rounded-md px-2.5 py-1 text-xs font-black ${tone}`}>{review.status_label}</span>;
}

export default function AdminReviewsClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState("");
  const [reported, setReported] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [replying, setReplying] = useState<AdminReview | null>(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["admin-reviews", page, search, status, product, reported],
    queryFn: () => getAdminReviews({ page, search, status, product, reported }),
  });
  const currentIds = reviewsQuery.data?.results.map((item) => item.id) || [];
  const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id));
  const totalPages = useMemo(() => Math.max(1, Math.ceil((reviewsQuery.data?.count || 0) / 10)), [reviewsQuery.data?.count]);

  async function refresh() {
    setSelectedIds(new Set());
    await queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
    await queryClient.invalidateQueries({ queryKey: ["product-rating-summary"] });
    await queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: ReviewStatus }) => updateAdminReview(id, { status: nextStatus }),
    onSuccess: refresh,
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const replyMutation = useMutation({
    mutationFn: () => updateAdminReview(replying!.id, { admin_reply: reply }),
    onSuccess: async () => { setReplying(null); setReply(""); await refresh(); },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminReview(id),
    onSuccess: refresh,
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const bulkMutation = useMutation({
    mutationFn: (action: "approve" | "reject" | "hide" | "delete") => bulkUpdateAdminReviews(Array.from(selectedIds), action),
    onSuccess: refresh,
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  function toggle(id: number) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allSelected) currentIds.forEach((id) => next.delete(id)); else currentIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function resetFilters() {
    setPage(1); setSearch(""); setStatus(""); setProduct(""); setReported("");
  }

  function actionButtons(review: AdminReview) {
    return (
      <div className="flex flex-wrap gap-2">
        {review.status !== "approved" && <button type="button" onClick={() => statusMutation.mutate({ id: review.id, nextStatus: "approved" })} className="h-9 rounded-md bg-[#ECFDF3] px-3 text-xs font-black text-[#027A48]">تأیید</button>}
        {review.status !== "rejected" && <button type="button" onClick={() => statusMutation.mutate({ id: review.id, nextStatus: "rejected" })} className="h-9 rounded-md bg-[#FEF3F2] px-3 text-xs font-black text-[#B42318]">رد</button>}
        {review.status !== "hidden" && <button type="button" onClick={() => statusMutation.mutate({ id: review.id, nextStatus: "hidden" })} className="h-9 rounded-md bg-[#EEF1F4] px-3 text-xs font-black text-[#364152]">مخفی</button>}
        <button type="button" onClick={() => { setReplying(review); setReply(review.admin_reply); }} className="h-9 rounded-md border border-[#D5DAE1] px-3 text-xs font-black text-[#364152]">پاسخ</button>
        <button type="button" onClick={() => window.confirm("این نظر حذف شود؟") && deleteMutation.mutate(review.id)} className="h-9 rounded-md border border-[#F3B1A6] px-3 text-xs font-black text-[#B42318]">حذف</button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div><p className="text-sm font-black text-[#A15C38]">کنترل انتشار</p><h2 className="mt-2 text-2xl font-black text-[#1F2933]">مدیریت نظرات و امتیازها</h2></div>
          <button type="button" onClick={() => void reviewsQuery.refetch()} className="h-10 rounded-md border border-[#D5DAE1] px-4 text-sm font-black text-[#364152]">به‌روزرسانی</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="جستجو در متن، محصول یا ایمیل" className={inputClass} />
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className={inputClass}><option value="">همه وضعیت‌ها</option>{statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
          <input value={product} onChange={(e) => { setPage(1); setProduct(e.target.value.replace(/\D/g, "")); }} placeholder="شناسه محصول" inputMode="numeric" className={inputClass} />
          <select value={reported} onChange={(e) => { setPage(1); setReported(e.target.value); }} className={inputClass}><option value="">همه نظرات</option><option value="true">گزارش‌شده</option><option value="false">گزارش‌نشده</option></select>
          <button type="button" onClick={resetFilters} className="h-11 rounded-md bg-[#EEF1F4] px-4 text-sm font-black text-[#364152]">پاک‌کردن</button>
        </div>
        {selectedIds.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E3E8EF] pt-4">
            <span className="ml-auto text-sm font-black text-[#364152]">{selectedIds.size.toLocaleString("fa-IR")} نظر انتخاب شده</span>
            <button onClick={() => bulkMutation.mutate("approve")} className="h-9 rounded-md bg-[#ECFDF3] px-3 text-xs font-black text-[#027A48]">تأیید گروهی</button>
            <button onClick={() => bulkMutation.mutate("reject")} className="h-9 rounded-md bg-[#FEF3F2] px-3 text-xs font-black text-[#B42318]">رد گروهی</button>
            <button onClick={() => bulkMutation.mutate("hide")} className="h-9 rounded-md bg-[#EEF1F4] px-3 text-xs font-black text-[#364152]">مخفی گروهی</button>
            <button onClick={() => window.confirm("نظرات انتخاب‌شده حذف شوند؟") && bulkMutation.mutate("delete")} className="h-9 rounded-md border border-[#F3B1A6] px-3 text-xs font-black text-[#B42318]">حذف گروهی</button>
          </div>
        )}
      </section>

      {error && <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">{error}</section>}
      {reviewsQuery.isLoading ? <div className="h-96 animate-pulse rounded-lg bg-white" /> : reviewsQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">{getApiErrorMessage(reviewsQuery.error)}</section>
      ) : !reviewsQuery.data?.results.length ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-10 text-center text-sm font-black text-[#697586]">نظری با این فیلترها پیدا نشد.</section>
      ) : (
        <section className="overflow-hidden rounded-lg border border-[#D5DAE1] bg-white">
          <div className="hidden overflow-x-auto xl:block">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]"><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th><th className="px-4 py-3">کاربر / محصول</th><th className="px-4 py-3">نظر</th><th className="px-4 py-3">امتیاز</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">عملیات</th></tr></thead>
              <tbody>{reviewsQuery.data.results.map((review) => <tr key={review.id} className="border-t border-[#E3E8EF] align-top"><td className="px-4 py-4"><input type="checkbox" checked={selectedIds.has(review.id)} onChange={() => toggle(review.id)} /></td><td className="min-w-48 px-4 py-4"><p className="font-black text-[#1F2933]">{review.display_name}</p><p className="mt-1 text-xs font-bold text-[#697586]">{review.user_email}</p><Link href={`/products/${review.product.slug}`} className="mt-2 block text-xs font-black text-[#A15C38]">{review.product.title}</Link>{review.is_verified_purchase && <span className="mt-2 inline-flex rounded-md bg-[#ECFDF3] px-2 py-1 text-xs font-black text-[#027A48]">خریدار تأییدشده</span>}</td><td className="max-w-md px-4 py-4"><p className="font-black text-[#1F2933]">{review.title || "بدون عنوان"}</p><p className="mt-2 line-clamp-3 font-bold leading-7 text-[#697586]">{review.body}</p>{review.admin_reply && <p className="mt-2 text-xs font-black text-[#A15C38]">پاسخ داده شده</p>}</td><td className="px-4 py-4"><RatingStars value={review.rating} readonly size="sm" /></td><td className="px-4 py-4"><StatusBadge review={review} />{review.is_reported && <span className="mt-2 block text-xs font-black text-[#B42318]">گزارش‌شده</span>}</td><td className="min-w-72 px-4 py-4">{actionButtons(review)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 xl:hidden">{reviewsQuery.data.results.map((review) => <article key={review.id} className="rounded-lg border border-[#E3E8EF] p-4"><div className="flex items-start justify-between gap-3"><label className="flex gap-3"><input type="checkbox" checked={selectedIds.has(review.id)} onChange={() => toggle(review.id)} className="mt-1" /><span><strong className="block text-[#1F2933]">{review.display_name}</strong><Link href={`/products/${review.product.slug}`} className="mt-1 block text-xs font-black text-[#A15C38]">{review.product.title}</Link></span></label><StatusBadge review={review} /></div><div className="mt-3"><RatingStars value={review.rating} readonly size="sm" /></div><h3 className="mt-3 font-black text-[#1F2933]">{review.title || "بدون عنوان"}</h3><p className="mt-2 text-sm font-bold leading-7 text-[#697586]">{review.body}</p><div className="mt-4">{actionButtons(review)}</div></article>)}</div>
          <div className="border-t border-[#E3E8EF] px-4 pb-5"><Pagination page={page} totalPages={totalPages} label="صفحه‌بندی نظرات مدیریت" onPageChange={setPage} /></div>
        </section>
      )}

      {replying && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#111827]/55 p-4" role="dialog" aria-modal="true">
          <form onSubmit={(event) => { event.preventDefault(); replyMutation.mutate(); }} className="w-full max-w-xl rounded-lg bg-white p-6">
            <h3 className="text-xl font-black text-[#1F2933]">پاسخ به نظر {replying.display_name}</h3>
            <p className="mt-2 text-sm font-bold text-[#697586]">{replying.product.title}</p>
            <textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} rows={6} className="mt-4 w-full rounded-md border border-[#D5DAE1] px-4 py-3 text-sm leading-7 outline-none focus:border-[#CFA15F]" placeholder="پاسخ فروشگاه..." />
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setReplying(null)} className="h-10 rounded-md border border-[#D5DAE1] px-4 text-sm font-black">انصراف</button><button type="submit" disabled={replyMutation.isPending} className="h-10 rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60">ذخیره پاسخ</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

