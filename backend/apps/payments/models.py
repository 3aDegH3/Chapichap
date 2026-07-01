from django.conf import settings
from django.db import models

from apps.orders.models import Order


class Payment(models.Model):
    class Method(models.TextChoices):
        IN_PERSON = "IN_PERSON", "پرداخت حضوری"
        ONLINE_GATEWAY = "ONLINE_GATEWAY", "پرداخت آنلاین"
        BANK_TRANSFER = "BANK_TRANSFER", "انتقال بانکی"
        CASH_ON_DELIVERY = "CASH_ON_DELIVERY", "پرداخت هنگام تحویل"

    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار پرداخت"
        SUCCESSFUL = "successful", "موفق"
        FAILED = "failed", "ناموفق"
        CANCELED = "canceled", "لغوشده"
        EXPIRED = "expired", "منقضی‌شده"

    class Provider(models.TextChoices):
        MANUAL = "MANUAL", "ثبت دستی"
        MOCK = "MOCK", "درگاه آزمایشی"
        GATEWAY = "GATEWAY", "درگاه آنلاین"
        BANK = "BANK", "بانک"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="payments")
    order_number = models.CharField(max_length=32, db_index=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=24, choices=Method.choices)
    provider = models.CharField(max_length=24, choices=Provider.choices, default=Provider.MANUAL)
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.PENDING,
    )
    provider_reference = models.CharField(max_length=120, blank=True, null=True)
    tracking_code = models.CharField(max_length=120, blank=True)
    receipt_number = models.CharField(max_length=120, blank=True)
    failure_reason = models.TextField(blank=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_number} - {self.get_method_display()}"


class PaymentStatusLog(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="status_logs")
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="payment_status_logs",
        blank=True,
        null=True,
    )
    from_status = models.CharField(max_length=24, blank=True)
    to_status = models.CharField(max_length=24)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.payment_id}: {self.from_status} -> {self.to_status}"


class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "در انتظار پرداخت"
        SUCCESSFUL = "successful", "موفق"
        FAILED = "failed", "ناموفق"
        CANCELED = "canceled", "لغوشده"
        EXPIRED = "expired", "منقضی‌شده"

    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name="transactions")
    order_number = models.CharField(max_length=32, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    gateway = models.CharField(max_length=64, default="mock")
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING)
    idempotency_key = models.CharField(max_length=120, unique=True, blank=True, null=True)
    gateway_reference = models.CharField(max_length=120, unique=True, blank=True, null=True)
    tracking_code = models.CharField(max_length=120, blank=True)
    receipt_number = models.CharField(max_length=120, blank=True)
    failure_reason = models.TextField(blank=True)
    request_payload = models.JSONField(default=dict, blank=True)
    response_payload = models.JSONField(default=dict, blank=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order_number} - {self.gateway} - {self.status}"
