from decimal import Decimal
from uuid import uuid4

from django.apps import apps
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from .models import Order, OrderItem, OrderStatusHistory


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


def resolve_checkout_address(checkout_data, user=None):
    data = checkout_data.copy()
    address_id = data.get("address_id")

    if not address_id:
        return data
    if not user or not user.is_authenticated:
        raise ValidationError("برای استفاده از آدرس ذخیره‌شده باید وارد حساب شوید.")

    CustomerAddress = apps.get_model("accounts", "CustomerAddress")
    address = CustomerAddress.objects.filter(user=user, id=address_id).first()
    if not address:
        raise ValidationError("آدرس انتخاب‌شده معتبر نیست.")

    data.update(
        {
            "receiver_name": address.receiver_name,
            "phone": address.phone,
            "province": address.province,
            "city": address.city,
            "address": address.address,
            "postal_code": address.postal_code,
        }
    )
    return data


def maybe_save_checkout_address(checkout_data, user=None):
    if not user or not user.is_authenticated:
        return
    if checkout_data.get("address_id") or not checkout_data.get("save_address"):
        return

    CustomerAddress = apps.get_model("accounts", "CustomerAddress")
    has_address = CustomerAddress.objects.filter(user=user).exists()
    CustomerAddress.objects.create(
        user=user,
        title=checkout_data.get("address_title") or "آدرس سفارش",
        receiver_name=checkout_data["receiver_name"],
        phone=checkout_data["phone"],
        province=checkout_data["province"],
        city=checkout_data["city"],
        address=checkout_data["address"],
        postal_code=checkout_data["postal_code"],
        notes=checkout_data.get("notes", ""),
        is_default=not has_address,
    )


def get_valid_offer(user, coupon_code, preview):
    coupon_code = (coupon_code or "").strip()
    if not coupon_code:
        return None, Decimal("0.00")
    if not user or not user.is_authenticated:
        raise ValidationError("برای استفاده از پیشنهاد اختصاصی باید وارد حساب شوید.")

    CustomerOffer = apps.get_model("accounts", "CustomerOffer")
    offer = CustomerOffer.objects.filter(user=user, coupon_code__iexact=coupon_code).first()
    if not offer or offer.status != "active":
        raise ValidationError("کد تخفیف معتبر نیست.")

    base_amount = preview["total_amount"]
    if base_amount < offer.minimum_order_amount:
        raise ValidationError("مبلغ سفارش برای این پیشنهاد کافی نیست.")

    discount = Decimal("0.00")
    if offer.discount_type == CustomerOffer.DiscountType.PERCENT:
        discount = (base_amount * offer.discount_value) / Decimal("100")
    elif offer.discount_type == CustomerOffer.DiscountType.FIXED:
        discount = offer.discount_value
    elif offer.discount_type == CustomerOffer.DiscountType.FREE_SHIPPING:
        discount = preview["shipping_cost"]

    return offer, min(base_amount, discount)


@transaction.atomic
def create_order_from_cart(cart, checkout_data, user=None):
    locked_cart = cart.__class__.objects.select_for_update().get(id=cart.id)
    checkout_data = resolve_checkout_address(checkout_data, user=user)
    preview = calculate_checkout_preview(
        locked_cart,
        delivery_method=checkout_data["delivery_method"],
    )
    offer, discount_amount = get_valid_offer(user, checkout_data.get("coupon_code"), preview)
    total_amount = max(preview["total_amount"] - discount_amount, Decimal("0.00"))

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
        discount_amount=discount_amount,
        coupon_code=(checkout_data.get("coupon_code") or "").strip(),
        total_amount=total_amount,
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
    OrderStatusHistory.objects.create(
        order=order,
        previous_status="",
        new_status=Order.Status.PENDING_PAYMENT,
        title="سفارش ثبت شد",
        description="سفارش شما ثبت شده و در انتظار پرداخت یا هماهنگی است.",
        visible_to_customer=True,
        created_by=user if user and user.is_authenticated else None,
    )
    if offer:
        offer.__class__.objects.filter(pk=offer.pk).update(usage_count=F("usage_count") + 1)
    maybe_save_checkout_address(checkout_data, user=user)
    locked_cart.items.all().delete()

    return order
