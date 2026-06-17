from django.db import models
from django.utils.text import slugify


class Product(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)

    description = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2)

    image = models.ImageField(upload_to="products/", blank=True, null=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title