from django.db import migrations, models
import django.db.models.deletion


OLD_TO_NEW_STATUS = {
    "PENDING": "pending",
    "PAID": "successful",
    "FAILED": "failed",
    "CANCELLED": "canceled",
    "REFUNDED": "canceled",
}


def migrate_payment_statuses(apps, schema_editor):
    Payment = apps.get_model("payments", "Payment")
    PaymentStatusLog = apps.get_model("payments", "PaymentStatusLog")

    for old_status, new_status in OLD_TO_NEW_STATUS.items():
        Payment.objects.filter(status=old_status).update(status=new_status)
        PaymentStatusLog.objects.filter(from_status=old_status).update(from_status=new_status)
        PaymentStatusLog.objects.filter(to_status=old_status).update(to_status=new_status)

    for payment in Payment.objects.select_related("order").filter(order_number=""):
        payment.order_number = payment.order.order_number
        payment.save(update_fields=["order_number"])


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("payments", "0002_paymentstatuslog"),
    ]

    operations = [
        migrations.AddField(
            model_name="payment",
            name="order_number",
            field=models.CharField(blank=True, db_index=True, default="", max_length=32),
        ),
        migrations.AddField(
            model_name="payment",
            name="receipt_number",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="payment",
            name="tracking_code",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.RunPython(migrate_payment_statuses, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="payment",
            name="provider",
            field=models.CharField(
                choices=[
                    ("MANUAL", "ثبت دستی"),
                    ("MOCK", "درگاه آزمایشی"),
                    ("GATEWAY", "درگاه آنلاین"),
                    ("BANK", "بانک"),
                ],
                default="MANUAL",
                max_length=24,
            ),
        ),
        migrations.AlterField(
            model_name="payment",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "در انتظار پرداخت"),
                    ("successful", "موفق"),
                    ("failed", "ناموفق"),
                    ("canceled", "لغوشده"),
                    ("expired", "منقضی‌شده"),
                ],
                default="pending",
                max_length=24,
            ),
        ),
        migrations.CreateModel(
            name="Transaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("order_number", models.CharField(db_index=True, max_length=32)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("gateway", models.CharField(default="mock", max_length=64)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "در انتظار پرداخت"),
                            ("successful", "موفق"),
                            ("failed", "ناموفق"),
                            ("canceled", "لغوشده"),
                            ("expired", "منقضی‌شده"),
                        ],
                        default="pending",
                        max_length=24,
                    ),
                ),
                ("idempotency_key", models.CharField(blank=True, max_length=120, null=True, unique=True)),
                ("gateway_reference", models.CharField(blank=True, max_length=120, null=True, unique=True)),
                ("tracking_code", models.CharField(blank=True, max_length=120)),
                ("receipt_number", models.CharField(blank=True, max_length=120)),
                ("failure_reason", models.TextField(blank=True)),
                ("request_payload", models.JSONField(blank=True, default=dict)),
                ("response_payload", models.JSONField(blank=True, default=dict)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "payment",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="transactions",
                        to="payments.payment",
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
