from rest_framework.test import APITestCase

from .models import Category, Product, ProductImage


class ProductAPITests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(title="ماگ", slug="mug")
        self.product = Product.objects.create(
            category=self.category,
            title="ماگ اختصاصی",
            slug="custom-mug",
            short_description="ماگ چاپی برای هدیه",
            description="چاپ عکس و متن روی ماگ",
            price=250000,
        )
        ProductImage.objects.create(
            product=self.product,
            image="products/gallery/custom-mug-1.jpg",
            alt_text="نمای روبروی ماگ اختصاصی",
            is_primary=True,
        )
        Product.objects.create(
            category=self.category,
            title="ماگ تبلیغاتی",
            slug="brand-mug",
            short_description="ماگ تبلیغاتی برای برند",
            description="چاپ لوگو روی ماگ",
            price=300000,
        )
        Product.objects.create(
            title="محصول غیرفعال",
            slug="inactive-product",
            price=100000,
            is_active=False,
        )

    def test_product_list_returns_active_products(self):
        response = self.client.get("/api/v1/products/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["slug"], "custom-mug")

    def test_product_list_filters_by_category_slug(self):
        response = self.client.get("/api/v1/products/", {"category__slug": "mug"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_categories_endpoint_returns_active_categories(self):
        response = self.client.get("/api/v1/categories/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["slug"], "mug")

    def test_search_endpoint_uses_q_param(self):
        response = self.client.get("/api/v1/search/", {"q": "اختصاصی"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)

    def test_product_detail_returns_gallery_and_related_products(self):
        response = self.client.get("/api/v1/products/custom-mug/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], "custom-mug")
        self.assertEqual(len(response.data["images"]), 1)
        self.assertEqual(response.data["images"][0]["alt_text"], "نمای روبروی ماگ اختصاصی")
        self.assertEqual(len(response.data["related_products"]), 1)
        self.assertEqual(response.data["related_products"][0]["slug"], "brand-mug")

    def test_product_detail_supports_id_contract(self):
        response = self.client.get(f"/api/v1/products/{self.product.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], "custom-mug")
