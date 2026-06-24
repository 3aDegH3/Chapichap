from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("design_request", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="designrequest",
            name="order_type",
            field=models.CharField(
                choices=[
                    ("print", "طرح آماده برای چاپ"),
                    ("custom_print", "طرح اختصاصی برای چاپ"),
                    ("gift", "هدیه اختصاصی"),
                    ("caricature", "طراحی کاریکاتور"),
                    ("consulting", "مشاوره طراحی"),
                    ("other", "سایر"),
                ],
                max_length=24,
            ),
        ),
    ]
