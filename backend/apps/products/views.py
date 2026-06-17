from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product
from .serializers import ProductSerializer


class ProductListAPIView(ListAPIView):
    serializer_class = ProductSerializer

    
    def get_queryset(self):
        return Product.objects.filter(is_active=True)

    
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    
    filterset_fields = {
        "is_active": ["exact"],
        "price": ["gte", "lte"],  
    }

    
    search_fields = [
        "title",
        "description",
    ]

    
    ordering_fields = [
        "price",
        "created_at",
        "title",
    ]

    ordering = ["-created_at"]  