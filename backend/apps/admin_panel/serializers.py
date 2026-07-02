from django.db.models import Count, Q
from rest_framework import serializers

from apps.accounts.models import CustomerAddress, SupportAttachment, User
from apps.content.models import ContactMessage, ContactMessageInternalNote
from apps.core.file_security import PREVIEWABLE_CUSTOMER_FILE_TYPES
from apps.design_request.models import DesignRequest, DesignRequestInternalNote, DesignRequestStatusHistory, UploadedFile
from apps.orders.models import Order, OrderInternalNote, OrderItem, OrderStatusHistory
from apps.products.models import Category, InventoryChange, Product, ProductImage

from .models import AdminActivityLog
from .permissions import get_admin_permissions


class AdminCustomerFileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    source = serializers.CharField()
    filename = serializers.CharField()
    mime_type = serializers.CharField()
    file_size = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    uploaded_by_label = serializers.CharField(allow_blank=True)
    related_type = serializers.CharField()
    related_id = serializers.IntegerField(allow_null=True)
    related_label = serializers.CharField(allow_blank=True)
    order_id = serializers.IntegerField(allow_null=True)
    order_number = serializers.CharField(allow_blank=True)
    preview_url = serializers.CharField(allow_null=True)
    download_url = serializers.CharField()


class AdminActivityLogSerializer(serializers.ModelSerializer):
    actor_label = serializers.SerializerMethodField()
    action_label = serializers.CharField(source="get_action_display", read_only=True)
    entity_type_label = serializers.SerializerMethodField()

    class Meta:
        model = AdminActivityLog
        fields = [
            "id",
            "actor",
            "actor_label",
            "action",
            "action_label",
            "entity_type",
            "entity_type_label",
            "entity_id",
            "description",
            "ip_address",
            "created_at",
        ]
        read_only_fields = fields

    def get_actor_label(self, obj):
        if not obj.actor:
            return "مدیر حذف‌شده"
        return obj.actor.get_full_name() or obj.actor.email

    def get_entity_type_label(self, obj):
        labels = {
            "order": "سفارش",
            "product": "محصول",
            "customer_file": "فایل مشتری",
            "design_request": "درخواست طراحی",
            "admin_user": "مدیر",
        }
        return labels.get(obj.entity_type, obj.entity_type)


def build_design_file_record(obj, request):
    design_request = obj.design_requests.select_related("order").order_by("-created_at").first()
    order = design_request.order if design_request else None
    mime_type = obj.content_type or ""
    can_preview = mime_type in PREVIEWABLE_CUSTOMER_FILE_TYPES
    uploaded_by_label = ""
    if obj.uploaded_by:
        uploaded_by_label = obj.uploaded_by.get_full_name() or obj.uploaded_by.email

    return {
        "id": obj.id,
        "source": "design",
        "filename": obj.original_name,
        "mime_type": mime_type,
        "file_size": obj.size,
        "created_at": obj.created_at,
        "uploaded_by_label": uploaded_by_label,
        "related_type": "design_request",
        "related_id": design_request.id if design_request else None,
        "related_label": str(design_request) if design_request else "درخواست طراحی",
        "order_id": order.id if order else None,
        "order_number": order.order_number if order else "",
        "preview_url": request.build_absolute_uri(f"/api/v1/admin/customer-files/design/{obj.id}/preview/") if can_preview else None,
        "download_url": request.build_absolute_uri(f"/api/v1/admin/customer-files/design/{obj.id}/download/"),
    }


def build_support_file_record(obj, request):
    ticket = obj.message.ticket
    order = ticket.order
    mime_type = obj.mime_type or ""
    can_preview = mime_type in PREVIEWABLE_CUSTOMER_FILE_TYPES
    uploaded_by_label = ""
    if obj.message.sender:
        uploaded_by_label = obj.message.sender.get_full_name() or obj.message.sender.email

    return {
        "id": obj.id,
        "source": "support",
        "filename": obj.filename,
        "mime_type": mime_type,
        "file_size": obj.file_size,
        "created_at": obj.message.created_at,
        "uploaded_by_label": uploaded_by_label,
        "related_type": "support_ticket",
        "related_id": ticket.id,
        "related_label": ticket.subject,
        "order_id": order.id if order else None,
        "order_number": order.order_number if order else "",
        "preview_url": request.build_absolute_uri(f"/api/v1/admin/customer-files/support/{obj.id}/preview/") if can_preview else None,
        "download_url": request.build_absolute_uri(f"/api/v1/admin/customer-files/support/{obj.id}/download/"),
    }


class AdminContactMessageListSerializer(serializers.ModelSerializer):
    subject_label = serializers.CharField(source="get_subject_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    notes_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "phone",
            "subject",
            "subject_label",
            "status",
            "status_label",
            "contact_permission",
            "notes_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AdminContactMessageDetailSerializer(AdminContactMessageListSerializer):
    class Meta(AdminContactMessageListSerializer.Meta):
        fields = [
            *AdminContactMessageListSerializer.Meta.fields,
            "message",
        ]
        read_only_fields = fields


class AdminContactMessageStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=ContactMessage.Status.choices)


class AdminContactMessageBulkReadSerializer(serializers.Serializer):
    ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
        max_length=200,
    )

    def validate_ids(self, value):
        return list(dict.fromkeys(value))


class AdminContactMessageInternalNoteSerializer(serializers.ModelSerializer):
    author_label = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = ContactMessageInternalNote
        fields = [
            "id",
            "contact_message",
            "author",
            "author_label",
            "text",
            "can_edit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_author_label(self, obj):
        if not obj.author:
            return "مدیر"
        return obj.author.get_full_name() or obj.author.email

    def get_can_edit(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and (user.is_superuser or obj.author_id == user.id))


class AdminContactMessageInternalNoteCreateSerializer(serializers.Serializer):
    text = serializers.CharField(max_length=5000)

    def validate_text(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("متن یادداشت داخلی الزامی است.")
        return value


class AdminCustomerAddressSerializer(serializers.ModelSerializer):
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
        read_only_fields = fields


class AdminCustomerOrderSummarySerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "receiver_name",
            "phone",
            "total_amount",
            "status",
            "status_label",
            "created_at",
        ]
        read_only_fields = fields


class AdminCustomerListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    order_count = serializers.IntegerField(read_only=True)
    total_order_amount = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    last_order_at = serializers.DateTimeField(read_only=True, allow_null=True)
    account_status = serializers.SerializerMethodField()
    account_status_label = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "first_name",
            "last_name",
            "phone_number",
            "email",
            "date_joined",
            "order_count",
            "total_order_amount",
            "last_order_at",
            "account_status",
            "account_status_label",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_account_status(self, obj):
        return "active" if obj.is_active else "inactive"

    def get_account_status_label(self, obj):
        return "فعال" if obj.is_active else "غیرفعال"


class AdminCustomerDetailSerializer(AdminCustomerListSerializer):
    avatar_url = serializers.SerializerMethodField()
    addresses = AdminCustomerAddressSerializer(many=True, read_only=True)
    orders = serializers.SerializerMethodField()
    design_requests = serializers.SerializerMethodField()
    contact_messages = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()

    class Meta(AdminCustomerListSerializer.Meta):
        fields = [
            *AdminCustomerListSerializer.Meta.fields,
            "username",
            "avatar_url",
            "phone_verified",
            "email_verified",
            "last_login",
            "addresses",
            "orders",
            "design_requests",
            "contact_messages",
            "files",
        ]
        read_only_fields = fields

    def get_avatar_url(self, obj):
        if not obj.avatar:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.avatar.url) if request else obj.avatar.url

    def get_orders(self, obj):
        orders = obj.orders.order_by("-created_at")
        return AdminCustomerOrderSummarySerializer(orders, many=True).data

    def get_design_requests(self, obj):
        requests = obj.design_requests.select_related("product", "order", "uploaded_file").order_by("-created_at")
        return AdminDesignRequestListSerializer(requests, many=True, context=self.context).data

    def get_contact_messages(self, obj):
        if not obj.phone_number:
            return []
        messages = ContactMessage.objects.filter(phone=obj.phone_number, is_deleted=False).annotate(
            notes_count=Count("internal_notes", distinct=True)
        )
        return AdminContactMessageDetailSerializer(messages, many=True).data

    def get_files(self, obj):
        request = self.context.get("request")
        design_files = UploadedFile.objects.filter(
            Q(uploaded_by=obj) | Q(design_requests__user=obj)
        ).select_related("uploaded_by").prefetch_related("design_requests").distinct()
        support_files = SupportAttachment.objects.filter(message__sender=obj).select_related(
            "message__sender",
            "message__ticket__order",
        )
        records = [build_design_file_record(item, request) for item in design_files]
        records.extend(build_support_file_record(item, request) for item in support_files)
        records.sort(key=lambda item: item["created_at"], reverse=True)
        return AdminCustomerFileSerializer(records, many=True).data


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    admin_role = serializers.SerializerMethodField()
    admin_role_label = serializers.SerializerMethodField()
    admin_permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone_number",
            "is_staff",
            "is_superuser",
            "admin_role",
            "admin_role_label",
            "admin_permissions",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_admin_role(self, obj):
        return obj.effective_admin_role

    def get_admin_role_label(self, obj):
        return User.AdminRole(obj.effective_admin_role).label if obj.effective_admin_role else ""

    def get_admin_permissions(self, obj):
        return get_admin_permissions(obj)


class AdminManagerSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    admin_role = serializers.SerializerMethodField()
    admin_role_label = serializers.SerializerMethodField()
    admin_permissions = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone_number",
            "admin_role",
            "admin_role_label",
            "admin_permissions",
            "is_active",
            "is_staff",
            "is_superuser",
            "can_edit",
            "date_joined",
            "last_login",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.email

    def get_admin_role(self, obj):
        return obj.effective_admin_role

    def get_admin_role_label(self, obj):
        return User.AdminRole(obj.effective_admin_role).label if obj.effective_admin_role else ""

    def get_admin_permissions(self, obj):
        return get_admin_permissions(obj)

    def get_can_edit(self, obj):
        request = self.context.get("request")
        return bool(request and not obj.is_superuser and obj.pk != request.user.pk)


MANAGEABLE_ADMIN_ROLE_CHOICES = [
    (User.AdminRole.ORDER_MANAGER, User.AdminRole.ORDER_MANAGER.label),
    (User.AdminRole.PRODUCT_MANAGER, User.AdminRole.PRODUCT_MANAGER.label),
    (User.AdminRole.SUPPORT, User.AdminRole.SUPPORT.label),
]


class AdminManagerGrantSerializer(serializers.Serializer):
    email = serializers.EmailField()
    admin_role = serializers.ChoiceField(choices=MANAGEABLE_ADMIN_ROLE_CHOICES)


class AdminManagerUpdateSerializer(serializers.Serializer):
    admin_role = serializers.ChoiceField(
        choices=[("", "لغو دسترسی")] + MANAGEABLE_ADMIN_ROLE_CHOICES,
        required=False,
    )
    is_active = serializers.BooleanField(required=False)

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("حداقل یک تغییر ارسال کنید.")
        return attrs


class AdminDesignRequestFileSerializer(serializers.ModelSerializer):
    preview_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "original_name",
            "content_type",
            "size",
            "preview_url",
            "download_url",
            "created_at",
        ]
        read_only_fields = fields

    def get_preview_url(self, obj):
        if obj.content_type not in PREVIEWABLE_CUSTOMER_FILE_TYPES:
            return None
        request = self.context.get("request")
        path = f"/api/v1/admin/customer-files/design/{obj.id}/preview/"
        return request.build_absolute_uri(path) if request else path

    def get_download_url(self, obj):
        request = self.context.get("request")
        path = f"/api/v1/admin/customer-files/design/{obj.id}/download/"
        return request.build_absolute_uri(path) if request else path


class AdminDesignRequestListSerializer(serializers.ModelSerializer):
    request_number = serializers.SerializerMethodField()
    customer_name = serializers.CharField(source="contact_name", read_only=True)
    customer_phone = serializers.CharField(source="contact_phone", read_only=True)
    product_title = serializers.SerializerMethodField()
    order_type_label = serializers.CharField(source="get_order_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    files_count = serializers.SerializerMethodField()
    order_number = serializers.SerializerMethodField()

    class Meta:
        model = DesignRequest
        fields = [
            "id",
            "request_number",
            "customer_name",
            "customer_phone",
            "contact_email",
            "product",
            "product_title",
            "order",
            "order_number",
            "order_type",
            "order_type_label",
            "status",
            "status_label",
            "files_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_request_number(self, obj):
        return f"DR-{obj.id:06d}"

    def get_files_count(self, obj):
        return 1 if obj.uploaded_file_id else 0

    def get_product_title(self, obj):
        return obj.product.title if obj.product else ""

    def get_order_number(self, obj):
        return obj.order.order_number if obj.order else ""


class AdminDesignRequestStatusHistorySerializer(serializers.ModelSerializer):
    previous_status_label = serializers.SerializerMethodField()
    new_status_label = serializers.SerializerMethodField()
    created_by_label = serializers.SerializerMethodField()

    class Meta:
        model = DesignRequestStatusHistory
        fields = [
            "id",
            "previous_status",
            "previous_status_label",
            "new_status",
            "new_status_label",
            "note",
            "created_by",
            "created_by_label",
            "created_at",
        ]
        read_only_fields = fields

    def get_status_label(self, value):
        if not value:
            return ""
        try:
            return DesignRequest.Status(value).label
        except ValueError:
            return value

    def get_previous_status_label(self, obj):
        return self.get_status_label(obj.previous_status)

    def get_new_status_label(self, obj):
        return self.get_status_label(obj.new_status)

    def get_created_by_label(self, obj):
        if not obj.created_by:
            return ""
        return obj.created_by.get_full_name() or obj.created_by.email


class AdminDesignRequestInternalNoteSerializer(serializers.ModelSerializer):
    author_label = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = DesignRequestInternalNote
        fields = [
            "id",
            "design_request",
            "author",
            "author_label",
            "text",
            "can_edit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_author_label(self, obj):
        if not obj.author:
            return "مدیر"
        return obj.author.get_full_name() or obj.author.email

    def get_can_edit(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and (user.is_superuser or obj.author_id == user.id))


class AdminDesignRequestDetailSerializer(AdminDesignRequestListSerializer):
    user_email = serializers.SerializerMethodField()
    user_full_name = serializers.SerializerMethodField()
    uploaded_file = AdminDesignRequestFileSerializer(read_only=True)
    status_history = AdminDesignRequestStatusHistorySerializer(many=True, read_only=True)

    class Meta(AdminDesignRequestListSerializer.Meta):
        fields = [
            *AdminDesignRequestListSerializer.Meta.fields,
            "user",
            "user_email",
            "user_full_name",
            "description",
            "contact_name",
            "contact_phone",
            "uploaded_file",
            "admin_response",
            "admin_response_at",
            "responded_by",
            "status_history",
        ]
        read_only_fields = fields

    def get_user_full_name(self, obj):
        if not obj.user:
            return ""
        return obj.user.get_full_name() or obj.user.email

    def get_user_email(self, obj):
        return obj.user.email if obj.user else ""


class AdminDesignRequestStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=DesignRequest.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)


class AdminDesignRequestResponseUpdateSerializer(serializers.Serializer):
    admin_response = serializers.CharField(allow_blank=True)


class AdminDesignRequestOrderLinkSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=False, allow_null=True)


class AdminDesignRequestInternalNoteCreateSerializer(serializers.Serializer):
    text = serializers.CharField()


class AdminDashboardOrderSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    delivery_method_label = serializers.CharField(source="get_delivery_method_display", read_only=True)
    payment_status = serializers.SerializerMethodField()
    payment_status_label = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "receiver_name",
            "phone",
            "total_amount",
            "status",
            "status_label",
            "payment_status",
            "payment_status_label",
            "delivery_method",
            "delivery_method_label",
            "created_at",
        ]
        read_only_fields = fields

    def get_latest_payment(self, obj):
        payments = list(getattr(obj, "_prefetched_objects_cache", {}).get("payments", []))
        if payments:
            return payments[0]
        return obj.payments.order_by("-created_at").first()

    def get_payment_status(self, obj):
        payment = self.get_latest_payment(obj)
        return payment.status if payment else None

    def get_payment_status_label(self, obj):
        payment = self.get_latest_payment(obj)
        return payment.get_status_display() if payment else "ثبت نشده"


class AdminOrderListSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source="user.email", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    delivery_method_label = serializers.CharField(source="get_delivery_method_display", read_only=True)
    payment_status = serializers.SerializerMethodField()
    payment_status_label = serializers.SerializerMethodField()
    payment_method_label = serializers.SerializerMethodField()
    tracking_code = serializers.SerializerMethodField()
    items_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "receiver_name",
            "phone",
            "customer_email",
            "total_amount",
            "status",
            "status_label",
            "payment_status",
            "payment_status_label",
            "payment_method_label",
            "tracking_code",
            "delivery_method",
            "delivery_method_label",
            "items_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_latest_payment(self, obj):
        payments = list(getattr(obj, "_prefetched_objects_cache", {}).get("payments", []))
        if payments:
            return payments[0]
        return obj.payments.order_by("-created_at").first()

    def get_payment_status(self, obj):
        payment = self.get_latest_payment(obj)
        return payment.status if payment else None

    def get_payment_status_label(self, obj):
        payment = self.get_latest_payment(obj)
        return payment.get_status_display() if payment else "ثبت نشده"

    def get_payment_method_label(self, obj):
        payment = self.get_latest_payment(obj)
        return payment.get_method_display() if payment else "ثبت نشده"

    def get_tracking_code(self, obj):
        payment = self.get_latest_payment(obj)
        return payment.tracking_code if payment else ""


class AdminOrderItemSerializer(serializers.ModelSerializer):
    product_image_url = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_title",
            "product_image",
            "product_image_url",
            "unit_price",
            "quantity",
            "line_total",
            "selected_options",
            "created_at",
        ]
        read_only_fields = fields

    def get_product_image_url(self, obj):
        if not obj.product_image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.product_image) if request else obj.product_image


class AdminOrderStatusHistorySerializer(serializers.ModelSerializer):
    previous_status_label = serializers.SerializerMethodField()
    new_status_label = serializers.SerializerMethodField()
    note = serializers.CharField(source="description", read_only=True)
    changed_by = serializers.IntegerField(source="created_by_id", read_only=True)
    changed_by_label = serializers.SerializerMethodField()
    created_by_label = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = [
            "id",
            "previous_status",
            "previous_status_label",
            "new_status",
            "new_status_label",
            "title",
            "description",
            "note",
            "visible_to_customer",
            "changed_by",
            "changed_by_label",
            "created_by",
            "created_by_label",
            "created_at",
        ]
        read_only_fields = fields

    def get_previous_status_label(self, obj):
        return dict(Order.Status.choices).get(obj.previous_status, obj.previous_status)

    def get_new_status_label(self, obj):
        return dict(Order.Status.choices).get(obj.new_status, obj.new_status)

    def get_created_by_label(self, obj):
        if not obj.created_by:
            return "سیستم"
        return obj.created_by.get_full_name() or obj.created_by.email

    def get_changed_by_label(self, obj):
        return self.get_created_by_label(obj)


class AdminOrderPaymentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    amount = serializers.CharField()
    method = serializers.CharField()
    method_label = serializers.CharField()
    status = serializers.CharField()
    status_label = serializers.CharField()
    provider = serializers.CharField()
    provider_reference = serializers.CharField(allow_null=True)
    tracking_code = serializers.CharField()
    receipt_number = serializers.CharField()
    failure_reason = serializers.CharField()
    paid_at = serializers.CharField(allow_null=True)
    created_at = serializers.CharField()


class AdminOrderDetailSerializer(serializers.ModelSerializer):
    customer_email = serializers.EmailField(source="user.email", read_only=True)
    customer_full_name = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    delivery_method_label = serializers.CharField(source="get_delivery_method_display", read_only=True)
    items = AdminOrderItemSerializer(many=True, read_only=True)
    status_history = AdminOrderStatusHistorySerializer(many=True, read_only=True)
    payment = serializers.SerializerMethodField()
    customer_files = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "user",
            "customer_email",
            "customer_full_name",
            "receiver_name",
            "phone",
            "province",
            "city",
            "address",
            "postal_code",
            "delivery_method",
            "delivery_method_label",
            "shipping_provider",
            "shipping_tracking_code",
            "shipping_cost",
            "subtotal",
            "discount_amount",
            "coupon_code",
            "total_amount",
            "status",
            "status_label",
            "notes",
            "items",
            "payment",
            "status_history",
            "customer_files",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_customer_full_name(self, obj):
        if not obj.user:
            return ""
        return obj.user.get_full_name()

    def get_payment(self, obj):
        payment = obj.payments.order_by("-created_at").first()
        if not payment:
            return None

        return {
            "id": payment.id,
            "amount": str(payment.amount),
            "method": payment.method,
            "method_label": payment.get_method_display(),
            "status": payment.status,
            "status_label": payment.get_status_display(),
            "provider": payment.provider,
            "provider_reference": payment.provider_reference,
            "tracking_code": payment.tracking_code,
            "receipt_number": payment.receipt_number,
            "failure_reason": payment.failure_reason,
            "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
            "created_at": payment.created_at.isoformat(),
        }

    def get_customer_files(self, obj):
        request = self.context.get("request")
        design_files = UploadedFile.objects.filter(
            design_requests__order=obj
        ).select_related("uploaded_by").distinct()
        support_files = SupportAttachment.objects.filter(
            message__ticket__order=obj
        ).select_related("message__sender", "message__ticket__order")
        records = [build_design_file_record(item, request) for item in design_files]
        records.extend(build_support_file_record(item, request) for item in support_files)
        records.sort(key=lambda item: item["created_at"], reverse=True)
        return AdminCustomerFileSerializer(records, many=True).data


class AdminOrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
    note = serializers.CharField(required=False, allow_blank=True)
    visible_to_customer = serializers.BooleanField(required=False, default=True)


class AdminOrderShippingUpdateSerializer(serializers.Serializer):
    delivery_method = serializers.ChoiceField(choices=Order.DeliveryMethod.choices, required=False)
    shipping_provider = serializers.CharField(required=False, allow_blank=True, max_length=120)
    shipping_tracking_code = serializers.CharField(required=False, allow_blank=True, max_length=120)


class AdminOrderInternalNoteSerializer(serializers.ModelSerializer):
    author_label = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = OrderInternalNote
        fields = [
            "id",
            "order",
            "author",
            "author_label",
            "text",
            "can_edit",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "order", "author", "author_label", "can_edit", "created_at", "updated_at"]

    def get_author_label(self, obj):
        if not obj.author:
            return "مدیر حذف‌شده"
        return obj.author.get_full_name() or obj.author.email

    def get_can_edit(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and (user.is_superuser or obj.author_id == user.id))


class AdminOrderInternalNoteCreateSerializer(serializers.Serializer):
    text = serializers.CharField(trim_whitespace=True)

    def validate_text(self, value):
        if not value.strip():
            raise serializers.ValidationError("متن یادداشت داخلی الزامی است.")
        return value


class AdminDashboardDesignRequestSerializer(serializers.ModelSerializer):
    order_type_label = serializers.CharField(source="get_order_type_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = DesignRequest
        fields = [
            "id",
            "contact_name",
            "contact_phone",
            "order_type",
            "order_type_label",
            "status",
            "status_label",
            "created_at",
        ]
        read_only_fields = fields


class AdminDashboardProductSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source="category.title", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "slug",
            "category_title",
            "stock_quantity",
            "is_active",
            "updated_at",
        ]
        read_only_fields = fields


class AdminDashboardContactMessageSerializer(serializers.ModelSerializer):
    subject_label = serializers.CharField(source="get_subject_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "phone",
            "subject",
            "subject_label",
            "status",
            "status_label",
            "created_at",
        ]
        read_only_fields = fields


class AdminProductCategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_count = serializers.IntegerField(read_only=True)
    children_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "parent",
            "image",
            "image_url",
            "sort_order",
            "is_active",
            "product_count",
            "children_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "image_url", "product_count", "children_count", "created_at", "updated_at"]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True},
            "parent": {"required": False, "allow_null": True},
            "image": {"required": False, "allow_null": True},
            "sort_order": {"required": False},
            "is_active": {"required": False},
        }

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    def to_internal_value(self, data):
        mutable_data = data.copy()
        if mutable_data.get("parent") == "":
            mutable_data["parent"] = None
        return super().to_internal_value(mutable_data)

    def validate_parent(self, value):
        if self.instance and value:
            if value.pk == self.instance.pk:
                raise serializers.ValidationError("دسته‌بندی نمی‌تواند والد خودش باشد.")
            parent = value.parent
            while parent:
                if parent.pk == self.instance.pk:
                    raise serializers.ValidationError("این انتخاب باعث چرخه در دسته‌بندی‌ها می‌شود.")
                parent = parent.parent
        return value

    def validate_sort_order(self, value):
        if value < 0:
            raise serializers.ValidationError("ترتیب نمایش نمی‌تواند منفی باشد.")
        return value


class AdminProductSerializer(serializers.ModelSerializer):
    gallery_images = serializers.SerializerMethodField()
    category_detail = AdminProductCategorySerializer(source="category", read_only=True)
    product_type_label = serializers.CharField(source="get_product_type_display", read_only=True)
    gift_usage_label = serializers.CharField(source="get_gift_usage_display", read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_active_discount = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
            "category_detail",
            "title",
            "slug",
            "short_description",
            "description",
            "price",
            "discount_price",
            "discount_starts_at",
            "discount_ends_at",
            "effective_price",
            "has_active_discount",
            "product_type",
            "product_type_label",
            "gift_usage",
            "gift_usage_label",
            "material",
            "dimensions",
            "size_guide",
            "preparation_time",
            "print_file_guide",
            "stock_quantity",
            "unlimited_stock",
            "low_stock_threshold",
            "is_available",
            "is_low_stock",
            "image",
            "image_url",
            "gallery_images",
            "is_active",
            "average_rating",
            "approved_reviews_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "category_detail", "product_type_label", "gift_usage_label", "is_available", "effective_price", "has_active_discount", "is_low_stock", "image_url", "gallery_images", "average_rating", "approved_reviews_count", "created_at", "updated_at"]
        extra_kwargs = {
            "category": {"required": False, "allow_null": True},
            "slug": {"required": False, "allow_blank": True},
            "short_description": {"required": False, "allow_blank": True},
            "description": {"required": False, "allow_blank": True, "allow_null": True},
            "material": {"required": False, "allow_blank": True},
            "dimensions": {"required": False, "allow_blank": True},
            "size_guide": {"required": False, "allow_blank": True},
            "preparation_time": {"required": False, "allow_blank": True},
            "print_file_guide": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_null": True},
            "discount_price": {"required": False, "allow_null": True},
            "discount_starts_at": {"required": False, "allow_null": True},
            "discount_ends_at": {"required": False, "allow_null": True},
            "unlimited_stock": {"required": False},
            "low_stock_threshold": {"required": False},
        }

    def to_internal_value(self, data):
        mutable_data = data.copy()
        for field in ["discount_price", "discount_starts_at", "discount_ends_at"]:
            if mutable_data.get(field) == "":
                mutable_data[field] = None
        return super().to_internal_value(mutable_data)

    def get_image_url(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.image.url) if request else obj.image.url

    def get_gallery_images(self, obj):
        request = self.context.get("request")
        images = obj.images.all()
        return [
            {
                "id": image.id,
                "image_url": request.build_absolute_uri(image.image.url) if request else image.image.url,
                "alt_text": image.alt_text,
                "is_primary": image.is_primary,
                "sort_order": image.sort_order,
                "created_at": image.created_at.isoformat(),
            }
            for image in images
        ]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("قیمت نمی‌تواند منفی باشد.")
        return value

    def validate_discount_price(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("قیمت تخفیف نمی‌تواند منفی باشد.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("موجودی نمی‌تواند منفی باشد.")
        return value

    def validate_low_stock_threshold(self, value):
        if value < 0:
            raise serializers.ValidationError("حد هشدار موجودی نمی‌تواند منفی باشد.")
        return value

    def validate(self, attrs):
        price = attrs.get("price", getattr(self.instance, "price", None))
        discount_price = attrs.get("discount_price", getattr(self.instance, "discount_price", None))
        discount_starts_at = attrs.get("discount_starts_at", getattr(self.instance, "discount_starts_at", None))
        discount_ends_at = attrs.get("discount_ends_at", getattr(self.instance, "discount_ends_at", None))

        if discount_price is not None and price is not None and discount_price > price:
            raise serializers.ValidationError({"discount_price": "قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد."})
        if discount_starts_at and discount_ends_at and discount_starts_at > discount_ends_at:
            raise serializers.ValidationError({"discount_ends_at": "تاریخ پایان تخفیف باید بعد از تاریخ شروع باشد."})

        return attrs

    def create(self, validated_data):
        product = super().create(validated_data)
        self._record_inventory_change(product, 0, product.stock_quantity, InventoryChange.ChangeType.ADJUSTMENT, "ایجاد محصول")
        return product

    def update(self, instance, validated_data):
        previous_quantity = instance.stock_quantity
        product = super().update(instance, validated_data)

        if "stock_quantity" in validated_data and previous_quantity != product.stock_quantity:
            if product.stock_quantity > previous_quantity:
                change_type = InventoryChange.ChangeType.MANUAL_INCREASE
            elif product.stock_quantity < previous_quantity:
                change_type = InventoryChange.ChangeType.MANUAL_DECREASE
            else:
                change_type = InventoryChange.ChangeType.ADJUSTMENT

            self._record_inventory_change(
                product,
                previous_quantity,
                product.stock_quantity,
                change_type,
                "تغییر دستی موجودی در پنل مدیریت",
            )

        return product

    def _record_inventory_change(self, product, previous_quantity, new_quantity, change_type, note):
        request = self.context.get("request")
        changed_by = request.user if request and request.user.is_authenticated else None
        InventoryChange.objects.create(
            product=product,
            previous_quantity=previous_quantity,
            new_quantity=new_quantity,
            change_type=change_type,
            note=note,
            changed_by=changed_by,
        )


class AdminInventoryChangeSerializer(serializers.ModelSerializer):
    change_type_label = serializers.CharField(source="get_change_type_display", read_only=True)
    changed_by_label = serializers.SerializerMethodField()

    class Meta:
        model = InventoryChange
        fields = [
            "id",
            "previous_quantity",
            "new_quantity",
            "change_type",
            "change_type_label",
            "note",
            "changed_by",
            "changed_by_label",
            "created_at",
        ]
        read_only_fields = fields

    def get_changed_by_label(self, obj):
        if not obj.changed_by:
            return "سیستم"
        return obj.changed_by.get_full_name() or obj.changed_by.email
