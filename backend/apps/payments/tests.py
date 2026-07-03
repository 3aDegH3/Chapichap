from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from apps.orders.models import Order

from .models import Payment, Transaction


class PaymentOwnershipTests(TestCase):
    def create_client(self):
        client = APIClient()
        session = client.session
        session.save()
        return client, session.session_key

    def create_order(self, session_key):
        return Order.objects.create(
            order_number=f"ORDER-{Order.objects.count() + 1}",
            session_key=session_key,
            receiver_name="کاربر تست",
            phone="09120000000",
            province="تهران",
            city="تهران",
            address="آدرس کامل کاربر تست برای سفارش",
            postal_code="1234567890",
            shipping_cost=Decimal("0"),
            subtotal=Decimal("100000"),
            total_amount=Decimal("100000"),
        )

    def test_anonymous_user_cannot_initialize_payment_for_another_session(self):
        _owner_client, owner_session = self.create_client()
        attacker_client, _attacker_session = self.create_client()
        order = self.create_order(owner_session)

        response = attacker_client.post(
            reverse("payment-init"),
            {"order_id": order.id, "method": Payment.Method.ONLINE_GATEWAY},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Payment.objects.exists())

    def test_anonymous_user_cannot_complete_another_sessions_transaction(self):
        _owner_client, owner_session = self.create_client()
        attacker_client, _attacker_session = self.create_client()
        order = self.create_order(owner_session)
        payment = Payment.objects.create(
            order=order,
            order_number=order.order_number,
            amount=order.total_amount,
            method=Payment.Method.ONLINE_GATEWAY,
            provider=Payment.Provider.MOCK,
        )
        transaction = Transaction.objects.create(
            payment=payment,
            order_number=order.order_number,
            amount=order.total_amount,
            gateway="mock",
        )

        response = attacker_client.post(
            reverse("payment-mock-callback"),
            {"transaction_id": transaction.id, "status": Transaction.Status.SUCCESSFUL},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        transaction.refresh_from_db()
        payment.refresh_from_db()
        self.assertEqual(transaction.status, Transaction.Status.PENDING)
        self.assertEqual(payment.status, Payment.Status.PENDING)
