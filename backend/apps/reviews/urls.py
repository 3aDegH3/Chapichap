from django.urls import path

from .views import (
    AccountReviewListAPIView,
    AdminReviewBulkAPIView,
    AdminReviewDetailAPIView,
    AdminReviewListAPIView,
    ProductRatingSummaryAPIView,
    ProductReviewEligibilityAPIView,
    ProductReviewListCreateAPIView,
    ReviewDetailAPIView,
)


app_name = "reviews"

urlpatterns = [
    path("products/<str:identifier>/rating-summary/", ProductRatingSummaryAPIView.as_view(), name="rating-summary"),
    path("products/<str:identifier>/reviews/", ProductReviewListCreateAPIView.as_view(), name="product-reviews"),
    path("products/<str:identifier>/review-eligibility/", ProductReviewEligibilityAPIView.as_view(), name="review-eligibility"),
    path("reviews/<int:pk>/", ReviewDetailAPIView.as_view(), name="review-detail"),
    path("account/reviews/", AccountReviewListAPIView.as_view(), name="account-reviews"),
    path("admin/reviews/", AdminReviewListAPIView.as_view(), name="admin-reviews"),
    path("admin/reviews/bulk/", AdminReviewBulkAPIView.as_view(), name="admin-reviews-bulk"),
    path("admin/reviews/<int:pk>/", AdminReviewDetailAPIView.as_view(), name="admin-review-detail"),
]

