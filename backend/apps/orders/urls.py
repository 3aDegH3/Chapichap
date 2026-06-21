from django.urls import path

from .views import CartAPIView, CartAddAPIView, CartRemoveAPIView, CartUpdateAPIView

urlpatterns = [
    path("cart/", CartAPIView.as_view(), name="cart"),
    path("cart/add/", CartAddAPIView.as_view(), name="cart-add"),
    path("cart/update/", CartUpdateAPIView.as_view(), name="cart-update"),
    path("cart/remove/", CartRemoveAPIView.as_view(), name="cart-remove"),
]
