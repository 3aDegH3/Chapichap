import { api } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/products-api";

export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden";

export type RatingSummaryData = {
  average_rating: number;
  reviews_count: number;
  rating_distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
};

export type PublicReview = {
  id: number;
  display_name: string;
  rating: number;
  title: string;
  body: string;
  is_verified_purchase: boolean;
  admin_reply: string;
  admin_reply_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewProduct = {
  id: number;
  title: string;
  slug: string;
  image_url: string | null;
};

export type AccountReview = Omit<PublicReview, "display_name"> & {
  product: ReviewProduct;
  status: ReviewStatus;
  status_label: string;
  can_edit: boolean;
};

export type AdminReview = AccountReview & {
  display_name: string;
  user_email: string;
  order_item: number | null;
  order_number: string | null;
  is_reported: boolean;
  approved_at: string | null;
  deleted_at: string | null;
};

export type ReviewPayload = {
  rating: number;
  title?: string;
  body: string;
  order_item_id?: number | null;
};

export type ReviewEligibility = {
  can_review: boolean;
  eligible_order_item: {
    id: number;
    order_number: string;
    purchased_at: string;
  } | null;
};

export const reviewSortOptions = [
  { value: "-created_at", label: "جدیدترین" },
  { value: "created_at", label: "قدیمی‌ترین" },
  { value: "-rating", label: "بیشترین امتیاز" },
  { value: "rating", label: "کمترین امتیاز" },
] as const;

export async function getProductRatingSummary(identifier: string | number) {
  const response = await api.get<{ success: boolean; data: RatingSummaryData }>(
    `/products/${identifier}/rating-summary/`
  );
  return response.data.data;
}

export async function getProductReviews(
  identifier: string | number,
  { page = 1, ordering = "-created_at", rating }: { page?: number; ordering?: string; rating?: number | null }
) {
  const response = await api.get<PaginatedResponse<PublicReview>>(
    `/products/${identifier}/reviews/`,
    { params: { page, ordering, rating: rating || undefined } }
  );
  return response.data;
}

export async function getReviewEligibility(identifier: string | number) {
  const response = await api.get<{ success: boolean; data: ReviewEligibility }>(
    `/products/${identifier}/review-eligibility/`
  );
  return response.data.data;
}

export async function createProductReview(productId: number, payload: ReviewPayload) {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: { review: AccountReview };
  }>(`/products/${productId}/reviews/`, payload);
  return response.data;
}

export async function getAccountReviews(page = 1) {
  const response = await api.get<PaginatedResponse<AccountReview>>("/account/reviews/", {
    params: { page },
  });
  return response.data;
}

export async function updateReview(reviewId: number, payload: Partial<ReviewPayload>) {
  const response = await api.patch<{
    success: boolean;
    message: string;
    data: { review: AccountReview };
  }>(`/reviews/${reviewId}/`, payload);
  return response.data;
}

export function deleteReview(reviewId: number) {
  return api.delete(`/reviews/${reviewId}/`);
}

export async function getAdminReviews({
  page = 1,
  search,
  status,
  product,
  reported,
  ordering = "-created_at",
}: {
  page?: number;
  search?: string;
  status?: string;
  product?: string;
  reported?: string;
  ordering?: string;
}) {
  const response = await api.get<PaginatedResponse<AdminReview>>("/admin/reviews/", {
    params: {
      page,
      q: search || undefined,
      status: status || undefined,
      product: product || undefined,
      reported: reported || undefined,
      ordering,
    },
  });
  return response.data;
}

export async function updateAdminReview(
  reviewId: number,
  payload: { status?: ReviewStatus; admin_reply?: string }
) {
  const response = await api.patch<{
    success: boolean;
    message: string;
    data: { review: AdminReview };
  }>(`/admin/reviews/${reviewId}/`, payload);
  return response.data;
}

export function deleteAdminReview(reviewId: number) {
  return api.delete(`/admin/reviews/${reviewId}/`);
}

export function bulkUpdateAdminReviews(
  ids: number[],
  action: "approve" | "reject" | "hide" | "delete"
) {
  return api.patch("/admin/reviews/bulk/", { ids, action });
}

