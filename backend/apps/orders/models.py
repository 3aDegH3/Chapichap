from django.conf import settings
from django.db import models

from apps.products.models import Product


class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
        blank=True,
        null=True,
    )
    session_key = models.CharField(max_length=40, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.user.email if self.user_id else f"Cart {self.session_key}"

    @property
    def total_price(self):
        return sum(item.line_total for item in self.items.select_related("product"))

    @property
    def total_quantity(self):
        return sum(item.quantity for item in self.items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("cart", "product")
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.product.title} x {self.quantity}"

    @property
    def line_total(self):
        return self.product.effective_price * self.quantity


class Order(models.Model):
    class Status(models.TextChoices):
        REGISTERED = "REGISTERED", "ثبت‌شده"
        REVIEWING = "REVIEWING", "در حال بررسی"
        WAITING_DESIGN_APPROVAL = "WAITING_DESIGN_APPROVAL", "در انتظار تأیید طرح"
        READY_FOR_PRINT = "READY_FOR_PRINT", "آماده چاپ"
        PRINTING = "PRINTING", "در حال چاپ"
        READY_TO_SHIP = "READY_TO_SHIP", "آماده ارسال"
        SHIPPED = "SHIPPED", "ارسال‌شده"
        DELIVERED = "DELIVERED", "تحویل‌شده"
        CANCELLED = "CANCELLED", "لغوشده"

    class DeliveryMethod(models.TextChoices):
        SHIPPING = "SHIPPING", "ارسال به آدرس"
        PICKUP = "PICKUP", "تحویل حضوری"

    order_number = models.CharField(max_length=32, unique=True)
    idempotency_key = models.CharField(max_length=120, unique=True, blank=True, null=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="orders",
        blank=True,
        null=True,
    )
    session_key = models.CharField(max_length=40, db_index=True, blank=True, null=True)
    receiver_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    province = models.CharField(max_length=80)
    city = models.CharField(max_length=80)
    address = models.TextField()
    postal_code = models.CharField(max_length=20)
    delivery_method = models.CharField(
        max_length=16,
        choices=DeliveryMethod.choices,
        default=DeliveryMethod.SHIPPING,
    )
    shipping_provider = models.CharField(max_length=120, blank=True)
    shipping_tracking_code = models.CharField(max_length=120, blank=True)
    shipping_cost = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=60, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.REGISTERED,
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        related_name="order_items",
        blank=True,
        null=True,
    )
    product_title = models.CharField(max_length=255)
    product_image = models.CharField(max_length=500, blank=True)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField()
    line_total = models.DecimalField(max_digits=12, decimal_places=2)
    selected_options = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.product_title} x {self.quantity}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    previous_status = models.CharField(max_length=40, blank=True)
    new_status = models.CharField(max_length=40)
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    visible_to_customer = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="order_status_changes",
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.order.order_number}: {self.new_status}"


class OrderInternalNote(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="internal_notes")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="order_internal_notes",
        blank=True,
        null=True,
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.author_id}"
