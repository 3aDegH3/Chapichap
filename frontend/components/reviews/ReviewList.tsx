import Pagination from "@/components/ui/Pagination";
import ReviewCard from "@/components/reviews/ReviewCard";
import ReviewSkeleton from "@/components/reviews/ReviewSkeleton";
import type { PaginatedResponse } from "@/lib/products-api";
import type { PublicReview } from "@/lib/reviews-api";

export default function ReviewList({
  data,
  isLoading,
  error,
  page,
  onPageChange,
}: {
  data?: PaginatedResponse<PublicReview>;
  isLoading: boolean;
  error?: string;
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (isLoading) return <ReviewSkeleton />;
  if (error) {
    return <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-bold text-red-700">{error}</div>;
  }
  if (!data?.results.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D2AD70]/55 bg-[#F6F1E8] px-6 py-14 text-center">
        <h3 className="text-lg font-black text-[#333230]">هنوز نظری ثبت نشده است</h3>
        <p className="mt-2 text-sm font-medium text-[#77736D]">اولین نفری باش که تجربه‌اش را درباره این محصول می‌نویسد.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-4">{data.results.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
      <Pagination page={page} totalPages={Math.max(1, Math.ceil(data.count / 10))} label="صفحه‌بندی نظرات" onPageChange={onPageChange} />
    </div>
  );
}

