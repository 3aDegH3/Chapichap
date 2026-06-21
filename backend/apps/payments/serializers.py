from rest_framework import serializers

from .models import Payment


class PaymentMethodSerializer(serializers.Serializer):
    code = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    is_active = serializers.BooleanField()
    requires_redirect = serializers.BooleanField()


class PaymentInitSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=Payment.Method.choices)


class PaymentSerializer(serializers.ModelSerializer):
    method_label = serializers.CharField(source="get_method_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    requires_redirect = serializers.SerializerMethodField()
    next_action = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "amount",
            "method",
            "method_label",
            "provider",
            "status",
            "status_label",
            "provider_reference",
            "failure_reason",
            "paid_at",
            "requires_redirect",
            "next_action",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_requires_redirect(self, obj):
        return obj.method == Payment.Method.ONLINE_GATEWAY

    def get_next_action(self, obj):
        if obj.method == Payment.Method.IN_PERSON:
            return {"type": "SHOW_INSTRUCTIONS"}

        return {"type": "NONE"}
