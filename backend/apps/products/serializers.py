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
