from django.urls import path
from .views import (
    CategoryListAPIView,
    ProductDetailAPIView,
    ProductDetailByIdAPIView,
    ProductListAPIView,
)

urlpatterns = [
    path("", ProductListAPIView.as_view(), name="product-list"),
    path("categories/", CategoryListAPIView.as_view(), name="category-list"),
    path("<int:pk>/", ProductDetailByIdAPIView.as_view(), name="product-detail-by-id"),
    path("<slug:slug>/", ProductDetailAPIView.as_view(), name="product-detail"),
]
