from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from apps.orders.models import Order
from apps.payments.models import Payment

from .models import Review
from .services import calculate_product_rating, check_verified_purchase


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def refresh_product_rating(sender, instance, **kwargs):
    calculate_product_rating(instance.product_id)


def refresh_order_reviews(order):
    reviews = Review.objects.filter(
        order_item__order=order,
        deleted_at__isnull=True,
    ).select_related("user", "product", "order_item__order")
    for review in reviews:
        is_verified = check_verified_purchase(
            user=review.user,
            product=review.product,
            order_item=review.order_item,
        )
        if review.is_verified_purchase != is_verified:
            Review.objects.filter(pk=review.pk).update(is_verified_purchase=is_verified)


@receiver(post_save, sender=Order)
def refresh_verification_after_order_change(sender, instance, **kwargs):
    refresh_order_reviews(instance)


@receiver(post_save, sender=Payment)
@receiver(post_delete, sender=Payment)
def refresh_verification_after_payment_change(sender, instance, **kwargs):
    refresh_order_reviews(instance.order)
