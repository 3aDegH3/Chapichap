from django.db import migrations, models


OLD_TO_NEW_STATUS = {
    "PENDING_PAYMENT": "REGISTERED",
    "PAID": "REGISTERED",
    "PROCESSING": "PRINTING",
    "READY": "READY_TO_SHIP",
    "COMPLETED": "DELIVERED",
    "CANCELLED": "CANCELLED",
}


def migrate_order_statuses(apps, schema_editor):
    Order = apps.get_model("orders", "Order")
    OrderStatusHistory = apps.get_model("orders", "OrderStatusHistory")

    for old_status, new_status in OLD_TO_NEW_STATUS.items():
        Order.objects.filter(status=old_status).update(status=new_status)
        OrderStatusHistory.objects.filter(previous_status=old_status).update(
            previous_status=new_status
        )
        OrderStatusHistory.objects.filter(new_status=old_status).update(
            new_status=new_status
        )


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0004_order_coupon_code_order_discount_amount_and_more"),
    ]

    operations = [
        migrations.RunPython(migrate_order_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="order",
            name="status",
            field=models.CharField(
                choices=[
                    ("REGISTERED", "ثبت‌شده"),
                    ("REVIEWING", "در حال بررسی"),
                    ("WAITING_DESIGN_APPROVAL", "در انتظار تأیید طرح"),
                    ("READY_FOR_PRINT", "آماده چاپ"),
                    ("PRINTING", "در حال چاپ"),
                    ("READY_TO_SHIP", "آماده ارسال"),
                    ("SHIPPED", "ارسال‌شده"),
                    ("DELIVERED", "تحویل‌شده"),
                    ("CANCELLED", "لغوشده"),
                ],
                default="REGISTERED",
                max_length=24,
            ),
        ),
    ]
