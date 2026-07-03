from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import UploadedFile


class DesignRequestFileOwnershipTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        session = self.client.session
        session.save()
        self.session_key = session.session_key

    def create_upload(self, *, session_key="", uploaded_by=None):
        return UploadedFile.objects.create(
            file=SimpleUploadedFile("design.png", b"\x89PNG\r\n\x1a\ncontent", content_type="image/png"),
            original_name="design.png",
            content_type="image/png",
            size=15,
            session_key=session_key,
            uploaded_by=uploaded_by,
        )

    def payload(self, uploaded_file):
        return {
            "order_type": "print",
            "description": "توضیحات کامل برای درخواست طراحی",
            "contact_name": "کاربر تست",
            "contact_phone": "09120000000",
            "uploaded_file_id": uploaded_file.id,
        }

    def test_anonymous_user_can_attach_file_from_same_session(self):
        upload = self.create_upload(session_key=self.session_key)

        response = self.client.post(
            reverse("design-request-list"),
            self.payload(upload),
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_anonymous_user_cannot_attach_file_from_another_session(self):
        upload = self.create_upload(session_key="another-session")

        response = self.client.post(
            reverse("design-request-list"),
            self.payload(upload),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("uploaded_file_id", response.data)

    def test_authenticated_user_cannot_attach_another_users_file(self):
        User = get_user_model()
        owner = User.objects.create_user(
            username="owner",
            email="owner@example.com",
            password="password123",
        )
        attacker = User.objects.create_user(
            username="attacker",
            email="attacker@example.com",
            password="password123",
        )
        upload = self.create_upload(uploaded_by=owner)
        self.client.force_authenticate(attacker)

        response = self.client.post(
            reverse("design-request-list"),
            self.payload(upload),
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("uploaded_file_id", response.data)

    def test_invalid_product_id_returns_validation_error(self):
        payload = self.payload(self.create_upload(session_key=self.session_key))
        payload["product_id"] = 999999

        response = self.client.post(
            reverse("design-request-list"),
            payload,
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("product_id", response.data)
