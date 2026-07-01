from django.urls import path

from .views import (
    MockPaymentCallbackAPIView,
    PaymentDetailAPIView,
    PaymentInitAPIView,
    PaymentMethodsAPIView,
)

urlpatterns = [
    path("payment-methods/", PaymentMethodsAPIView.as_view(), name="payment-methods"),
    path("payments/init/", PaymentInitAPIView.as_view(), name="payment-init"),
    path("payments/<int:pk>/", PaymentDetailAPIView.as_view(), name="payment-detail"),
    path("payments/mock/callback/", MockPaymentCallbackAPIView.as_view(), name="payment-mock-callback"),
]
