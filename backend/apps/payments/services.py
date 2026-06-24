from dataclasses import dataclass
from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.orders.models import Order, OrderStatusHistory

from .models import Payment, PaymentStatusLog, Transaction


PAYMENT_METHODS = [
    {
        "code": Payment.Method.IN_PERSON,
        "title": "پرداخت حضوری",
        "description": "سفارش بدون پرداخت آنلاین ثبت می‌شود و تیم چاپی چاپ برای هماهنگی پرداخت و ادامه فرایند با شما تماس می‌گیرد.",
        "is_active": True,
        "requires_redirect": False,
    },
    {
        "code": Payment.Method.ONLINE_GATEWAY,
        "title": "پرداخت آنلاین آزمایشی",
        "description": "درگاه آزمایشی برای شبیه‌سازی پرداخت موفق یا ناموفق.",
        "is_active": True,
        "requires_redirect": True,
    },
    {
        "code": Payment.Method.BANK_TRANSFER,
        "title": "انتقال بانکی",
        "description": "ساختار این روش آماده است و پس از تعیین اطلاعات حساب فعال می‌شود.",
        "is_active": False,
        "requires_redirect": False,
    },
    {
        "code": Payment.Method.CASH_ON_DELIVERY,
        "title": "پرداخت هنگام تحویل",
        "description": "این روش پس از مشخص‌شدن شرایط تحویل فعال می‌شود.",
        "is_active": False,
        "requires_redirect": False,
    },
]


TERMINAL_STATUSES = {
    Transaction.Status.SUCCESSFUL,
    Transaction.Status.FAILED,
    Transaction.Status.CANCELED,
    Transaction.Status.EXPIRED,
}


@dataclass(frozen=True)
class GatewayStartResult:
    gateway_reference: str
    tracking_code: str
    redirect_url: str
    raw_response: dict


@dataclass(frozen=True)
class GatewayVerifyResult:
    status: str
    receipt_number: str
    tracking_code: str
    failure_reason: str
    raw_response: dict


class BasePaymentGateway:
    code = "base"

    def start_payment(self, transaction_obj):
        raise NotImplementedError

    def verify_callback(self, transaction_obj, callback_data):
        raise NotImplementedError


class MockPaymentGateway(BasePaymentGateway):
    code = "mock"

    def start_payment(self, transaction_obj):
        gateway_reference = transaction_obj.gateway_reference or f"MOCK-{uuid4().hex[:12].upper()}"
        tracking_code = transaction_obj.tracking_code or f"TRK-{uuid4().hex[:10].upper()}"

        return GatewayStartResult(
            gateway_reference=gateway_reference,
            tracking_code=tracking_code,
            redirect_url=f"/payment/mock?transaction={transaction_obj.id}&reference={gateway_reference}",
            raw_response={
                "gateway": self.code,
                "reference": gateway_reference,
                "tracking_code": tracking_code,
            },
        )

    def verify_callback(self, transaction_obj, callback_data):
        requested_status = callback_data.get("status") or Transaction.Status.SUCCESSFUL
        if requested_status not in TERMINAL_STATUSES:
            raise ValidationError("وضعیت callback معتبر نیست.")

        is_successful = requested_status == Transaction.Status.SUCCESSFUL
        receipt_number = (
            transaction_obj.receipt_number
            or (f"RCPT-{uuid4().hex[:12].upper()}" if is_successful else "")
        )

        return GatewayVerifyResult(
            status=requested_status,
            receipt_number=receipt_number,
            tracking_code=transaction_obj.tracking_code or f"TRK-{uuid4().hex[:10].upper()}",
            failure_reason="" if is_successful else "پرداخت آزمایشی ناموفق شبیه‌سازی شد.",
            raw_response={
                "gateway": self.code,
                "reference": transaction_obj.gateway_reference,
                "status": requested_status,
                "receipt_number": receipt_number,
            },
        )


class RealPaymentGateway(BasePaymentGateway):
    code = "real"

    def start_payment(self, transaction_obj):
        raise ValidationError("درگاه واقعی هنوز به سیستم متصل نشده است.")

    def verify_callback(self, transaction_obj, callback_data):
        raise ValidationError("درگاه واقعی هنوز به سیستم متصل نشده است.")


def get_gateway(code):
    if code == MockPaymentGateway.code:
        return MockPaymentGateway()
    if code == RealPaymentGateway.code:
        return RealPaymentGateway()
    raise ValidationError("درگاه پرداخت معتبر نیست.")


def get_active_payment_method(code):
    method = next((item for item in PAYMENT_METHODS if item["code"] == code), None)

    if not method:
        raise ValidationError("روش پرداخت معتبر نیست.")

    if not method["is_active"]:
        raise ValidationError("این روش پرداخت در حال حاضر فعال نیست.")

    return method


def get_order_for_payment(order_id, user=None):
    order_queryset = Order.objects.select_for_update()
    if user and user.is_authenticated:
        order_queryset = order_queryset.filter(user=user)

    try:
        return order_queryset.get(id=order_id)
    except Order.DoesNotExist as exc:
        raise ValidationError("سفارش پیدا نشد.") from exc


def get_successful_payment(order):
    return Payment.objects.filter(order=order, status=Payment.Status.SUCCESSFUL).first()


def get_or_create_payment(order, method, provider):
    successful_payment = get_successful_payment(order)
    if successful_payment:
        return successful_payment, False

    payment = (
        Payment.objects.select_for_update()
        .filter(order=order, method=method)
        .filter(~Q(status=Payment.Status.SUCCESSFUL))
        .order_by("-created_at")
        .first()
    )

    if payment:
        if payment.status in {Payment.Status.FAILED, Payment.Status.CANCELED, Payment.Status.EXPIRED}:
            payment.status = Payment.Status.PENDING
            payment.failure_reason = ""
            payment.save(update_fields=["status", "failure_reason", "updated_at"])
        return payment, False

    payment = Payment.objects.create(
        order=order,
        order_number=order.order_number,
        amount=order.total_amount,
        method=method,
        provider=provider,
        status=Payment.Status.PENDING,
    )
    return payment, True


def create_payment_log(payment, previous_status, note, actor=None):
    if previous_status == payment.status:
        return

    PaymentStatusLog.objects.create(
        payment=payment,
        actor=actor if actor and actor.is_authenticated else None,
        from_status=previous_status,
        to_status=payment.status,
        note=note,
    )


def mark_order_as_paid(order, user=None):
    previous_order_status = order.status
    if order.status in {Order.Status.REGISTERED, Order.Status.REVIEWING}:
        order.status = Order.Status.REVIEWING
        order.save(update_fields=["status", "updated_at"])

    if previous_order_status != order.status:
        OrderStatusHistory.objects.create(
            order=order,
            previous_status=previous_order_status,
            new_status=order.status,
            title=order.get_status_display(),
            description="پرداخت سفارش تأیید شد و سفارش برای بررسی اولیه وارد مرحله بعد شد.",
            visible_to_customer=True,
            created_by=user if user and user.is_authenticated else None,
        )


def start_gateway_transaction(payment, idempotency_key=""):
    if idempotency_key:
        transaction_obj = Transaction.objects.filter(idempotency_key=idempotency_key).first()
        if transaction_obj:
            if transaction_obj.payment_id != payment.id:
                raise ValidationError("کلید idempotency برای این پرداخت معتبر نیست.")
            return transaction_obj

    transaction_obj = (
        Transaction.objects.select_for_update()
        .filter(payment=payment, status=Transaction.Status.PENDING)
        .order_by("-created_at")
        .first()
    )

    if not transaction_obj:
        transaction_obj = Transaction.objects.create(
            payment=payment,
            order_number=payment.order_number or payment.order.order_number,
            amount=payment.amount,
            gateway=MockPaymentGateway.code,
            status=Transaction.Status.PENDING,
            idempotency_key=idempotency_key or None,
        )

    if not transaction_obj.gateway_reference:
        gateway = get_gateway(transaction_obj.gateway)
        start_result = gateway.start_payment(transaction_obj)
        transaction_obj.gateway_reference = start_result.gateway_reference
        transaction_obj.tracking_code = start_result.tracking_code
        transaction_obj.response_payload = start_result.raw_response
        transaction_obj.save(
            update_fields=[
                "gateway_reference",
                "tracking_code",
                "response_payload",
                "updated_at",
            ]
        )

    return transaction_obj


@transaction.atomic
def initialize_payment(order_id, method, user=None, idempotency_key=""):
    payment_method = get_active_payment_method(method)
    order = get_order_for_payment(order_id, user=user)

    if method == Payment.Method.IN_PERSON:
        payment, _created = get_or_create_payment(order, method, Payment.Provider.MANUAL)
        return payment, payment_method

    if method == Payment.Method.ONLINE_GATEWAY:
        payment, _created = get_or_create_payment(order, method, Payment.Provider.MOCK)
        if payment.status != Payment.Status.SUCCESSFUL:
            start_gateway_transaction(payment, idempotency_key=idempotency_key)
        return payment, payment_method

    raise ValidationError("این روش پرداخت هنوز پیاده‌سازی نشده است.")


@transaction.atomic
def handle_mock_callback(transaction_id, status, user=None):
    try:
        transaction_obj = (
            Transaction.objects.select_for_update()
            .select_related("payment", "payment__order")
            .get(id=transaction_id, gateway=MockPaymentGateway.code)
        )
    except Transaction.DoesNotExist as exc:
        raise ValidationError("تراکنش پیدا نشد.") from exc

    payment = Payment.objects.select_for_update().select_related("order").get(id=transaction_obj.payment_id)

    if transaction_obj.status in TERMINAL_STATUSES:
        return payment, transaction_obj

    gateway = get_gateway(transaction_obj.gateway)
    verify_result = gateway.verify_callback(transaction_obj, {"status": status})
    now = timezone.now()

    transaction_obj.status = verify_result.status
    transaction_obj.receipt_number = verify_result.receipt_number
    transaction_obj.tracking_code = verify_result.tracking_code
    transaction_obj.failure_reason = verify_result.failure_reason
    transaction_obj.response_payload = verify_result.raw_response
    transaction_obj.completed_at = now
    transaction_obj.save(
        update_fields=[
            "status",
            "receipt_number",
            "tracking_code",
            "failure_reason",
            "response_payload",
            "completed_at",
            "updated_at",
        ]
    )

    previous_payment_status = payment.status
    if payment.status == Payment.Status.SUCCESSFUL:
        return payment, transaction_obj

    payment.status = verify_result.status
    payment.provider_reference = transaction_obj.gateway_reference
    payment.tracking_code = transaction_obj.tracking_code
    payment.receipt_number = transaction_obj.receipt_number
    payment.failure_reason = verify_result.failure_reason
    if verify_result.status == Payment.Status.SUCCESSFUL:
        payment.paid_at = now
    payment.save(
        update_fields=[
            "status",
            "provider_reference",
            "tracking_code",
            "receipt_number",
            "failure_reason",
            "paid_at",
            "updated_at",
        ]
    )

    create_payment_log(
        payment,
        previous_payment_status,
        "callback درگاه آزمایشی پردازش شد.",
        actor=user,
    )

    if payment.status == Payment.Status.SUCCESSFUL:
        mark_order_as_paid(payment.order, user=user)

    return payment, transaction_obj


@transaction.atomic
def mark_payment_as_paid(payment_id, actor=None):
    try:
        payment = Payment.objects.select_for_update().select_related("order").get(id=payment_id)
    except Payment.DoesNotExist as exc:
        raise ValidationError("پرداخت پیدا نشد.") from exc

    if payment.status == Payment.Status.SUCCESSFUL:
        raise ValidationError("این پرداخت قبلاً تایید شده است.")

    if payment.status != Payment.Status.PENDING:
        raise ValidationError("فقط پرداخت‌های در انتظار پرداخت قابل تایید هستند.")

    previous_status = payment.status
    payment.status = Payment.Status.SUCCESSFUL
    payment.paid_at = timezone.now()
    payment.receipt_number = payment.receipt_number or f"MANUAL-{uuid4().hex[:10].upper()}"
    payment.tracking_code = payment.tracking_code or payment.receipt_number
    payment.save(update_fields=["status", "paid_at", "receipt_number", "tracking_code", "updated_at"])

    create_payment_log(
        payment,
        previous_status,
        "تایید پرداخت حضوری از طریق پنل مدیریت",
        actor=actor,
    )
    mark_order_as_paid(payment.order, user=actor)

    return payment
