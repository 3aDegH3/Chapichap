from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True, unique=True)
    phone_verified = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to="users/avatars/", blank=True, null=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email


class VerificationChallenge(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        SMS = "sms", "SMS"

    class Purpose(models.TextChoices):
        EMAIL_VERIFY = "email_verify", "Email verification"
        PASSWORD_RESET = "password_reset", "Password reset"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="verification_challenges")
    channel = models.CharField(max_length=12, choices=Channel.choices, default=Channel.EMAIL)
    purpose = models.CharField(max_length=32, choices=Purpose.choices)
    destination = models.CharField(max_length=255)
    code_hash = models.CharField(max_length=255)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    resend_available_at = models.DateTimeField()
    verified_at = models.DateTimeField(blank=True, null=True)
    consumed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at


class CustomerAddress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses")
    title = models.CharField(max_length=120)
    receiver_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=30)
    province = models.CharField(max_length=80)
    city = models.CharField(max_length=80)
    address = models.TextField()
    postal_code = models.CharField(max_length=20)
    plaque = models.CharField(max_length=20, blank=True)
    unit = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-updated_at"]

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class CustomerOffer(models.Model):
    class OfferType(models.TextChoices):
        COUPON = "coupon", "کد تخفیف اختصاصی"
        PRODUCT = "product", "تخفیف محصول"
        CATEGORY = "category", "تخفیف دسته‌بندی"
        FIRST_ORDER = "first_order", "تخفیف اولین خرید"
        LOYALTY = "loyalty", "مشتری وفادار"
        CROSS_SELL = "cross_sell", "پیشنهاد مکمل"
        REORDER = "reorder", "سفارش مجدد"
        SEASONAL = "seasonal", "مناسبتی"
        FREE_SHIPPING = "free_shipping", "ارسال رایگان"
        BUNDLE = "bundle", "باندل"

    class DiscountType(models.TextChoices):
        PERCENT = "percent", "درصدی"
        FIXED = "fixed", "مبلغ ثابت"
        FREE_SHIPPING = "free_shipping", "ارسال رایگان"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="offers")
    title = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    offer_type = models.CharField(max_length=32, choices=OfferType.choices, default=OfferType.COUPON)
    discount_type = models.CharField(max_length=24, choices=DiscountType.choices, default=DiscountType.PERCENT)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=60, blank=True)
    starts_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(blank=True, null=True)
    usage_limit = models.PositiveIntegerField(default=1)
    usage_count = models.PositiveIntegerField(default=0)
    minimum_order_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def status(self):
        now = timezone.now()
        if not self.is_active:
            return "expired"
        if self.expires_at and self.expires_at < now:
            return "expired"
        if self.usage_count >= self.usage_limit:
            return "used"
        return "active"

    def __str__(self):
        return self.title


class SupportTicket(models.Model):
    class Category(models.TextChoices):
        ORDER = "order", "پیگیری سفارش"
        PAYMENT = "payment", "مشکل پرداخت"
        ADDRESS = "address", "تغییر آدرس"
        DESIGN_FILE = "design_file", "مشکل فایل یا طرح"
        CANCEL = "cancel", "درخواست لغو"
        RETURN = "return", "مرجوعی"
        PRODUCT = "product", "سؤال محصول"
        OTHER = "other", "سایر موارد"

    class Priority(models.TextChoices):
        LOW = "low", "کم"
        NORMAL = "normal", "معمولی"
        HIGH = "high", "زیاد"
        URGENT = "urgent", "فوری"

    class Status(models.TextChoices):
        OPEN = "open", "باز"
        AWAITING_SUPPORT = "awaiting_support", "در انتظار پشتیبانی"
        AWAITING_CUSTOMER = "awaiting_customer", "در انتظار مشتری"
        RESOLVED = "resolved", "حل‌شده"
        CLOSED = "closed", "بسته"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="support_tickets")
    order = models.ForeignKey("orders.Order", on_delete=models.SET_NULL, related_name="support_tickets", blank=True, null=True)
    subject = models.CharField(max_length=180)
    category = models.CharField(max_length=32, choices=Category.choices, default=Category.OTHER)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.NORMAL)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    closed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.subject


class SupportMessage(models.Model):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name="support_messages", blank=True, null=True)
    message = models.TextField()
    is_staff_message = models.BooleanField(default=False)
    is_read_by_customer = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]


class SupportAttachment(models.Model):
    message = models.ForeignKey(SupportMessage, on_delete=models.CASCADE, related_name="attachments")
    file = models.FileField(upload_to="support-attachments/")
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    mime_type = models.CharField(max_length=120, blank=True)


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=180)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    event_type = models.CharField(max_length=80)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
