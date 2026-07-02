from rest_framework import serializers

from .models import Review


class ReviewInputSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    title = serializers.CharField(required=False, allow_blank=True, max_length=150)
    body = serializers.CharField(min_length=10, max_length=2000, trim_whitespace=True)
    order_item_id = serializers.IntegerField(required=False, allow_null=True, min_value=1)


class ReviewUpdateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    title = serializers.CharField(required=False, allow_blank=True, max_length=150)
    body = serializers.CharField(required=False, min_length=10, max_length=2000, trim_whitespace=True)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("حداقل یک فیلد برای ویرایش ارسال کنید.")
        return attrs


class ReviewProductSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    title = serializers.CharField(read_only=True)
    slug = serializers.CharField(read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url


class PublicReviewSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "display_name",
            "rating",
            "title",
            "body",
            "is_verified_purchase",
            "admin_reply",
            "admin_reply_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AccountReviewSerializer(PublicReviewSerializer):
    product = ReviewProductSerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    can_edit = serializers.SerializerMethodField()

    class Meta(PublicReviewSerializer.Meta):
        fields = [
            "id",
            "product",
            "rating",
            "title",
            "body",
            "status",
            "status_label",
            "is_verified_purchase",
            "admin_reply",
            "admin_reply_at",
            "created_at",
            "updated_at",
            "can_edit",
        ]

    def get_can_edit(self, obj):
        return obj.deleted_at is None


class AdminReviewSerializer(AccountReviewSerializer):
    display_name = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    order_number = serializers.CharField(source="order_item.order.order_number", read_only=True, allow_null=True)

    class Meta(AccountReviewSerializer.Meta):
        fields = [
            *AccountReviewSerializer.Meta.fields,
            "display_name",
            "user_email",
            "order_item",
            "order_number",
            "is_reported",
            "approved_at",
            "deleted_at",
        ]


class AdminReviewActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(required=False, choices=Review.Status.choices)
    admin_reply = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("وضعیت یا پاسخ مدیر را ارسال کنید.")
        return attrs


class AdminReviewBulkSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        min_length=1,
        max_length=100,
    )
    action = serializers.ChoiceField(choices=["approve", "reject", "hide", "delete"])

