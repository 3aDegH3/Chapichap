from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "title",
            "slug",
            "description",
        ]


def get_absolute_image_url(request, image_field):
    if not image_field:
        return None

    if request:
        return request.build_absolute_uri(image_field.url)

    return image_field.url


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            "id",
            "image",
            "image_url",
            "alt_text",
            "is_primary",
            "sort_order",
        ]

    def get_image_url(self, obj):
        return get_absolute_image_url(self.context.get("request"), obj.image)


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()
    product_type_label = serializers.CharField(source="get_product_type_display", read_only=True)
    gift_usage_label = serializers.CharField(source="get_gift_usage_display", read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    effective_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    has_active_discount = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "category",
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
            "is_active",
            "created_at",
        ]

    def get_image_url(self, obj):
        return get_absolute_image_url(self.context.get("request"), obj.image)


class ProductDetailSerializer(ProductSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    related_products = serializers.SerializerMethodField()

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + [
            "images",
            "related_products",
        ]

    def get_related_products(self, obj):
        if not obj.category_id:
            return []

        products = (
            Product.objects.select_related("category")
            .filter(category_id=obj.category_id, is_active=True)
            .exclude(id=obj.id)[:4]
        )

        return ProductSerializer(
            products,
            many=True,
            context=self.context,
        ).data
