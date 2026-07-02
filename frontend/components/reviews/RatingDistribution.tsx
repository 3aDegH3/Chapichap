import type { RatingSummaryData } from "@/lib/reviews-api";

export default function RatingDistribution({
  summary,
  selectedRating,
  onRatingChange,
}: {
  summary: RatingSummaryData;
  selectedRating?: number | null;
  onRatingChange?: (rating: number | null) => void;
}) {
  return (
    <div className="grid gap-2.5">
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = summary.rating_distribution[String(rating) as keyof RatingSummaryData["rating_distribution"]] || 0;
        const percent = summary.reviews_count ? Math.round((count / summary.reviews_count) * 100) : 0;
        const active = selectedRating === rating;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => onRatingChange?.(active ? null : rating)}
            disabled={!onRatingChange}
            className={`grid grid-cols-[72px_1fr_34px] items-center gap-3 rounded-lg px-2 py-1 text-right transition ${
              active ? "bg-[#F6F1E8]" : onRatingChange ? "hover:bg-[#FAFAF8]" : ""
            }`}
          >
            <span className="text-xs font-black text-[#6F6A63]">{rating.toLocaleString("fa-IR")} ستاره</span>
            <span className="h-2 overflow-hidden rounded-full bg-[#E8E2D9]">
              <span className="block h-full rounded-full bg-[#D2AD70]" style={{ width: `${percent}%` }} />
            </span>
            <span className="text-left text-xs font-black text-[#8B857D]">{count.toLocaleString("fa-IR")}</span>
          </button>
        );
      })}
    </div>
  );
}

