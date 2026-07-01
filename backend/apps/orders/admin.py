from django.contrib import admin

from apps.accounts.services import notify_order_status_changed

from .models import Cart, CartItem, Order, OrderInternalNote, OrderItem, OrderStatusHistory


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
    can_delete = False
    readonly_fields = [
        "previous_status",
        "new_status",
        "title",
        "description",
        "visible_to_customer",
        "created_at",
        "created_by",
    ]
    fields = ["previous_status", "new_status", "title", "description", "visible_to_customer", "created_at", "created_by"]

    def has_add_permission(self, request, obj=None):
        return False


class OrderInternalNoteInline(admin.TabularInline):
    model = OrderInternalNote
    extra = 0
    readonly_fields = ["author", "created_at", "updated_at"]
    fields = ["text", "author", "created_at", "updated_at"]


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number",
        "receiver_name",
        "phone",
        "delivery_method",
        "shipping_provider",
        "shipping_tracking_code",
        "total_amount",
        "discount_amount",
        "status",
        "created_at",
    ]
    list_filter = ["status", "delivery_method", "created_at"]
    search_fields = ["order_number", "receiver_name", "phone", "shipping_tracking_code"]
    readonly_fields = [
        "order_number",
        "shipping_cost",
        "subtotal",
        "discount_amount",
        "total_amount",
        "created_at",
        "updated_at",
    ]
    inlines = [OrderItemInline, OrderInternalNoteInline, OrderStatusHistoryInline]
    fieldsets = (
        ("اطلاعات سفارش", {"fields": ("order_number", "user", "status", "notes")}),
        ("مشتری و آدرس", {"fields": ("receiver_name", "phone", "province", "city", "address", "postal_code")}),
        ("ارسال", {"fields": ("delivery_method", "shipping_provider", "shipping_tracking_code", "shipping_cost")}),
        ("مبالغ", {"fields": ("subtotal", "discount_amount", "coupon_code", "total_amount")}),
        ("زمان‌ها", {"fields": ("created_at", "updated_at")}),
    )

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
            notify_order_status_changed(
                obj,
                previous_status=previous_status,
                new_status=obj.status,
                actor=request.user,
            )

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for deleted_object in formset.deleted_objects:
            deleted_object.delete()
        for instance in instances:
            if isinstance(instance, OrderInternalNote) and not instance.author_id and request.user.is_authenticated:
                instance.author = request.user
            instance.save()
        formset.save_m2m()


@admin.register(OrderInternalNote)
class OrderInternalNoteAdmin(admin.ModelAdmin):
    list_display = ["order", "author", "created_at", "updated_at"]
    list_filter = ["created_at", "updated_at"]
    search_fields = ["order__order_number", "author__email", "text"]
    readonly_fields = ["created_at", "updated_at"]

    def save_model(self, request, obj, form, change):
        if not obj.author_id and request.user.is_authenticated:
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ["order", "previous_status", "new_status", "created_by", "created_at"]
    list_filter = ["new_status", "visible_to_customer", "created_at"]
    search_fields = ["order__order_number", "description", "created_by__email"]
    readonly_fields = [
        "order",
        "previous_status",
        "new_status",
        "title",
        "description",
        "visible_to_customer",
        "created_by",
        "created_at",
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
