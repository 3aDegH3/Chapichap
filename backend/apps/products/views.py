from rest_framework.generics import ListAPIView, RetrieveAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Category, Product
from .serializers import CategorySerializer, ProductDetailSerializer, ProductSerializer


class QuerySearchFilter(SearchFilter):
    search_param = "q"


class CategoryListAPIView(ListAPIView):
    serializer_class = CategorySerializer
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_active=True)


class ProductListAPIView(ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        return Product.objects.select_related("category").filter(is_active=True)

    filter_backends = [
        DjangoFilterBackend,
        QuerySearchFilter,
        OrderingFilter,
    ]

    filterset_fields = {
        "category": ["exact"],
        "category__slug": ["exact"],
        "product_type": ["exact"],
        "gift_usage": ["exact"],
        "price": ["gte", "lte"],
    }

    search_fields = [
        "title",
        "short_description",
        "description",
        "material",
        "dimensions",
    ]

    ordering_fields = [
        "price",
        "created_at",
        "title",
    ]

    ordering = ["-created_at"]


class ProductDetailAPIView(RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return (
            Product.objects.select_related("category")
            .prefetch_related("images")
            .filter(is_active=True)
        )


class ProductDetailByIdAPIView(ProductDetailAPIView):
    lookup_field = "pk"


class ProductSearchAPIView(ProductListAPIView):
    filter_backends = [
        DjangoFilterBackend,
        QuerySearchFilter,
        OrderingFilter,
    ]
