from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.admin_panel.permissions import CanManageReviews
from apps.products.models import Product

from .models import Review
from .permissions import IsReviewOwner
from .selectors import approved_product_reviews, product_rating_summary
from .serializers import (
    AccountReviewSerializer,
    AdminReviewActionSerializer,
    AdminReviewBulkSerializer,
    AdminReviewSerializer,
    PublicReviewSerializer,
    ReviewInputSerializer,
    ReviewUpdateSerializer,
)
from .services import (
    create_review,
    delete_review,
    find_available_order_item,
    reply_to_review,
    set_review_status,
    update_review,
)


class ReviewPagination(PageNumberPagination):
    page_size = 10
    max_page_size = 50


def get_product(identifier):
    lookup = {"pk": int(identifier)} if str(identifier).isdigit() else {"slug": identifier}
    return get_object_or_404(Product, is_active=True, **lookup)


class ProductRatingSummaryAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, identifier):
        product = get_product(identifier)
        return Response({"success": True, "data": product_rating_summary(product)})


class ProductReviewListCreateAPIView(ListCreateAPIView):
    pagination_class = ReviewPagination
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "rating"]
    ordering = ["-created_at"]

    def get_permissions(self):
        return [IsAuthenticated()] if self.request.method == "POST" else [AllowAny()]

    def get_throttles(self):
        if self.request.method == "POST":
            self.throttle_scope = "review_create"
            return [ScopedRateThrottle()]
        return []

    def get_serializer_class(self):
        return ReviewInputSerializer if self.request.method == "POST" else PublicReviewSerializer

    def get_queryset(self):
        product = get_product(self.kwargs["identifier"])
        queryset = approved_product_reviews(product)
        rating = self.request.query_params.get("rating")
        if rating and rating.isdigit() and 1 <= int(rating) <= 5:
            queryset = queryset.filter(rating=int(rating))
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = ReviewInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = get_product(kwargs["identifier"])
        review = create_review(
            user=request.user,
            product=product,
            **serializer.validated_data,
        )
        data = AccountReviewSerializer(review, context={"request": request}).data
        return Response(
            {
                "success": True,
                "message": "نظر شما ثبت شد و پس از بررسی منتشر می‌شود.",
                "data": {"review": data},
            },
            status=status.HTTP_201_CREATED,
        )


class ProductReviewEligibilityAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, identifier):
        product = get_product(identifier)
        order_item = find_available_order_item(user=request.user, product=product)
        return Response(
            {
                "success": True,
                "data": {
                    "can_review": not Review.objects.filter(
                        user=request.user,
                        product=product,
                        deleted_at__isnull=True,
                    ).exists() or bool(order_item),
                    "eligible_order_item": (
                        {
                            "id": order_item.id,
                            "order_number": order_item.order.order_number,
                            "purchased_at": order_item.order.created_at,
                        }
                        if order_item
                        else None
                    ),
                },
            }
        )


class ReviewDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, IsReviewOwner]

    def get_object(self):
        review = get_object_or_404(
            Review.objects.select_related("user", "product", "order_item__order"),
            pk=self.kwargs["pk"],
            deleted_at__isnull=True,
        )
        self.check_object_permissions(self.request, review)
        return review

    def patch(self, request, pk):
        review = self.get_object()
        serializer = ReviewUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        review = update_review(review=review, **serializer.validated_data)
        return Response(
            {
                "success": True,
                "message": "نظر ویرایش شد و دوباره در انتظار بررسی قرار گرفت.",
                "data": {"review": AccountReviewSerializer(review, context={"request": request}).data},
            }
        )

    def delete(self, request, pk):
        review = self.get_object()
        delete_review(review=review, actor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AccountReviewListAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountReviewSerializer
    pagination_class = ReviewPagination

    def get_queryset(self):
        return Review.objects.filter(
            user=self.request.user,
            deleted_at__isnull=True,
        ).select_related("user", "product", "order_item")


class AdminReviewListAPIView(ListAPIView):
    permission_classes = [CanManageReviews]
    serializer_class = AdminReviewSerializer
    pagination_class = ReviewPagination
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "rating", "updated_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Review.objects.filter(deleted_at__isnull=True).select_related(
            "user", "product", "order_item__order"
        )
        status_value = self.request.query_params.get("status")
        product_id = self.request.query_params.get("product")
        reported = self.request.query_params.get("reported")
        search = (self.request.query_params.get("q") or "").strip()
        if status_value in Review.Status.values:
            queryset = queryset.filter(status=status_value)
        if product_id and product_id.isdigit():
            queryset = queryset.filter(product_id=int(product_id))
        if reported in {"true", "false"}:
            queryset = queryset.filter(is_reported=reported == "true")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(body__icontains=search)
                | Q(product__title__icontains=search)
                | Q(user__email__icontains=search)
            )
        return queryset


class AdminReviewDetailAPIView(APIView):
    permission_classes = [CanManageReviews]

    def get_object(self, pk):
        return get_object_or_404(
            Review.objects.select_related("user", "product", "order_item__order"),
            pk=pk,
            deleted_at__isnull=True,
        )

    def patch(self, request, pk):
        review = self.get_object(pk)
        serializer = AdminReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if "status" in serializer.validated_data:
            review = set_review_status(review=review, status=serializer.validated_data["status"])
        if "admin_reply" in serializer.validated_data:
            review = reply_to_review(review=review, reply=serializer.validated_data["admin_reply"])
        return Response(
            {
                "success": True,
                "message": "نظر به‌روزرسانی شد.",
                "data": {"review": AdminReviewSerializer(review, context={"request": request}).data},
            }
        )

    def delete(self, request, pk):
        delete_review(review=self.get_object(pk), actor=request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminReviewBulkAPIView(APIView):
    permission_classes = [CanManageReviews]

    def patch(self, request):
        serializer = AdminReviewBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reviews = list(Review.objects.filter(pk__in=serializer.validated_data["ids"], deleted_at__isnull=True))
        action = serializer.validated_data["action"]
        status_map = {
            "approve": Review.Status.APPROVED,
            "reject": Review.Status.REJECTED,
            "hide": Review.Status.HIDDEN,
        }
        for review in reviews:
            if action == "delete":
                delete_review(review=review, actor=request.user)
            else:
                set_review_status(review=review, status=status_map[action])
        return Response(
            {
                "success": True,
                "message": "عملیات گروهی انجام شد.",
                "data": {"updated_count": len(reviews)},
            }
        )
