from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem


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


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "receiver_name",
        "phone",
        "delivery_method",
        "total_amount",
        "status",
        "created_at",
    ]
    list_filter = ["status", "delivery_method", "created_at"]
    search_fields = ["order_number", "receiver_name", "phone"]
    readonly_fields = [
        "order_number",
        "shipping_cost",
        "subtotal",
        "total_amount",
        "created_at",
        "updated_at",
    ]
    inlines = [OrderItemInline]
