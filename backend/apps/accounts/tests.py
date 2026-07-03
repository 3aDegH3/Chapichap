from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .views import get_tokens_for_user


class TokenLifecycleTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="token-user",
            email="token@example.com",
            password="password123",
        )
        self.client = APIClient()

    def test_refresh_endpoint_rotates_tokens(self):
        tokens = get_tokens_for_user(self.user)

        response = self.client.post(
            reverse("token-refresh"),
            {"refresh": tokens["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertNotEqual(response.data["refresh"], tokens["refresh"])

    def test_logout_blacklists_refresh_token(self):
        tokens = get_tokens_for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")

        response = self.client.post(
            reverse("auth-logout"),
            {"refresh": tokens["refresh"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        with self.assertRaises(TokenError):
            RefreshToken(tokens["refresh"]).check_blacklist()
