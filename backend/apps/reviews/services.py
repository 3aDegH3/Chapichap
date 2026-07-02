from django.db import IntegrityError, transaction
from django.db.models import Avg, Count
from django.utils import timezone
from django.utils.html import strip_tags
from rest_framework.exceptions import ValidationError

from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.products.models import Product

from .models import Review


VERIFIED_ORDER_STATUSES = [
    Order.Status.REVIEWING,
    Order.Status.WAITING_DESIGN_APPROVAL,
    Order.Status.READY_FOR_PRINT,
    Order.Status.PRINTING,
    Order.Status.READY_TO_SHIP,
    Order.Status.SHIPPED,
    Order.Status.DELIVERED,
]


def sanitize_review_text(value):
    return strip_tags(value or "").strip()


def check_verified_purchase(*, user, product, order_item):
    if not order_item:
        return False
    return bool(
        order_item.order.user_id == user.id
        and order_item.product_id == product.id
        and order_item.order.status in VERIFIED_ORDER_STATUSES
        and order_item.order.payments.filter(status=Payment.Status.SUCCESSFUL).exists()
    )


def find_available_order_item(*, user, product):
    used_order_items = Review.objects.filter(
        deleted_at__isnull=True,
        order_item__isnull=False,
    ).values("order_item_id")
    return (
        OrderItem.objects.select_related("order", "product")
        .filter(
            order__user=user,
            product=product,
            order__status__in=VERIFIED_ORDER_STATUSES,
            order__payments__status=Payment.Status.SUCCESSFUL,
        )
        .exclude(pk__in=used_order_items)
        .order_by("-order__created_at")
        .distinct()
        .first()
    )


def resolve_order_item(*, user, product, order_item_id=None):
    if not order_item_id:
        return find_available_order_item(user=user, product=product)
    try:
        order_item = OrderItem.objects.select_related("order", "product").get(pk=order_item_id)
    except OrderItem.DoesNotExist as exc:
        raise ValidationError({"order_item_id": "آیتم سفارش انتخاب‌شده معتبر نیست."}) from exc
    if order_item.order.user_id != user.id or order_item.product_id != product.id:
        raise ValidationError({"order_item_id": "این آیتم سفارش متعلق به شما و این محصول نیست."})
    return order_item


@transaction.atomic
def create_review(*, user, product, rating, body, title="", order_item_id=None):
    if not product.is_active:
        raise ValidationError({"product": "ثبت نظر برای محصول غیرفعال ممکن نیست."})
    order_item = resolve_order_item(
        user=user,
        product=product,
        order_item_id=order_item_id,
    )
    if order_item is None and Review.objects.filter(
        user=user,
        product=product,
        deleted_at__isnull=True,
    ).exists():
        raise ValidationError({"detail": "برای این محصول قبلاً نظر ثبت کرده‌اید."})
    try:
        return Review.objects.create(
            user=user,
            product=product,
            order_item=order_item,
            rating=rating,
            title=sanitize_review_text(title),
            body=sanitize_review_text(body),
            status=Review.Status.PENDING,
            is_verified_purchase=check_verified_purchase(
                user=user,
                product=product,
                order_item=order_item,
            ),
        )
    except IntegrityError as exc:
        raise ValidationError({"detail": "برای این خرید قبلاً نظر ثبت کرده‌اید."}) from exc


@transaction.atomic
def update_review(*, review, rating=None, title=None, body=None):
    if rating is not None:
        review.rating = rating
    if title is not None:
        review.title = sanitize_review_text(title)
    if body is not None:
        review.body = sanitize_review_text(body)
    review.status = Review.Status.PENDING
    review.approved_at = None
    review.admin_reply = ""
    review.admin_reply_at = None
    review.is_verified_purchase = check_verified_purchase(
        user=review.user,
        product=review.product,
        order_item=review.order_item,
    )
    review.save()
    return review


@transaction.atomic
def delete_review(*, review, actor):
    review.deleted_at = timezone.now()
    review.deleted_by = actor
    review.save(update_fields=["deleted_at", "deleted_by", "updated_at"])
    return review


@transaction.atomic
def set_review_status(*, review, status):
    if status not in Review.Status.values:
        raise ValidationError({"status": "وضعیت نظر معتبر نیست."})
    review.status = status
    review.approved_at = timezone.now() if status == Review.Status.APPROVED else None
    review.save(update_fields=["status", "approved_at", "updated_at"])
    return review


def approve_review(*, review):
    return set_review_status(review=review, status=Review.Status.APPROVED)


def reject_review(*, review):
    return set_review_status(review=review, status=Review.Status.REJECTED)


@transaction.atomic
def reply_to_review(*, review, reply):
    review.admin_reply = sanitize_review_text(reply)
    review.admin_reply_at = timezone.now() if review.admin_reply else None
    review.save(update_fields=["admin_reply", "admin_reply_at", "updated_at"])
    return review


def calculate_product_rating(product_id):
    aggregate = Review.objects.filter(
        product_id=product_id,
        status=Review.Status.APPROVED,
        deleted_at__isnull=True,
    ).aggregate(average=Avg("rating"), count=Count("id"))
    Product.objects.filter(pk=product_id).update(
        average_rating=round(aggregate["average"] or 0, 2),
        approved_reviews_count=aggregate["count"],
    )
    return aggregate
