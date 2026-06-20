from django.db import models
from django.utils.text import slugify


class Portfolio(models.Model):
    class WorkType(models.TextChoices):
        MUG = "mug", "چاپ روی ماگ"
        TSHIRT = "tshirt", "چاپ روی تیشرت"
        GIFT = "gift", "هدیه اختصاصی"
        BRANDING = "branding", "هدیه تبلیغاتی"
        DESIGN = "design", "طراحی اختصاصی"

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    work_type = models.CharField(max_length=32, choices=WorkType.choices)
    client_name = models.CharField(max_length=120, blank=True)
    short_description = models.CharField(max_length=280, blank=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(upload_to="portfolio/covers/", blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    completed_at = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_featured", "-completed_at", "-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class PortfolioImage(models.Model):
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image = models.ImageField(upload_to="portfolio/gallery/")
    alt_text = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.alt_text or self.portfolio.title
