from decimal import Decimal

from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment
from apps.products.models import Product
from apps.reviews.models import Review
from apps.reviews.services import approve_review, create_review


class ReviewSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="pass12345",
            first_name="سارا",
        )
        self.other_user = User.objects.create_user(
            email="other@example.com",
            username="other",
            password="pass12345",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="pass12345",
            admin_role=User.AdminRole.PRODUCT_MANAGER,
            is_staff=True,
        )
        self.product = Product.objects.create(
            title="ماگ خاطره",
            slug="memory-mug",
            price=Decimal("250000"),
        )
        self.order = Order.objects.create(
            order_number="ORD-REV-1",
            user=self.user,
            receiver_name="سارا احمدی",
            phone="09120000000",
            province="تهران",
            city="تهران",
            address="خیابان نمونه",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=250000,
            total_amount=250000,
            status=Order.Status.REVIEWING,
        )
        self.order_item = OrderItem.objects.create(
            order=self.order,
            product=self.product,
            product_title=self.product.title,
            unit_price=250000,
            quantity=1,
            line_total=250000,
        )
        Payment.objects.create(
            order=self.order,
            amount=250000,
            method=Payment.Method.ONLINE_GATEWAY,
            status=Payment.Status.SUCCESSFUL,
        )

    def create_pending_review(self):
        return create_review(
            user=self.user,
            product=self.product,
            order_item_id=self.order_item.id,
            rating=5,
            title="کیفیت عالی",
            body="کیفیت چاپ و بسته‌بندی واقعاً عالی بود.",
        )

    def test_rating_database_constraint(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Review.objects.create(
                user=self.user,
                product=self.product,
                rating=6,
                body="متن نظر معتبر و کافی است.",
            )

    def test_create_review_is_pending_verified_and_sanitized(self):
        self.client.force_authenticate(self.user)
        response = self.client.post(
            f"/api/v1/products/{self.product.id}/reviews/",
            {
                "rating": 5,
                "title": "<b>کیفیت عالی</b>",
                "body": "<script>alert(1)</script> کیفیت چاپ عالی بود.",
                "order_item_id": self.order_item.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        review = Review.objects.get()
        self.assertEqual(review.status, Review.Status.PENDING)
        self.assertTrue(review.is_verified_purchase)
        self.assertNotIn("<", review.title)
        self.assertNotIn("<script>", review.body)

    def test_pending_review_is_not_public_and_approved_updates_summary_cache(self):
        review = self.create_pending_review()
        list_response = self.client.get(f"/api/v1/products/{self.product.slug}/reviews/")
        self.assertEqual(list_response.data["count"], 0)

        approve_review(review=review)
        self.product.refresh_from_db()
        self.assertEqual(self.product.approved_reviews_count, 1)
        self.assertEqual(self.product.average_rating, Decimal("5.00"))

        summary = self.client.get(f"/api/v1/products/{self.product.slug}/rating-summary/")
        self.assertEqual(summary.status_code, 200)
        self.assertEqual(summary.data["data"]["average_rating"], 5.0)
        self.assertEqual(summary.data["data"]["rating_distribution"]["5"], 1)

    def test_duplicate_order_item_review_is_rejected(self):
        self.create_pending_review()
        self.client.force_authenticate(self.user)
        response = self.client.post(
            f"/api/v1/products/{self.product.id}/reviews/",
            {
                "rating": 4,
                "body": "این دومین نظر برای همان خرید است.",
                "order_item_id": self.order_item.id,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Review.objects.count(), 1)

    def test_review_validation_requires_login_rating_and_minimum_body(self):
        url = f"/api/v1/products/{self.product.id}/reviews/"
        anonymous = self.client.post(url, {"rating": 5, "body": "متن کافی برای نظر"}, format="json")
        self.assertEqual(anonymous.status_code, 401)

        self.client.force_authenticate(self.user)
        invalid = self.client.post(url, {"rating": 0, "body": "کوتاه"}, format="json")
        self.assertEqual(invalid.status_code, 400)
        self.assertIn("rating", invalid.data)
        self.assertIn("body", invalid.data)

    def test_only_owner_can_edit_and_edit_returns_to_pending(self):
        review = self.create_pending_review()
        approve_review(review=review)

        self.client.force_authenticate(self.other_user)
        forbidden = self.client.patch(
            f"/api/v1/reviews/{review.id}/",
            {"rating": 3},
            format="json",
        )
        self.assertEqual(forbidden.status_code, 403)

        self.client.force_authenticate(self.user)
        updated = self.client.patch(
            f"/api/v1/reviews/{review.id}/",
            {"rating": 4, "body": "نسخه ویرایش‌شده نظر با متن کافی."},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        review.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(review.status, Review.Status.PENDING)
        self.assertEqual(self.product.approved_reviews_count, 0)

    def test_soft_delete_excludes_review_from_summary(self):
        review = self.create_pending_review()
        approve_review(review=review)
        self.client.force_authenticate(self.user)
        response = self.client.delete(f"/api/v1/reviews/{review.id}/")
        self.assertEqual(response.status_code, 204)
        review.refresh_from_db()
        self.product.refresh_from_db()
        self.assertIsNotNone(review.deleted_at)
        self.assertEqual(self.product.approved_reviews_count, 0)

    def test_admin_can_filter_approve_and_reply(self):
        review = self.create_pending_review()
        self.client.force_authenticate(self.admin)
        listing = self.client.get("/api/v1/admin/reviews/", {"status": "pending"})
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(listing.data["count"], 1)

        response = self.client.patch(
            f"/api/v1/admin/reviews/{review.id}/",
            {"status": "approved", "admin_reply": "از بازخورد شما متشکریم."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        review.refresh_from_db()
        self.assertEqual(review.status, Review.Status.APPROVED)
        self.assertTrue(review.admin_reply_at)

    def test_regular_user_cannot_access_admin_reviews(self):
        self.create_pending_review()
        self.client.force_authenticate(self.user)
        response = self.client.get("/api/v1/admin/reviews/")
        self.assertEqual(response.status_code, 403)

    def test_verified_badge_tracks_payment_status_changes(self):
        review = self.create_pending_review()
        payment = self.order.payments.get()
        payment.status = Payment.Status.FAILED
        payment.save(update_fields=["status", "updated_at"])
        review.refresh_from_db()
        self.assertFalse(review.is_verified_purchase)

        payment.status = Payment.Status.SUCCESSFUL
        payment.save(update_fields=["status", "updated_at"])
        review.refresh_from_db()
        self.assertTrue(review.is_verified_purchase)
