from django.contrib import admin
from django.core.exceptions import ValidationError

from .models import Payment, PaymentStatusLog, Transaction
from .services import mark_payment_as_paid


class PaymentStatusLogInline(admin.TabularInline):
    model = PaymentStatusLog
    extra = 0
    readonly_fields = ["actor", "from_status", "to_status", "note", "created_at"]
    can_delete = False


class TransactionInline(admin.TabularInline):
    model = Transaction
    extra = 0
    readonly_fields = [
        "order_number",
        "amount",
        "gateway",
        "status",
        "gateway_reference",
        "tracking_code",
        "receipt_number",
        "failure_reason",
        "completed_at",
        "created_at",
        "updated_at",
    ]
    can_delete = False


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "order",
        "order_number",
        "amount",
        "method",
        "provider",
        "status",
        "tracking_code",
        "receipt_number",
        "paid_at",
        "created_at",
    ]
    list_filter = ["method", "provider", "status", "created_at"]
    search_fields = ["order__order_number", "provider_reference"]
    readonly_fields = ["order_number", "tracking_code", "receipt_number", "paid_at", "created_at", "updated_at"]
    actions = ["mark_selected_as_paid"]
    inlines = [TransactionInline, PaymentStatusLogInline]

    @admin.action(description="تایید پرداخت حضوری انتخاب‌شده")
    def mark_selected_as_paid(self, request, queryset):
        success_count = 0

        for payment in queryset:
            try:
                mark_payment_as_paid(payment.id, actor=request.user)
                success_count += 1
            except ValidationError as error:
                self.message_user(request, error.message, level="ERROR")

        if success_count:
            self.message_user(request, f"{success_count} پرداخت با موفقیت تایید شد.")
