from django.db import models
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.utils import timezone


class Category(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        related_name="children",
        blank=True,
        null=True,
    )
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Product(models.Model):
    class ProductType(models.TextChoices):
        MUG = "mug", "ماگ"
        APPAREL = "apparel", "پوشاک"
        FRAME = "frame", "تابلو و قاب"
        STATIONERY = "stationery", "نوشت‌افزار"
        GIFT_SET = "gift_set", "ست هدیه"
        PROMOTIONAL = "promotional", "تبلیغاتی"
        OTHER = "other", "سایر"

    class GiftUsage(models.TextChoices):
        PERSONAL = "personal", "هدیه شخصی"
        ROMANTIC = "romantic", "عاشقانه"
        CORPORATE = "corporate", "سازمانی"
        BIRTHDAY = "birthday", "تولد"
        EVENT = "event", "رویداد"
        DAILY = "daily", "استفاده روزمره"

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        related_name="products",
        blank=True,
        null=True,
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    short_description = models.CharField(max_length=280, blank=True)
    description = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount_starts_at = models.DateTimeField(blank=True, null=True)
    discount_ends_at = models.DateTimeField(blank=True, null=True)
    product_type = models.CharField(max_length=32, choices=ProductType.choices, default=ProductType.OTHER)
    gift_usage = models.CharField(max_length=32, choices=GiftUsage.choices, default=GiftUsage.PERSONAL)
    material = models.CharField(max_length=160, blank=True)
    dimensions = models.CharField(max_length=160, blank=True)
    size_guide = models.TextField(blank=True)
    preparation_time = models.CharField(max_length=120, default="۲ تا ۴ روز کاری")
    print_file_guide = models.TextField(blank=True)
    stock_quantity = models.PositiveIntegerField(default=10)
    unlimited_stock = models.BooleanField(default=False)
    low_stock_threshold = models.PositiveIntegerField(default=5)

    image = models.ImageField(upload_to="products/", blank=True, null=True)

    is_active = models.BooleanField(default=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    approved_reviews_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    def clean(self):
        errors = {}

        if self.price is not None and self.price < 0:
            errors["price"] = "قیمت نمی‌تواند منفی باشد."
        if self.discount_price is not None:
            if self.discount_price < 0:
                errors["discount_price"] = "قیمت تخفیف نمی‌تواند منفی باشد."
            if self.price is not None and self.discount_price > self.price:
                errors["discount_price"] = "قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد."
        if self.discount_starts_at and self.discount_ends_at and self.discount_starts_at > self.discount_ends_at:
            errors["discount_ends_at"] = "تاریخ پایان تخفیف باید بعد از تاریخ شروع باشد."

        if errors:
            raise ValidationError(errors)

    @property
    def has_active_discount(self):
        if self.discount_price is None:
            return False

        now = timezone.now()
        if self.discount_starts_at and self.discount_starts_at > now:
            return False
        if self.discount_ends_at and self.discount_ends_at < now:
            return False
        return True

    @property
    def effective_price(self):
        return self.discount_price if self.has_active_discount else self.price

    @property
    def is_available(self):
        return self.is_active and (self.unlimited_stock or self.stock_quantity > 0)

    @property
    def is_low_stock(self):
        return self.is_active and not self.unlimited_stock and self.stock_quantity <= self.low_stock_threshold


class InventoryChange(models.Model):
    class ChangeType(models.TextChoices):
        MANUAL_INCREASE = "manual_increase", "افزایش دستی"
        MANUAL_DECREASE = "manual_decrease", "کاهش دستی"
        ORDER_PLACED = "order_placed", "ثبت سفارش"
        ORDER_CANCELLED = "order_cancelled", "لغو سفارش"
        ADJUSTMENT = "adjustment", "اصلاح موجودی"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory_changes",
    )
    previous_quantity = models.PositiveIntegerField()
    new_quantity = models.PositiveIntegerField()
    change_type = models.CharField(max_length=32, choices=ChangeType.choices)
    note = models.TextField(blank=True)
    changed_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        related_name="inventory_changes",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.product.title}: {self.previous_quantity} -> {self.new_quantity}"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="products/gallery/")
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.alt_text or self.product.title
