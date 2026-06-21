from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


def parse_positive_int(value, default=1):
    try:
        return max(1, int(value))
    except (TypeError, ValueError):
        return default


def get_or_create_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart

    if not request.session.session_key:
        request.session.create()

    cart, _ = Cart.objects.get_or_create(session_key=request.session.session_key)
    return cart


class CartAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        cart = get_or_create_cart(request)
        return Response(CartSerializer(cart, context={"request": request}).data)


class CartAddAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        product_id = request.data.get("product_id")
        quantity = parse_positive_int(request.data.get("quantity", 1))
        product = get_object_or_404(Product, id=product_id, is_active=True)
        cart = get_or_create_cart(request)

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        if not created:
            item.quantity += quantity
            item.save(update_fields=["quantity", "updated_at"])

        return Response(CartSerializer(cart, context={"request": request}).data, status=status.HTTP_200_OK)


class CartUpdateAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        product_id = request.data.get("product_id")
        try:
            quantity = int(request.data.get("quantity", 1))
        except (TypeError, ValueError):
            quantity = 1
        cart = get_or_create_cart(request)
        item = get_object_or_404(CartItem, cart=cart, product_id=product_id)

        if quantity <= 0:
            item.delete()
        else:
            item.quantity = quantity
            item.save(update_fields=["quantity", "updated_at"])

        return Response(CartSerializer(cart, context={"request": request}).data)


class CartRemoveAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        product_id = request.data.get("product_id")
        cart = get_or_create_cart(request)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart, context={"request": request}).data)
