from django.urls import path

from .views import PaymentInitAPIView, PaymentMethodsAPIView

urlpatterns = [
    path("payment-methods/", PaymentMethodsAPIView.as_view(), name="payment-methods"),
    path("payments/init/", PaymentInitAPIView.as_view(), name="payment-init"),
]
