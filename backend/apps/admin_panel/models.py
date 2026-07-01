from django.conf import settings
from django.db import models


class AdminActivityLog(models.Model):
    class Action(models.TextChoices):
        ORDER_STATUS_CHANGED = "order_status_changed", "تغییر وضعیت سفارش"
        PRODUCT_PRICE_CHANGED = "product_price_changed", "تغییر قیمت محصول"
        PRODUCT_INVENTORY_CHANGED = "product_inventory_changed", "تغییر موجودی محصول"
        PRODUCT_DELETED = "product_deleted", "حذف محصول"
        SENSITIVE_FILE_VIEWED = "sensitive_file_viewed", "مشاهده فایل حساس"
        SENSITIVE_FILE_DOWNLOADED = "sensitive_file_downloaded", "دانلود فایل حساس"
        DESIGN_REQUEST_REPLIED = "design_request_replied", "پاسخ به درخواست طراحی"
        ADMIN_ACCESS_CHANGED = "admin_access_changed", "تغییر دسترسی مدیر"

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="admin_activity_logs",
        blank=True,
        null=True,
    )
    action = models.CharField(max_length=64, choices=Action.choices, db_index=True)
    entity_type = models.CharField(max_length=64, db_index=True)
    entity_id = models.CharField(max_length=64, db_index=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["entity_type", "entity_id"]),
            models.Index(fields=["actor", "created_at"]),
        ]

    def __str__(self):
        return f"{self.get_action_display()} - {self.entity_type}:{self.entity_id}"
