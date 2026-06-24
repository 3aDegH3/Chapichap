from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0005_update_order_status_workflow"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="idempotency_key",
            field=models.CharField(blank=True, max_length=120, null=True, unique=True),
        ),
    ]
