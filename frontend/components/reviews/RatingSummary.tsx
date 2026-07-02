import RatingDistribution from "@/components/reviews/RatingDistribution";
import RatingStars from "@/components/reviews/RatingStars";
import type { RatingSummaryData } from "@/lib/reviews-api";

export default function RatingSummary({
  summary,
  selectedRating,
  onRatingChange,
}: {
  summary: RatingSummaryData;
  selectedRating?: number | null;
  onRatingChange?: (rating: number | null) => void;
}) {
  return (
    <div className="grid gap-7 rounded-2xl border border-[#E3DED5] bg-white p-6 md:grid-cols-[180px_1fr] md:items-center">
      <div className="text-center md:border-l md:border-[#E3DED5] md:pl-6">
        {summary.reviews_count > 0 ? (
          <>
            <p className="text-4xl font-black text-[#333230]">
              {summary.average_rating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
              <span className="mr-1 text-base font-bold text-[#8B857D]">از ۵</span>
            </p>
            <div className="mt-3"><RatingStars value={summary.average_rating} readonly /></div>
            <p className="mt-2 text-sm font-bold text-[#77736D]">
              براساس {summary.reviews_count.toLocaleString("fa-IR")} نظر
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-[#333230]">بدون امتیاز</p>
            <div className="mt-3"><RatingStars value={0} readonly /></div>
            <p className="mt-2 text-sm font-bold text-[#77736D]">هنوز نظری ثبت نشده است</p>
          </>
        )}
      </div>
      <RatingDistribution summary={summary} selectedRating={selectedRating} onRatingChange={onRatingChange} />
    </div>
  );
}

