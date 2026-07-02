import AdminReply from "@/components/reviews/AdminReply";
import RatingStars from "@/components/reviews/RatingStars";
import VerifiedPurchaseBadge from "@/components/reviews/VerifiedPurchaseBadge";
import type { PublicReview } from "@/lib/reviews-api";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });

export default function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <article className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(51,50,48,0.55)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#333230] text-lg font-black text-white">
            {review.display_name.slice(0, 1)}
          </span>
          <div>
            <p className="font-black text-[#333230]">{review.display_name}</p>
            <time className="mt-1 block text-xs font-bold text-[#8B857D]">
              {dateFormatter.format(new Date(review.created_at))}
            </time>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {review.is_verified_purchase && <VerifiedPurchaseBadge />}
          <RatingStars value={review.rating} readonly size="sm" label={`امتیاز ${review.display_name}`} />
        </div>
      </div>

      {review.title && <h3 className="mt-5 text-lg font-black text-[#333230]">{review.title}</h3>}
      <p className="mt-3 whitespace-pre-line break-words text-sm font-medium leading-8 text-[#6F6A63]">
        {review.body}
      </p>
      <AdminReply reply={review.admin_reply} repliedAt={review.admin_reply_at} />
    </article>
  );
}

