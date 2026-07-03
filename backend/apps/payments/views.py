from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    MockPaymentCallbackSerializer,
    PaymentInitSerializer,
    PaymentMethodSerializer,
    PaymentSerializer,
)
from .models import Payment
from .services import PAYMENT_METHODS, handle_mock_callback, initialize_payment


class PaymentMethodsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(PaymentMethodSerializer(PAYMENT_METHODS, many=True).data)


class PaymentInitAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PaymentInitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment, _payment_method = initialize_payment(
                order_id=serializer.validated_data["order_id"],
                method=serializer.validated_data["method"],
                user=request.user,
                session_key=request.session.session_key or "",
                idempotency_key=serializer.validated_data.get("idempotency_key", ""),
            )
        except ValidationError as error:
            return Response({"detail": error.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            PaymentSerializer(payment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PaymentDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        queryset = Payment.objects.select_related("order").prefetch_related("transactions")
        if request.user.is_authenticated:
            queryset = queryset.filter(order__user=request.user)
        else:
            session_key = request.session.session_key
            queryset = queryset.filter(order__session_key=session_key) if session_key else queryset.none()

        try:
            payment = queryset.get(pk=pk)
        except Payment.DoesNotExist:
            return Response({"detail": "پرداخت پیدا نشد."}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment, context={"request": request}).data)


class MockPaymentCallbackAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MockPaymentCallbackSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment, _transaction = handle_mock_callback(
                transaction_id=serializer.validated_data["transaction_id"],
                status=serializer.validated_data["status"],
                user=request.user,
                session_key=request.session.session_key or "",
            )
        except ValidationError as error:
            return Response({"detail": error.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PaymentSerializer(payment, context={"request": request}).data)
