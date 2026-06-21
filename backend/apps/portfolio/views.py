from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView, RetrieveAPIView

from .models import Portfolio
from .serializers import PortfolioDetailSerializer, PortfolioSerializer


class QuerySearchFilter(SearchFilter):
    search_param = "q"


class PortfolioListAPIView(ListAPIView):
    serializer_class = PortfolioSerializer

    filter_backends = [
        DjangoFilterBackend,
        QuerySearchFilter,
        OrderingFilter,
    ]

    filterset_fields = {
        "work_type": ["exact"],
        "is_featured": ["exact"],
    }

    search_fields = [
        "title",
        "short_description",
        "description",
        "client_name",
    ]

    ordering_fields = [
        "completed_at",
        "created_at",
        "title",
    ]

    ordering = ["-is_featured", "-completed_at", "-created_at"]

    def get_queryset(self):
        return Portfolio.objects.filter(is_active=True)


class PortfolioDetailAPIView(RetrieveAPIView):
    serializer_class = PortfolioDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return Portfolio.objects.prefetch_related("images").filter(is_active=True)


class PortfolioDetailByIdAPIView(PortfolioDetailAPIView):
    lookup_field = "pk"
