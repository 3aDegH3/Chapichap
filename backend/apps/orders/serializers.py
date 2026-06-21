from django.apps import apps
from rest_framework import serializers

from apps.products.serializers import ProductSerializer

from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory
from .services import DELIVERY_METHODS, DeliveryMethod


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_id",
            "quantity",
            "line_total",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_quantity = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_price",
            "total_quantity",
            "updated_at",
        ]


class CheckoutPreviewRequestSerializer(serializers.Serializer):
    delivery_method = serializers.ChoiceField(
        choices=[(key, value["title"]) for key, value in DELIVERY_METHODS.items()],
        default=DeliveryMethod.SHIPPING,
        required=False,
    )


class CheckoutPreviewItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    title = serializers.CharField()
    slug = serializers.SlugField()
    image_url = serializers.SerializerMethodField()
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    quantity = serializers.IntegerField()
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2)

    def get_image_url(self, obj):
        image = obj.get("image")
        if not image:
            return None

        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(image.url)
        return image.url


class CheckoutPreviewSerializer(serializers.Serializer):
    items = CheckoutPreviewItemSerializer(many=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    delivery_method = serializers.CharField()
    delivery_method_title = serializers.CharField()
    total_quantity = serializers.IntegerField()


class OrderItemSerializer(serializers.ModelSerializer):
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
        if request:
            return request.build_absolute_uri(obj.product_image)
        return obj.product_image


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    status_label = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = [
            "id",
            "previous_status",
            "new_status",
            "status_label",
            "title",
            "description",
            "visible_to_customer",
            "created_at",
        ]
        read_only_fields = fields

    def get_status_label(self, obj):
        return dict(Order.Status.choices).get(obj.new_status, obj.new_status)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = serializers.SerializerMethodField()
    payment = serializers.SerializerMethodField()
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    delivery_method_label = serializers.CharField(source="get_delivery_method_display", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "receiver_name",
            "phone",
            "province",
            "city",
            "address",
            "postal_code",
            "delivery_method",
            "delivery_method_label",
            "shipping_cost",
            "subtotal",
            "discount_amount",
            "coupon_code",
            "total_amount",
            "status",
            "status_label",
            "notes",
            "items",
            "status_history",
            "payment",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

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
            "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
            "created_at": payment.created_at.isoformat(),
        }

    def get_status_history(self, obj):
        history = obj.status_history.filter(visible_to_customer=True)
        return OrderStatusHistorySerializer(history, many=True).data


class OrderCreateSerializer(serializers.Serializer):
    address_id = serializers.IntegerField(required=False, allow_null=True)
    receiver_name = serializers.CharField(max_length=150, min_length=2, required=False)
    phone = serializers.RegexField(
        regex=r"^[0-9۰-۹٠-٩+\-()\s]{8,30}$",
        error_messages={"invalid": "شماره تماس معتبر وارد کن."},
        required=False,
    )
    province = serializers.CharField(max_length=80, min_length=2, required=False)
    city = serializers.CharField(max_length=80, min_length=2, required=False)
    address = serializers.CharField(min_length=10, required=False)
    postal_code = serializers.RegexField(
        regex=r"^[0-9۰-۹٠-٩]{10}$",
        error_messages={"invalid": "کد پستی باید ۱۰ رقم باشد."},
        required=False,
    )
    delivery_method = serializers.ChoiceField(choices=Order.DeliveryMethod.choices)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    save_address = serializers.BooleanField(required=False, default=False)
    address_title = serializers.CharField(required=False, allow_blank=True, max_length=120)
    coupon_code = serializers.CharField(required=False, allow_blank=True, max_length=60)

    def validate(self, attrs):
        request = self.context.get("request")
        address_id = attrs.get("address_id")

        if address_id:
            if not request or not request.user.is_authenticated:
                raise serializers.ValidationError({"address_id": "برای استفاده از آدرس ذخیره‌شده باید وارد حساب شوید."})

            CustomerAddress = apps.get_model("accounts", "CustomerAddress")
            if not CustomerAddress.objects.filter(user=request.user, id=address_id).exists():
                raise serializers.ValidationError({"address_id": "آدرس انتخاب‌شده معتبر نیست."})
            return attrs

        required_fields = ["receiver_name", "phone", "province", "city", "address", "postal_code"]
        missing_fields = [field for field in required_fields if not attrs.get(field)]
        if missing_fields:
            raise serializers.ValidationError({field: "این فیلد الزامی است." for field in missing_fields})

        return attrs
