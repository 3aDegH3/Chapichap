from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Order


class OrderIdempotencyOwnershipTests(TestCase):
    def create_client(self):
        client = APIClient()
        session = client.session
        session.save()
        return client, session.session_key

    def create_order(self, session_key, idempotency_key):
        return Order.objects.create(
            order_number="ORDER-IDEMPOTENCY",
            idempotency_key=idempotency_key,
            session_key=session_key,
            receiver_name="کاربر تست",
            phone="09120000000",
            province="تهران",
            city="تهران",
            address="آدرس کامل کاربر برای ثبت سفارش",
            postal_code="1234567890",
            shipping_cost=Decimal("0"),
            subtotal=Decimal("100000"),
            total_amount=Decimal("100000"),
        )

    def valid_payload(self, idempotency_key):
        return {
            "idempotency_key": idempotency_key,
            "receiver_name": "کاربر مهاجم",
            "phone": "09121111111",
            "province": "تهران",
            "city": "تهران",
            "address": "آدرس کامل کاربر دیگر برای سفارش",
            "postal_code": "1234567890",
            "delivery_method": Order.DeliveryMethod.PICKUP,
            "items": [],
        }

    def test_idempotency_key_cannot_be_reused_across_sessions(self):
        _owner_client, owner_session = self.create_client()
        attacker_client, _attacker_session = self.create_client()
        key = "shared-idempotency-key"
        self.create_order(owner_session, key)

        response = attacker_client.post(
            reverse("order-list-create"),
            self.valid_payload(key),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 1)

    def test_same_session_receives_existing_order(self):
        owner_client, owner_session = self.create_client()
        key = "owner-idempotency-key"
        order = self.create_order(owner_session, key)

        response = owner_client.post(
            reverse("order-list-create"),
            self.valid_payload(key),
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], order.id)
        self.assertEqual(Order.objects.count(), 1)
