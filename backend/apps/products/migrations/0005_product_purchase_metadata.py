from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0004_productimage"),
    ]

    operations = [
        migrations.AddField(
            model_name="product",
            name="dimensions",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="product",
            name="gift_usage",
            field=models.CharField(
                choices=[
                    ("personal", "هدیه شخصی"),
                    ("romantic", "عاشقانه"),
                    ("corporate", "سازمانی"),
                    ("birthday", "تولد"),
                    ("event", "رویداد"),
                    ("daily", "استفاده روزمره"),
                ],
                default="personal",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="material",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="product",
            name="preparation_time",
            field=models.CharField(default="۲ تا ۴ روز کاری", max_length=120),
        ),
        migrations.AddField(
            model_name="product",
            name="print_file_guide",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="product",
            name="product_type",
            field=models.CharField(
                choices=[
                    ("mug", "ماگ"),
                    ("apparel", "پوشاک"),
                    ("frame", "تابلو و قاب"),
                    ("stationery", "نوشت‌افزار"),
                    ("gift_set", "ست هدیه"),
                    ("promotional", "تبلیغاتی"),
                    ("other", "سایر"),
                ],
                default="other",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="product",
            name="size_guide",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="product",
            name="stock_quantity",
            field=models.PositiveIntegerField(default=10),
        ),
    ]
