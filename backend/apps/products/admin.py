from django.contrib import admin

from .models import Category, InventoryChange, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "parent", "slug", "sort_order", "is_active", "created_at")
    list_filter = ("is_active", "parent")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "description")
    fieldsets = (
        ("اطلاعات اصلی", {"fields": ("title", "slug", "description", "parent", "image")}),
        ("نمایش", {"fields": ("sort_order", "is_active")}),
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "product_type", "gift_usage", "price", "discount_price", "stock_quantity", "unlimited_stock", "low_stock_threshold", "is_active", "created_at")
    list_filter = ("category", "product_type", "gift_usage", "unlimited_stock", "is_active")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "short_description", "description", "material", "dimensions")
    fieldsets = (
        ("اطلاعات اصلی", {"fields": ("category", "title", "slug", "short_description", "description", "image", "is_active")}),
        ("قیمت و تخفیف", {"fields": ("price", "discount_price", "discount_starts_at", "discount_ends_at")}),
        ("خرید و فیلتر", {"fields": ("product_type", "gift_usage", "stock_quantity", "unlimited_stock", "low_stock_threshold", "preparation_time")}),
        ("جزئیات چاپ", {"fields": ("material", "dimensions", "size_guide", "print_file_guide")}),
    )
    inlines = []


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ("image", "alt_text", "is_primary", "sort_order")


ProductAdmin.inlines = [ProductImageInline]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("product", "alt_text", "is_primary", "sort_order", "created_at")
    list_filter = ("is_primary", "product__category")
    search_fields = ("product__title", "alt_text")


@admin.register(InventoryChange)
class InventoryChangeAdmin(admin.ModelAdmin):
    list_display = ("product", "previous_quantity", "new_quantity", "change_type", "changed_by", "created_at")
    list_filter = ("change_type", "created_at")
    search_fields = ("product__title", "note", "changed_by__email")
    readonly_fields = ("product", "previous_quantity", "new_quantity", "change_type", "note", "changed_by", "created_at")
