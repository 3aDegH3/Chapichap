from django.db.models import Q
from rest_framework import serializers

from apps.orders.serializers import OrderSerializer

from .models import (
    CustomerAddress,
    CustomerOffer,
    Notification,
    SupportAttachment,
    SupportMessage,
    SupportTicket,
    User,
)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "phone_number", "username", "first_name", "last_name", "password")
        extra_kwargs = {
            "email": {"required": True},
            "phone_number": {"required": False, "allow_blank": True},
            "username": {"required": False, "allow_blank": True},
            "first_name": {"required": False, "allow_blank": True},
            "last_name": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        if attrs.get("email"):
            attrs["email"] = attrs["email"].strip().lower()
        if attrs.get("phone_number") == "":
            attrs["phone_number"] = None
        if attrs.get("username") == "":
            attrs["username"] = None
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username"),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            phone_number=validated_data.get("phone_number"),
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier", "").strip()
        user = User.objects.filter(Q(email__iexact=identifier) | Q(phone_number=identifier)).first()

        if not user:
            raise serializers.ValidationError({"identifier": "حسابی با این ایمیل یا شماره موبایل پیدا نشد."})
        if not user.check_password(attrs.get("password")):
            raise serializers.ValidationError({"password": "رمز عبور اشتباه است."})
        if not user.is_active:
            raise serializers.ValidationError({"detail": "حساب کاربری شما غیرفعال است."})

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "username",
            "avatar",
            "email_verified",
            "phone_verified",
            "date_joined",
        )
        read_only_fields = ("id", "email", "email_verified", "phone_verified", "date_joined")


class EmailRequestCodeSerializer(serializers.Serializer):
    purpose = serializers.ChoiceField(choices=["email_verify", "password_reset"], default="email_verify", required=False)


class EmailVerifySerializer(serializers.Serializer):
    code = serializers.CharField(min_length=6, max_length=6)
    purpose = serializers.ChoiceField(choices=["email_verify", "password_reset"], default="email_verify", required=False)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
    password = serializers.CharField(min_length=6)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)


class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = [
            "id",
            "title",
            "receiver_name",
            "phone",
            "province",
            "city",
            "address",
            "postal_code",
            "plaque",
            "unit",
            "notes",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        user = self.context["request"].user
        if validated_data.get("is_default") or not CustomerAddress.objects.filter(user=user).exists():
            CustomerAddress.objects.filter(user=user).update(is_default=False)
            validated_data["is_default"] = True
        return CustomerAddress.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("is_default"):
            CustomerAddress.objects.filter(user=instance.user).exclude(id=instance.id).update(is_default=False)
        return super().update(instance, validated_data)


class CustomerOfferSerializer(serializers.ModelSerializer):
    status = serializers.CharField(read_only=True)
    offer_type_label = serializers.CharField(source="get_offer_type_display", read_only=True)
    discount_type_label = serializers.CharField(source="get_discount_type_display", read_only=True)

    class Meta:
        model = CustomerOffer
        fields = [
            "id",
            "title",
            "description",
            "offer_type",
            "offer_type_label",
            "discount_type",
            "discount_type_label",
            "discount_value",
            "coupon_code",
            "starts_at",
            "expires_at",
            "usage_limit",
            "usage_count",
            "minimum_order_amount",
            "is_active",
            "metadata",
            "status",
            "created_at",
        ]


class SupportAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = SupportAttachment
        fields = ["id", "file", "file_url", "filename", "file_size", "mime_type"]
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url


class SupportMessageSerializer(serializers.ModelSerializer):
    attachments = SupportAttachmentSerializer(many=True, read_only=True)
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = [
            "id",
            "sender",
            "sender_name",
            "message",
            "is_staff_message",
            "is_read_by_customer",
            "attachments",
            "created_at",
        ]
        read_only_fields = fields

    def get_sender_name(self, obj):
        if not obj.sender:
            return "پشتیبانی"
        return obj.sender.get_full_name() or obj.sender.email


class SupportTicketSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    priority_label = serializers.CharField(source="get_priority_display", read_only=True)
    unread_count = serializers.SerializerMethodField()
    order_number = serializers.CharField(source="order.order_number", read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "order",
            "order_number",
            "subject",
            "category",
            "category_label",
            "priority",
            "priority_label",
            "status",
            "status_label",
            "unread_count",
            "messages",
            "created_at",
            "updated_at",
            "closed_at",
        ]

    def get_unread_count(self, obj):
        return obj.messages.filter(is_staff_message=True, is_read_by_customer=False).count()


class SupportTicketCreateSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=180)
    category = serializers.ChoiceField(choices=SupportTicket.Category.choices)
    priority = serializers.ChoiceField(choices=SupportTicket.Priority.choices, default=SupportTicket.Priority.NORMAL)
    order = serializers.IntegerField(required=False, allow_null=True)
    message = serializers.CharField()


class SupportMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "link", "event_type", "is_read", "created_at"]


class DashboardSerializer(serializers.Serializer):
    user = UserSerializer()
    profile_completion = serializers.IntegerField()
    active_orders_count = serializers.IntegerField()
    design_requests_count = serializers.IntegerField()
    open_tickets_count = serializers.IntegerField()
    unread_notifications_count = serializers.IntegerField()
    latest_order = OrderSerializer(allow_null=True)
    latest_design_request = serializers.DictField(allow_null=True)
    active_offer = CustomerOfferSerializer(allow_null=True)
