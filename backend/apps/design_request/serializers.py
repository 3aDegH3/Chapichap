from rest_framework import serializers

from apps.accounts.services import notify_design_request_received
from apps.core.file_security import make_secure_customer_filename, normalize_customer_content_type
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

from .models import DesignRequest, UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "file",
            "file_url",
            "original_name",
            "content_type",
            "size",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "file_url",
            "original_name",
            "content_type",
            "size",
            "created_at",
        ]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def create(self, validated_data):
        file = validated_data["file"]
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        original_name = file.name
        file.name = make_secure_customer_filename(original_name)

        return UploadedFile.objects.create(
            file=file,
            original_name=original_name,
            content_type=normalize_customer_content_type(getattr(file, "content_type", ""), original_name),
            size=file.size,
            uploaded_by=user,
            session_key=(request.session.session_key or "") if request else "",
        )


class DesignRequestSerializer(serializers.ModelSerializer):
    uploaded_file = UploadedFileSerializer(read_only=True)
    uploaded_file_id = serializers.PrimaryKeyRelatedField(
        queryset=UploadedFile.objects.all(),
        source="uploaded_file",
        write_only=True,
        required=False,
        allow_null=True,
    )
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_active=True),
        source="product",
        write_only=True,
        required=False,
        allow_null=True,
    )
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    order_type_label = serializers.CharField(source="get_order_type_display", read_only=True)

    class Meta:
        model = DesignRequest
        fields = [
            "id",
            "product",
            "product_id",
            "order_type",
            "order_type_label",
            "description",
            "contact_name",
            "contact_phone",
            "contact_email",
            "uploaded_file",
            "uploaded_file_id",
            "status",
            "status_label",
            "admin_response",
            "admin_response_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "product",
            "uploaded_file",
            "status",
            "status_label",
            "admin_response",
            "admin_response_at",
            "order_type_label",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
        design_request = super().create(validated_data)
        notify_design_request_received(design_request)
        return design_request

    def validate_uploaded_file_id(self, uploaded_file):
        if uploaded_file is None:
            return None

        request = self.context.get("request")
        if not request:
            raise serializers.ValidationError("مالکیت فایل قابل تأیید نیست.")

        is_owner = request.user.is_authenticated and uploaded_file.uploaded_by_id == request.user.id
        is_same_session = bool(
            request.session.session_key
            and uploaded_file.session_key == request.session.session_key
        )

        if not is_owner and not is_same_session:
            raise serializers.ValidationError("فایل انتخاب‌شده متعلق به این نشست نیست.")

        return uploaded_file
