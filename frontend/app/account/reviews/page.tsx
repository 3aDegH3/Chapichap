"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import RatingStars from "@/components/reviews/RatingStars";
import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api"
import {
  AccountReview,
  deleteReview,
  getAccountReviews,
  updateReview,
} from "@/lib/reviews-api";

const statusTone = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  hidden: "border-[#D8CFC0] bg-[#F2EEE6] text-[#6F6A63]",
};

export default function AccountReviewsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AccountReview | null>(null);
  const [draft, setDraft] = useState({ rating: 0, title: "", body: "" });
  const [error, setError] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["account-reviews", page],
    queryFn: () => getAccountReviews(page),
  });
  const updateMutation = useMutation({
    mutationFn: () => updateReview(editing!.id, draft),
    onSuccess: async () => {
      setEditing(null);
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["account-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["product-rating-summary"] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const deleteMutation = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: async () => {
      setError("");
      await queryClient.invalidateQueries({ queryKey: ["account-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["product-reviews"] });
      await queryClient.invalidateQueries({ queryKey: ["product-rating-summary"] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  function startEdit(review: AccountReview) {
    setEditing(review);
    setDraft({ rating: review.rating, title: review.title, body: review.body });
    setError("");
  }

  function handleDelete(review: AccountReview) {
    if (window.confirm(`نظر شما برای «${review.product.title}» حذف شود؟`)) {
      deleteMutation.mutate(review.id);
    }
  }

  if (reviewsQuery.isLoading) return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  if (reviewsQuery.isError) return <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-bold text-red-700">{getApiErrorMessage(reviewsQuery.error)}</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#E3DED5] bg-white p-5">
        <p className="text-sm font-black text-[#B2894C]">بازخوردهای شما</p>
        <h2 className="mt-2 text-2xl font-black text-[#333230]">نظرات من</h2>
        <p className="mt-2 text-sm font-medium leading-7 text-[#77736D]">ویرایش هر نظر باعث می‌شود دوباره برای بررسی مدیر ارسال شود.</p>
      </section>

      {error && <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      {!reviewsQuery.data?.results.length ? (
        <section className="rounded-2xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] px-6 py-14 text-center">
          <h3 className="text-xl font-black text-[#333230]">هنوز نظری ثبت نکرده‌اید</h3>
          <Link href="/products" className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230]">مشاهده محصولات</Link>
        </section>
      ) : (
        <div className="grid gap-4">
          {reviewsQuery.data.results.map((review) => (
            <article key={review.id} className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link href={`/products/${review.product.slug}`} className="text-lg font-black text-[#333230] hover:text-[#B2894C]">{review.product.title}</Link>
                  <p className="mt-1 text-xs font-bold text-[#8B857D]">{new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(review.created_at))}</p>
                </div>
                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-black ${statusTone[review.status]}`}>{review.status_label}</span>
              </div>
              <div className="mt-4"><RatingStars value={review.rating} readonly size="sm" /></div>
              {review.title && <h3 className="mt-3 font-black text-[#333230]">{review.title}</h3>}
              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-8 text-[#6F6A63]">{review.body}</p>
              {review.admin_reply && <div className="mt-4 rounded-xl bg-[#F6F1E8] p-4 text-sm font-medium leading-7 text-[#6F6A63]"><strong className="block text-[#333230]">پاسخ فروشگاه</strong>{review.admin_reply}</div>}
              <div className="mt-5 flex gap-2 border-t border-[#E3DED5] pt-4">
                <button type="button" onClick={() => startEdit(review)} className="h-10 rounded-xl border border-[#D2AD70] px-4 text-sm font-black text-[#333230]">ویرایش</button>
                <button type="button" onClick={() => handleDelete(review)} disabled={deleteMutation.isPending} className="h-10 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 disabled:opacity-60">حذف</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={Math.max(1, Math.ceil((reviewsQuery.data?.count || 0) / 10))} label="صفحه‌بندی نظرات من" onPageChange={setPage} />

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#111827]/55 p-4" role="dialog" aria-modal="true" aria-label="ویرایش نظر">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (draft.rating < 1 || draft.body.trim().length < 10) {
                setError("امتیاز و متن حداقل ۱۰ کاراکتری لازم است.");
                return;
              }
              updateMutation.mutate();
            }}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6"
          >
            <h3 className="text-xl font-black text-[#333230]">ویرایش نظر</h3>
            <div className="mt-4"><RatingStars value={draft.rating} onChange={(rating) => setDraft((current) => ({ ...current, rating }))} size="lg" /></div>
            <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} maxLength={150} placeholder="عنوان نظر" className="mt-4 h-12 w-full rounded-xl border border-[#E3DED5] px-4 text-sm outline-none focus:border-[#D2AD70]" />
            <textarea value={draft.body} onChange={(event) => setDraft((current) => ({ ...current, body: event.target.value }))} minLength={10} maxLength={2000} rows={6} className="mt-4 w-full rounded-xl border border-[#E3DED5] px-4 py-3 text-sm leading-8 outline-none focus:border-[#D2AD70]" />
            {error && <p className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="h-11 rounded-xl border border-[#E3DED5] px-5 text-sm font-black">انصراف</button>
              <button type="submit" disabled={updateMutation.isPending} className="h-11 rounded-xl bg-[#D2AD70] px-5 text-sm font-black text-[#333230] disabled:opacity-60">{updateMutation.isPending ? "در حال ذخیره..." : "ذخیره تغییرات"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
