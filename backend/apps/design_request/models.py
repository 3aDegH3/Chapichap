from django.conf import settings
from django.db import models

from apps.core.file_security import validate_customer_upload_file
from apps.products.models import Product


def validate_upload_file(file):
    validate_customer_upload_file(file)


class UploadedFile(models.Model):
    file = models.FileField(upload_to="design-uploads/", validators=[validate_upload_file])
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    size = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="uploaded_design_files",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.original_name


class DesignRequest(models.Model):
    class OrderType(models.TextChoices):
        PRINT = "print", "طرح آماده برای چاپ"
        CUSTOM_PRINT = "custom_print", "طرح اختصاصی برای چاپ"
        GIFT = "gift", "هدیه اختصاصی"
        CARICATURE = "caricature", "طراحی کاریکاتور"
        CONSULTING = "consulting", "مشاوره طراحی"
        OTHER = "other", "سایر"

    class Status(models.TextChoices):
        RECEIVED = "received", "جدید"
        REVIEWING = "reviewing", "در حال بررسی"
        NEEDS_INFO = "needs_info", "نیازمند اطلاعات بیشتر"
        DESIGNING = "designing", "در حال طراحی"
        READY_FOR_APPROVAL = "ready_for_approval", "آماده تأیید"
        APPROVED = "approved", "تأییدشده"
        REJECTED = "rejected", "رد شده"
        CLOSED = "closed", "بسته‌شده"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="design_requests",
        blank=True,
        null=True,
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.SET_NULL,
        related_name="design_requests",
        blank=True,
        null=True,
    )
    order = models.ForeignKey(
        "orders.Order",
        on_delete=models.SET_NULL,
        related_name="design_requests",
        blank=True,
        null=True,
    )
    order_type = models.CharField(max_length=24, choices=OrderType.choices)
    description = models.TextField()
    contact_name = models.CharField(max_length=150)
    contact_phone = models.CharField(max_length=30)
    contact_email = models.EmailField(blank=True)
    uploaded_file = models.ForeignKey(
        UploadedFile,
        on_delete=models.SET_NULL,
        related_name="design_requests",
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.RECEIVED,
    )
    admin_response = models.TextField(blank=True)
    admin_response_at = models.DateTimeField(blank=True, null=True)
    responded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="design_request_responses",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_order_type_display()} - {self.contact_name}"


class DesignRequestStatusHistory(models.Model):
    design_request = models.ForeignKey(DesignRequest, on_delete=models.CASCADE, related_name="status_history")
    previous_status = models.CharField(max_length=40, blank=True)
    new_status = models.CharField(max_length=40)
    note = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="design_request_status_changes",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"DesignRequest {self.design_request_id}: {self.new_status}"


class DesignRequestInternalNote(models.Model):
    design_request = models.ForeignKey(DesignRequest, on_delete=models.CASCADE, related_name="internal_notes")
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="design_request_internal_notes",
        blank=True,
        null=True,
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"DesignRequest {self.design_request_id} - {self.author_id}"
