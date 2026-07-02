from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Review(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار بررسی"
        APPROVED = "approved", "تأییدشده"
        REJECTED = "rejected", "ردشده"
        HIDDEN = "hidden", "مخفی"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    product = models.ForeignKey(
        "products.Product",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    order_item = models.ForeignKey(
        "orders.OrderItem",
        on_delete=models.SET_NULL,
        related_name="reviews",
        blank=True,
        null=True,
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    title = models.CharField(max_length=150, blank=True)
    body = models.TextField(max_length=2000)
    status = models.CharField(
        max_length=16,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    is_verified_purchase = models.BooleanField(default=False, db_index=True)
    is_reported = models.BooleanField(default=False, db_index=True)
    admin_reply = models.TextField(max_length=2000, blank=True)
    admin_reply_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True, db_index=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="deleted_reviews",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rating__gte=1, rating__lte=5),
                name="reviews_rating_between_1_and_5",
            ),
            models.UniqueConstraint(
                fields=["user", "order_item"],
                condition=models.Q(order_item__isnull=False, deleted_at__isnull=True),
                name="reviews_one_active_per_order_item",
            ),
            models.UniqueConstraint(
                fields=["user", "product"],
                condition=models.Q(order_item__isnull=True, deleted_at__isnull=True),
                name="reviews_one_active_general_per_product",
            ),
        ]
        indexes = [
            models.Index(fields=["product", "status", "deleted_at"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def __str__(self):
        return f"{self.product.title} - {self.rating}/5"

    @property
    def display_name(self):
        return self.user.first_name or self.user.username or "کاربر چاپی‌چاپ"

