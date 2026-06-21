from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.products.models import Product


MAX_UPLOAD_SIZE = 10 * 1024 * 1024


def validate_upload_file(file):
    allowed_types = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
    ]

    content_type = getattr(file, "content_type", "")
    if content_type and content_type not in allowed_types:
        raise ValidationError("فرمت فایل مجاز نیست.")

    if file.size > MAX_UPLOAD_SIZE:
        raise ValidationError("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.")


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
        LOGO = "logo", "طراحی لوگو"
        PRINT = "print", "طرح آماده چاپ"
        GIFT = "gift", "هدیه اختصاصی"
        CONSULTING = "consulting", "مشاوره طراحی"
        OTHER = "other", "سایر"

    class Status(models.TextChoices):
        RECEIVED = "received", "ثبت شده"
        REVIEWING = "reviewing", "در حال بررسی"
        NEEDS_INFO = "needs_info", "نیازمند اطلاعات بیشتر"
        APPROVED = "approved", "تایید شده"
        REJECTED = "rejected", "رد شده"

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_order_type_display()} - {self.contact_name}"
