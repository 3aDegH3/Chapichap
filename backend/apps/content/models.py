from django.conf import settings
from django.db import models


class ContactMessage(models.Model):
    class Subject(models.TextChoices):
        ORDER = "order", "سفارش محصول"
        CUSTOM_DESIGN = "custom_design", "طراحی اختصاصی"
        COLLABORATION = "collaboration", "همکاری"
        FOLLOW_UP = "follow_up", "پیگیری سفارش"
        GENERAL = "general", "سؤال عمومی"

    class Status(models.TextChoices):
        NEW = "new", "جدید"
        READ = "read", "خوانده‌شده"
        REPLIED = "replied", "پاسخ داده‌شده"
        CLOSED = "closed", "بسته شده"

    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    subject = models.CharField(max_length=32, choices=Subject.choices)
    message = models.TextField()
    contact_permission = models.BooleanField(default=True)
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.NEW,
    )
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True)
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    deleted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="deleted_contact_messages",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_subject_display()} - {self.full_name}"


class ContactMessageInternalNote(models.Model):
    contact_message = models.ForeignKey(
        ContactMessage,
        on_delete=models.CASCADE,
        related_name="internal_notes",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="contact_message_internal_notes",
        blank=True,
        null=True,
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"ContactMessage {self.contact_message_id} - {self.author_id}"
