from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("full_name", models.CharField(max_length=150)),
                ("phone", models.CharField(max_length=30)),
                (
                    "subject",
                    models.CharField(
                        choices=[
                            ("order", "سفارش محصول"),
                            ("custom_design", "طراحی اختصاصی"),
                            ("collaboration", "همکاری"),
                            ("follow_up", "پیگیری سفارش"),
                            ("general", "سؤال عمومی"),
                        ],
                        max_length=32,
                    ),
                ),
                ("message", models.TextField()),
                ("contact_permission", models.BooleanField(default=True)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("new", "جدید"),
                            ("reviewed", "بررسی شده"),
                            ("contacted", "تماس گرفته شد"),
                            ("closed", "بسته شده"),
                        ],
                        default="new",
                        max_length=24,
                    ),
                ),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
