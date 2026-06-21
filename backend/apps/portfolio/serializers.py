from rest_framework import serializers

from .models import Portfolio, PortfolioImage


def get_absolute_image_url(request, image_field):
    if not image_field:
        return None

    if request:
        return request.build_absolute_uri(image_field.url)

    return image_field.url


class PortfolioImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioImage
        fields = [
            "id",
            "image",
            "image_url",
            "alt_text",
            "sort_order",
        ]

    def get_image_url(self, obj):
        return get_absolute_image_url(self.context.get("request"), obj.image)


class PortfolioSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    work_type_label = serializers.CharField(source="get_work_type_display", read_only=True)

    class Meta:
        model = Portfolio
        fields = [
            "id",
            "title",
            "slug",
            "work_type",
            "work_type_label",
            "client_name",
            "short_description",
            "description",
            "cover_image",
            "cover_image_url",
            "is_featured",
            "completed_at",
            "created_at",
        ]

    def get_cover_image_url(self, obj):
        return get_absolute_image_url(self.context.get("request"), obj.cover_image)


class PortfolioDetailSerializer(PortfolioSerializer):
    images = PortfolioImageSerializer(many=True, read_only=True)
    related_items = serializers.SerializerMethodField()

    class Meta(PortfolioSerializer.Meta):
        fields = PortfolioSerializer.Meta.fields + [
            "images",
            "related_items",
        ]

    def get_related_items(self, obj):
        items = (
            Portfolio.objects.filter(work_type=obj.work_type, is_active=True)
            .exclude(id=obj.id)[:4]
        )

        return PortfolioSerializer(
            items,
            many=True,
            context=self.context,
        ).data
