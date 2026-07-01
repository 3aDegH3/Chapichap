from django.urls import path

from .views import (
    CartAPIView,
    CartAddAPIView,
    CartRemoveAPIView,
    CartUpdateAPIView,
    CheckoutPreviewAPIView,
    OrderDetailAPIView,
    OrderListCreateAPIView,
)

urlpatterns = [
    path("cart/", CartAPIView.as_view(), name="cart"),
    path("cart/add/", CartAddAPIView.as_view(), name="cart-add"),
    path("cart/update/", CartUpdateAPIView.as_view(), name="cart-update"),
    path("cart/remove/", CartRemoveAPIView.as_view(), name="cart-remove"),
    path("checkout/preview/", CheckoutPreviewAPIView.as_view(), name="checkout-preview"),
    path("orders/", OrderListCreateAPIView.as_view(), name="order-list-create"),
    path("orders/<int:pk>/", OrderDetailAPIView.as_view(), name="order-detail"),
]
