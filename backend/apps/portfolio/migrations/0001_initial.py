# Generated manually for Sprint 2 portfolio.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Portfolio",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("slug", models.SlugField(blank=True, unique=True)),
                (
                    "work_type",
                    models.CharField(
                        choices=[
                            ("mug", "چاپ روی ماگ"),
                            ("tshirt", "چاپ روی تیشرت"),
                            ("gift", "هدیه اختصاصی"),
                            ("branding", "هدیه تبلیغاتی"),
                            ("design", "طراحی اختصاصی"),
                        ],
                        max_length=32,
                    ),
                ),
                ("client_name", models.CharField(blank=True, max_length=120)),
                ("short_description", models.CharField(blank=True, max_length=280)),
                ("description", models.TextField(blank=True)),
                ("cover_image", models.ImageField(blank=True, null=True, upload_to="portfolio/covers/")),
                ("is_featured", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("completed_at", models.DateField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-is_featured", "-completed_at", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="PortfolioImage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("image", models.ImageField(upload_to="portfolio/gallery/")),
                ("alt_text", models.CharField(blank=True, max_length=255)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "portfolio",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="portfolio.portfolio",
                    ),
                ),
            ],
            options={
                "ordering": ["sort_order", "id"],
            },
        ),
    ]
