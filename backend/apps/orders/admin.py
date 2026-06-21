from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, OrderStatusHistory


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ["created_at", "updated_at"]


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "session_key", "total_quantity", "total_price", "updated_at"]
    search_fields = ["user__email", "session_key"]
    inlines = [CartItemInline]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "product",
        "product_title",
        "product_image",
        "unit_price",
        "quantity",
        "line_total",
        "selected_options",
        "created_at",
    ]
    can_delete = False


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ["created_at", "created_by"]
    fields = ["previous_status", "new_status", "title", "description", "visible_to_customer", "created_at", "created_by"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "receiver_name",
        "phone",
        "delivery_method",
        "total_amount",
        "discount_amount",
        "status",
        "created_at",
    ]
    list_filter = ["status", "delivery_method", "created_at"]
    search_fields = ["order_number", "receiver_name", "phone"]
    readonly_fields = [
        "order_number",
        "shipping_cost",
        "subtotal",
        "discount_amount",
        "total_amount",
        "created_at",
        "updated_at",
    ]
    inlines = [OrderItemInline, OrderStatusHistoryInline]

    def save_model(self, request, obj, form, change):
        previous_status = None
        if change and obj.pk:
            previous_status = Order.objects.filter(pk=obj.pk).values_list("status", flat=True).first()

        super().save_model(request, obj, form, change)

        if previous_status and previous_status != obj.status:
            OrderStatusHistory.objects.create(
                order=obj,
                previous_status=previous_status,
                new_status=obj.status,
                title=obj.get_status_display(),
                description="وضعیت سفارش توسط مدیریت به‌روزرسانی شد.",
                visible_to_customer=True,
                created_by=request.user if request.user.is_authenticated else None,
            )
