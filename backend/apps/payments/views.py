from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    PaymentInitSerializer,
    PaymentMethodSerializer,
    PaymentSerializer,
)
from .services import PAYMENT_METHODS, initialize_payment


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
            )
        except ValidationError as error:
            return Response({"detail": error.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            PaymentSerializer(payment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
