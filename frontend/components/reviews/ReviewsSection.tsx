"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import RatingSummary from "@/components/reviews/RatingSummary";
import ReviewForm from "@/components/reviews/ReviewForm";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewSort from "@/components/reviews/ReviewSort";
import { getApiErrorMessage } from "@/lib/api";
import { getProductRatingSummary, getProductReviews } from "@/lib/reviews-api";

export default function ReviewsSection({ productId, productSlug, productTitle }: { productId: number; productSlug: string; productTitle: string }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [ordering, setOrdering] = useState("-created_at");
  const [rating, setRating] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["product-rating-summary", productSlug],
    queryFn: () => getProductRatingSummary(productSlug),
  });
  const reviewsQuery = useQuery({
    queryKey: ["product-reviews", productSlug, page, ordering, rating],
    queryFn: () => getProductReviews(productSlug, { page, ordering, rating }),
  });

  async function handleCreated(message: string) {
    setSuccessMessage(message);
    await queryClient.invalidateQueries({ queryKey: ["review-eligibility", productSlug] });
    await queryClient.invalidateQueries({ queryKey: ["account-reviews"] });
  }

  function changeRating(value: number | null) {
    setPage(1);
    setRating(value);
  }
  const reviewStructuredData = reviewsQuery.data?.results.length
    ? {
        "@context": "https://schema.org",
        "@graph": reviewsQuery.data.results.map((review) => ({
          "@type": "Review",
          itemReviewed: { "@type": "Product", name: productTitle },
          author: { "@type": "Person", name: review.display_name },
          datePublished: review.created_at,
          name: review.title || undefined,
          reviewBody: review.body,
          reviewRating: {
            "@type": "Rating",
            ratingValue: review.rating,
            bestRating: 5,
            worstRating: 1,
          },
        })),
      }
    : null;

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-[#E3DED5] bg-[#FAFAF8] py-14 sm:py-20">
      {reviewStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewStructuredData).replace(/</g, "\\u003c") }}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-black text-[#B2894C]">تجربه خریداران</p>
          <h2 className="mt-2 text-3xl font-black text-[#333230]">نظرات و امتیاز کاربران</h2>
          <p className="mt-3 text-sm font-medium leading-8 text-[#77736D]">نظرهای منتشرشده پیش از نمایش بررسی می‌شوند و نشان خرید تأییدشده فقط از روی سفارش واقعی صادر می‌شود.</p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          {summaryQuery.isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-white" />
          ) : summaryQuery.isError || !summaryQuery.data ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">{getApiErrorMessage(summaryQuery.error)}</div>
          ) : (
            <RatingSummary summary={summaryQuery.data} selectedRating={rating} onRatingChange={changeRating} />
          )}
          <ReviewForm productId={productId} productSlug={productSlug} onSuccess={handleCreated} />
        </div>

        {successMessage && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">{successMessage}</div>
        )}

        <div className="mt-10 flex flex-col gap-4 border-b border-[#E3DED5] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-[#333230]">نظرهای منتشرشده</h3>
            {rating && <button type="button" onClick={() => changeRating(null)} className="mt-2 text-xs font-black text-[#B2894C]">حذف فیلتر {rating.toLocaleString("fa-IR")} ستاره ×</button>}
          </div>
          <ReviewSort value={ordering} onChange={(value) => { setPage(1); setOrdering(value); }} />
        </div>

        <div className="mt-6">
          <ReviewList
            data={reviewsQuery.data}
            isLoading={reviewsQuery.isLoading}
            error={reviewsQuery.isError ? getApiErrorMessage(reviewsQuery.error) : undefined}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </section>
  );
}
