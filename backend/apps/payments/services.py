from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from apps.orders.models import Order

from .models import Payment, PaymentStatusLog


PAYMENT_METHODS = [
    {
        "code": Payment.Method.IN_PERSON,
        "title": "پرداخت حضوری",
        "description": "پس از ثبت سفارش، برای هماهنگی زمان پرداخت و تحویل با شما تماس گرفته می‌شود. سفارش تا زمان تأیید پرداخت در وضعیت در انتظار پرداخت باقی می‌ماند.",
        "is_active": True,
        "requires_redirect": False,
    },
    {
        "code": Payment.Method.ONLINE_GATEWAY,
        "title": "پرداخت آنلاین",
        "description": "به‌زودی",
        "is_active": False,
        "requires_redirect": True,
    },
]


def get_active_payment_method(code):
    method = next((item for item in PAYMENT_METHODS if item["code"] == code), None)

    if not method:
        raise ValidationError("روش پرداخت معتبر نیست.")

    if not method["is_active"]:
        raise ValidationError("این روش پرداخت در حال حاضر فعال نیست.")

    return method


@transaction.atomic
def initialize_payment(order_id, method, user=None):
    payment_method = get_active_payment_method(method)
    order_queryset = Order.objects.select_for_update()

    if user and user.is_authenticated:
        order_queryset = order_queryset.filter(user=user)

    try:
        order = order_queryset.get(id=order_id)
    except Order.DoesNotExist as exc:
        raise ValidationError("سفارش پیدا نشد.") from exc

    active_payment = Payment.objects.filter(
        order=order,
        status=Payment.Status.PENDING,
    ).first()

    if active_payment:
        return active_payment, payment_method

    payment = Payment.objects.create(
        order=order,
        amount=order.total_amount,
        method=method,
        provider=Payment.Provider.MANUAL,
        status=Payment.Status.PENDING,
    )

    return payment, payment_method


@transaction.atomic
def mark_payment_as_paid(payment_id, actor=None):
    try:
        payment = Payment.objects.select_for_update().select_related("order").get(id=payment_id)
    except Payment.DoesNotExist as exc:
        raise ValidationError("پرداخت پیدا نشد.") from exc

    if payment.status == Payment.Status.PAID:
        raise ValidationError("این پرداخت قبلاً تایید شده است.")

    if payment.status != Payment.Status.PENDING:
        raise ValidationError("فقط پرداخت‌های در انتظار پرداخت قابل تایید هستند.")

    previous_status = payment.status
    payment.status = Payment.Status.PAID
    payment.paid_at = timezone.now()
    payment.save(update_fields=["status", "paid_at", "updated_at"])

    order = payment.order
    order.status = Order.Status.PAID
    order.save(update_fields=["status", "updated_at"])

    PaymentStatusLog.objects.create(
        payment=payment,
        actor=actor if actor and actor.is_authenticated else None,
        from_status=previous_status,
        to_status=Payment.Status.PAID,
        note="تایید پرداخت حضوری از طریق پنل مدیریت",
    )

    return payment
