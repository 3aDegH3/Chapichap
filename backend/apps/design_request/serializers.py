from rest_framework import serializers

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

        return UploadedFile.objects.create(
            file=file,
            original_name=file.name,
            content_type=getattr(file, "content_type", ""),
            size=file.size,
            uploaded_by=user,
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
    product_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
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
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "product",
            "uploaded_file",
            "status",
            "status_label",
            "order_type_label",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            validated_data["user"] = request.user
        return super().create(validated_data)
