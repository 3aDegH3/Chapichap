from datetime import date

from rest_framework.test import APITestCase

from .models import Portfolio, PortfolioImage


class PortfolioAPITests(APITestCase):
    def setUp(self):
        self.portfolio = Portfolio.objects.create(
            title="ماگ تولد",
            slug="birthday-mug",
            work_type=Portfolio.WorkType.MUG,
            client_name="سفارش شخصی",
            short_description="چاپ تصویر روی ماگ",
            description="نمونه‌کار چاپ روی ماگ برای هدیه تولد",
            is_featured=True,
            completed_at=date(2026, 5, 18),
        )
        PortfolioImage.objects.create(
            portfolio=self.portfolio,
            image="portfolio/gallery/birthday-mug.jpg",
            alt_text="نمای ماگ تولد",
        )
        Portfolio.objects.create(
            title="ماگ شرکتی",
            slug="company-mug",
            work_type=Portfolio.WorkType.MUG,
            short_description="چاپ لوگو روی ماگ",
            completed_at=date(2026, 4, 12),
        )
        Portfolio.objects.create(
            title="نمونه‌کار غیرفعال",
            slug="inactive-work",
            work_type=Portfolio.WorkType.TSHIRT,
            is_active=False,
        )

    def test_portfolio_list_returns_active_items(self):
        response = self.client.get("/api/v1/portfolio/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_portfolio_list_filters_by_work_type(self):
        response = self.client.get("/api/v1/portfolio/", {"work_type": "mug"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_portfolio_list_uses_q_param_for_url_synced_search(self):
        response = self.client.get("/api/v1/portfolio/", {"q": "تولد"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["slug"], "birthday-mug")

    def test_portfolio_detail_returns_images_and_related_items(self):
        response = self.client.get("/api/v1/portfolio/birthday-mug/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], "birthday-mug")
        self.assertEqual(len(response.data["images"]), 1)
        self.assertEqual(response.data["images"][0]["alt_text"], "نمای ماگ تولد")
        self.assertEqual(len(response.data["related_items"]), 1)

    def test_portfolio_detail_supports_id_contract(self):
        response = self.client.get(f"/api/v1/portfolio/{self.portfolio.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], "birthday-mug")
