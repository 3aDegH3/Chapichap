from decimal import Decimal
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from .models import Order, OrderItem


class DeliveryMethod:
    SHIPPING = "SHIPPING"
    PICKUP = "PICKUP"


DELIVERY_METHODS = {
    DeliveryMethod.SHIPPING: {
        "title": "ارسال به آدرس",
        "shipping_cost": Decimal("50000.00"),
    },
    DeliveryMethod.PICKUP: {
        "title": "تحویل حضوری",
        "shipping_cost": Decimal("0.00"),
    },
}


def calculate_checkout_preview(cart, delivery_method=DeliveryMethod.SHIPPING):
    delivery_method = delivery_method or DeliveryMethod.SHIPPING

    if delivery_method not in DELIVERY_METHODS:
        raise ValidationError("روش تحویل معتبر نیست.")

    cart_items = list(cart.items.select_related("product").all())
    if not cart_items:
        raise ValidationError("سبد خرید خالی است.")

    preview_items = []
    subtotal = Decimal("0.00")

    for cart_item in cart_items:
        product = cart_item.product
        if not product.is_active:
            raise ValidationError(f"محصول «{product.title}» در حال حاضر قابل سفارش نیست.")

        unit_price = product.price
        line_total = unit_price * cart_item.quantity
        subtotal += line_total

        preview_items.append(
            {
                "product_id": product.id,
                "title": product.title,
                "slug": product.slug,
                "image": product.image,
                "unit_price": unit_price,
                "quantity": cart_item.quantity,
                "line_total": line_total,
            }
        )

    shipping_cost = DELIVERY_METHODS[delivery_method]["shipping_cost"]
    total_amount = subtotal + shipping_cost

    return {
        "items": preview_items,
        "subtotal": subtotal,
        "shipping_cost": shipping_cost,
        "total_amount": total_amount,
        "delivery_method": delivery_method,
        "delivery_method_title": DELIVERY_METHODS[delivery_method]["title"],
        "total_quantity": sum(item["quantity"] for item in preview_items),
    }


def generate_order_number():
    date_part = timezone.now().strftime("%Y%m%d")

    while True:
        random_part = uuid4().hex[:8].upper()
        order_number = f"CH-{date_part}-{random_part}"

        if not Order.objects.filter(order_number=order_number).exists():
            return order_number


@transaction.atomic
def create_order_from_cart(cart, checkout_data, user=None):
    locked_cart = cart.__class__.objects.select_for_update().get(id=cart.id)
    preview = calculate_checkout_preview(
        locked_cart,
        delivery_method=checkout_data["delivery_method"],
    )

    order = Order.objects.create(
        order_number=generate_order_number(),
        user=user if user and user.is_authenticated else None,
        session_key=locked_cart.session_key,
        receiver_name=checkout_data["receiver_name"],
        phone=checkout_data["phone"],
        province=checkout_data["province"],
        city=checkout_data["city"],
        address=checkout_data["address"],
        postal_code=checkout_data["postal_code"],
        delivery_method=preview["delivery_method"],
        shipping_cost=preview["shipping_cost"],
        subtotal=preview["subtotal"],
        total_amount=preview["total_amount"],
        status=Order.Status.PENDING_PAYMENT,
        notes=checkout_data.get("notes", ""),
    )

    order_items = []
    for item in preview["items"]:
        image = item["image"]
        order_items.append(
            OrderItem(
                order=order,
                product_id=item["product_id"],
                product_title=item["title"],
                product_image=image.url if image else "",
                unit_price=item["unit_price"],
                quantity=item["quantity"],
                line_total=item["line_total"],
                selected_options={},
            )
        )

    OrderItem.objects.bulk_create(order_items)
    locked_cart.items.all().delete()

    return order
