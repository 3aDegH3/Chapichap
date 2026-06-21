# Generated manually for Sprint 3 design request and upload flow.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models

import apps.design_request.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("products", "0004_productimage"),
    ]

    operations = [
        migrations.CreateModel(
            name="UploadedFile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "file",
                    models.FileField(
                        upload_to="design-uploads/",
                        validators=[apps.design_request.models.validate_upload_file],
                    ),
                ),
                ("original_name", models.CharField(max_length=255)),
                ("content_type", models.CharField(blank=True, max_length=120)),
                ("size", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="uploaded_design_files",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="DesignRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "order_type",
                    models.CharField(
                        choices=[
                            ("logo", "طراحی لوگو"),
                            ("print", "طرح آماده چاپ"),
                            ("gift", "هدیه اختصاصی"),
                            ("consulting", "مشاوره طراحی"),
                            ("other", "سایر"),
                        ],
                        max_length=24,
                    ),
                ),
                ("description", models.TextField()),
                ("contact_name", models.CharField(max_length=150)),
                ("contact_phone", models.CharField(max_length=30)),
                ("contact_email", models.EmailField(blank=True, max_length=254)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("received", "ثبت شده"),
                            ("reviewing", "در حال بررسی"),
                            ("needs_info", "نیازمند اطلاعات بیشتر"),
                            ("approved", "تایید شده"),
                            ("rejected", "رد شده"),
                        ],
                        default="received",
                        max_length=24,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "product",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="design_requests",
                        to="products.product",
                    ),
                ),
                (
                    "uploaded_file",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="design_requests",
                        to="design_request.uploadedfile",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="design_requests",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
