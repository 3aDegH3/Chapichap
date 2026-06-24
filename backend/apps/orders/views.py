from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.products.models import Product

from .models import Cart, CartItem, Order
from .serializers import (
    CartSerializer,
    CheckoutPreviewRequestSerializer,
    CheckoutPreviewSerializer,
    OrderCreateSerializer,
    OrderSerializer,
)
from .services import calculate_checkout_preview, create_order_from_cart


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


def parse_cart_payload_items(raw_items):
    parsed_items = {}

    for item in raw_items or []:
        try:
            product_id = int(item.get("product_id"))
        except (AttributeError, TypeError, ValueError):
            continue

        quantity = parse_positive_int(item.get("quantity", 1))
        parsed_items[product_id] = parsed_items.get(product_id, 0) + quantity

    return parsed_items


def sync_cart_from_payload(cart, raw_items):
    parsed_items = parse_cart_payload_items(raw_items)
    if not parsed_items:
        return cart

    products = {
        product.id: product
        for product in Product.objects.filter(id__in=parsed_items.keys(), is_active=True)
    }

    cart.items.exclude(product_id__in=products.keys()).delete()

    for product_id, quantity in parsed_items.items():
        product = products.get(product_id)
        if not product:
            continue

        CartItem.objects.update_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

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


class CheckoutPreviewAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CheckoutPreviewRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_or_create_cart(request)
        sync_cart_from_payload(cart, serializer.validated_data.get("items"))

        try:
            preview = calculate_checkout_preview(
                cart,
                delivery_method=serializer.validated_data["delivery_method"],
            )
        except ValidationError as error:
            return Response({"detail": error.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(CheckoutPreviewSerializer(preview, context={"request": request}).data)


def get_order_queryset_for_request(request):
    queryset = Order.objects.prefetch_related("items", "payments", "status_history")

    if request.user.is_authenticated:
        return queryset.filter(user=request.user)

    if not request.session.session_key:
        return queryset.none()

    return queryset.filter(session_key=request.session.session_key)


class OrderListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = get_order_queryset_for_request(request)
        return Response(
            OrderSerializer(queryset, many=True, context={"request": request}).data
        )

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        idempotency_key = (serializer.validated_data.get("idempotency_key") or "").strip()

        if idempotency_key:
            existing_order_queryset = Order.objects.filter(idempotency_key=idempotency_key)
            if request.user.is_authenticated:
                existing_order_queryset = existing_order_queryset.filter(user=request.user)
            elif request.session.session_key:
                existing_order_queryset = existing_order_queryset.filter(
                    session_key=request.session.session_key
                )
            else:
                existing_order_queryset = existing_order_queryset.none()

            existing_order = existing_order_queryset.first()
            if existing_order:
                return Response(
                    OrderSerializer(existing_order, context={"request": request}).data,
                    status=status.HTTP_200_OK,
                )

        cart = get_or_create_cart(request)
        sync_cart_from_payload(cart, serializer.validated_data.get("items"))

        try:
            order = create_order_from_cart(
                cart,
                serializer.validated_data,
                user=request.user,
            )
        except ValidationError as error:
            return Response({"detail": error.message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            OrderSerializer(order, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        order = get_object_or_404(get_order_queryset_for_request(request), pk=pk)
        return Response(OrderSerializer(order, context={"request": request}).data)
