from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("design_request", "0004_designrequest_order_alter_designrequest_status_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="uploadedfile",
            name="session_key",
            field=models.CharField(blank=True, db_index=True, max_length=40),
        ),
    ]
