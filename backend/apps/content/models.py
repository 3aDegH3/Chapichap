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
        REVIEWED = "reviewed", "بررسی شده"
        CONTACTED = "contacted", "تماس گرفته شد"
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_subject_display()} - {self.full_name}"
