from rest_framework import serializers

from .models import Payment, Transaction


class PaymentMethodSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    is_active = serializers.BooleanField()
    requires_redirect = serializers.BooleanField()


class PaymentInitSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=Payment.Method.choices)
    idempotency_key = serializers.CharField(required=False, allow_blank=True, max_length=120)


class MockPaymentCallbackSerializer(serializers.Serializer):
    transaction_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=Transaction.Status.choices)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = [
            "id",
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
        read_only_fields = fields


class PaymentSerializer(serializers.ModelSerializer):
    method_label = serializers.CharField(source="get_method_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    requires_redirect = serializers.SerializerMethodField()
    next_action = serializers.SerializerMethodField()
    latest_transaction = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "order_number",
            "amount",
            "method",
            "method_label",
            "provider",
            "status",
            "status_label",
            "provider_reference",
            "tracking_code",
            "receipt_number",
            "failure_reason",
            "paid_at",
            "requires_redirect",
            "next_action",
            "latest_transaction",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_requires_redirect(self, obj):
        return obj.method == Payment.Method.ONLINE_GATEWAY and obj.status == Payment.Status.PENDING

    def get_next_action(self, obj):
        if obj.method == Payment.Method.IN_PERSON:
            return {"type": "SHOW_INSTRUCTIONS"}

        if obj.method == Payment.Method.ONLINE_GATEWAY and obj.status == Payment.Status.PENDING:
            transaction = obj.transactions.filter(status=Transaction.Status.PENDING).first()
            if transaction:
                return {
                    "type": "REDIRECT",
                    "url": f"/payment/mock?transaction={transaction.id}&reference={transaction.gateway_reference}",
                }

        return {"type": "NONE"}

    def get_latest_transaction(self, obj):
        transaction = obj.transactions.order_by("-created_at").first()
        if not transaction:
            return None

        return TransactionSerializer(transaction).data
