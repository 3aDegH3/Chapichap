import base64
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import CustomerAddress, User
from apps.content.models import ContactMessage, ContactMessageInternalNote
from apps.design_request.models import DesignRequest, UploadedFile
from apps.orders.models import Order, OrderInternalNote
from apps.products.models import Product, ProductImage

from .models import AdminActivityLog


class AdminContactMessageAPITests(APITestCase):
    def setUp(self):
        self.support = User.objects.create_user(
            email="support@example.com",
            username="support",
            password="test-password",
            admin_role=User.AdminRole.SUPPORT,
        )
        self.client.force_authenticate(self.support)
        self.message = ContactMessage.objects.create(
            full_name="مشتری تست",
            phone="09120000000",
            subject=ContactMessage.Subject.GENERAL,
            message="متن کامل پیام",
        )

    def test_opening_detail_marks_new_message_as_read(self):
        response = self.client.get(
            reverse("admin_panel:contact-message-detail", kwargs={"pk": self.message.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.message.refresh_from_db()
        self.assertEqual(self.message.status, ContactMessage.Status.READ)
        self.assertEqual(response.data["message"], "متن کامل پیام")

    def test_bulk_read_only_changes_new_messages(self):
        replied = ContactMessage.objects.create(
            full_name="مشتری پاسخ‌گرفته",
            phone="09121111111",
            subject=ContactMessage.Subject.ORDER,
            message="پیام دوم",
            status=ContactMessage.Status.REPLIED,
        )

        response = self.client.patch(
            reverse("admin_panel:contact-messages-bulk-read"),
            {"ids": [self.message.pk, replied.pk]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["updated_count"], 1)
        self.message.refresh_from_db()
        replied.refresh_from_db()
        self.assertEqual(self.message.status, ContactMessage.Status.READ)
        self.assertEqual(replied.status, ContactMessage.Status.REPLIED)

    def test_note_creation_and_soft_delete(self):
        note_response = self.client.post(
            reverse("admin_panel:contact-message-notes", kwargs={"pk": self.message.pk}),
            {"text": "نیاز به تماس در ساعات اداری"},
            format="json",
        )
        delete_response = self.client.delete(
            reverse("admin_panel:contact-message-detail", kwargs={"pk": self.message.pk})
        )
        list_response = self.client.get(reverse("admin_panel:contact-messages"))

        self.assertEqual(note_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            ContactMessageInternalNote.objects.filter(
                contact_message=self.message,
                author=self.support,
            ).exists()
        )
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.message.refresh_from_db()
        self.assertTrue(self.message.is_deleted)
        self.assertEqual(self.message.deleted_by, self.support)
        self.assertEqual(list_response.data["count"], 0)


class AdminCustomerAPITests(APITestCase):
    def setUp(self):
        self.order_manager = User.objects.create_user(
            email="orders@example.com",
            username="orders",
            password="test-password",
            admin_role=User.AdminRole.ORDER_MANAGER,
        )
        self.customer = User.objects.create_user(
            email="customer@example.com",
            username="customer",
            password="private-password",
            first_name="سارا",
            last_name="احمدی",
            phone_number="09123334444",
        )
        CustomerAddress.objects.create(
            user=self.customer,
            title="خانه",
            receiver_name="سارا احمدی",
            phone="09123334444",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            is_default=True,
        )
        self.order = Order.objects.create(
            order_number="ORD-TEST-1",
            user=self.customer,
            receiver_name="سارا احمدی",
            phone="09123334444",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=10000,
            subtotal=200000,
            total_amount=210000,
        )
        DesignRequest.objects.create(
            user=self.customer,
            order_type=DesignRequest.OrderType.CONSULTING,
            description="درخواست مشاوره",
            contact_name="سارا احمدی",
            contact_phone="09123334444",
            contact_email="customer@example.com",
        )
        ContactMessage.objects.create(
            full_name="سارا احمدی",
            phone="09123334444",
            subject=ContactMessage.Subject.FOLLOW_UP,
            message="پیگیری سفارش",
        )
        self.client.force_authenticate(self.order_manager)

    def test_customer_list_includes_order_aggregates(self):
        response = self.client.get(reverse("admin_panel:customers"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        customer = response.data["results"][0]
        self.assertEqual(customer["order_count"], 1)
        self.assertEqual(customer["total_order_amount"], "210000.00")

    def test_customer_detail_is_complete_and_never_exposes_password(self):
        response = self.client.get(
            reverse("admin_panel:customer-detail", kwargs={"pk": self.customer.pk})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["addresses"]), 1)
        self.assertEqual(len(response.data["orders"]), 1)
        self.assertEqual(len(response.data["design_requests"]), 1)
        self.assertEqual(len(response.data["contact_messages"]), 1)
        self.assertNotIn("password", response.data)
        self.assertNotIn(self.customer.password, str(response.data))

    def test_support_role_cannot_open_customer_management(self):
        support = User.objects.create_user(
            email="limited-support@example.com",
            username="limited-support",
            password="test-password",
            admin_role=User.AdminRole.SUPPORT,
        )
        self.client.force_authenticate(support)

        response = self.client.get(reverse("admin_panel:customers"))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class AdminActivityLogAPITests(APITestCase):
    def setUp(self):
        self.super_admin = User.objects.create_superuser(
            email="root@example.com",
            username="root",
            password="test-password",
        )
        self.order_manager = User.objects.create_user(
            email="activity-orders@example.com",
            username="activity-orders",
            password="test-password",
            admin_role=User.AdminRole.ORDER_MANAGER,
        )
        self.product_manager = User.objects.create_user(
            email="activity-products@example.com",
            username="activity-products",
            password="test-password",
            admin_role=User.AdminRole.PRODUCT_MANAGER,
        )
        self.order = Order.objects.create(
            order_number="ORD-AUDIT-1",
            receiver_name="مشتری تست",
            phone="09120000000",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=100000,
            total_amount=100000,
        )
        self.product = Product.objects.create(
            title="محصول لاگ",
            price=100000,
            stock_quantity=10,
        )

    def test_order_status_change_records_actor_and_ip(self):
        self.client.force_authenticate(self.order_manager)

        response = self.client.patch(
            reverse("admin_panel:order-status", kwargs={"pk": self.order.pk}),
            {"status": Order.Status.REVIEWING},
            format="json",
            REMOTE_ADDR="10.10.10.10",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        activity = AdminActivityLog.objects.get(action=AdminActivityLog.Action.ORDER_STATUS_CHANGED)
        self.assertEqual(activity.actor, self.order_manager)
        self.assertEqual(activity.entity_id, str(self.order.pk))
        self.assertEqual(activity.ip_address, "10.10.10.10")
        self.assertEqual(self.order.status_history.count(), 1)
        self.assertEqual(self.order.status_history.get().created_by, self.order_manager)

    def test_product_price_inventory_and_delete_are_audited(self):
        self.client.force_authenticate(self.product_manager)

        update_response = self.client.patch(
            reverse("admin_panel:product-detail", kwargs={"pk": self.product.pk}),
            {"price": "120000", "stock_quantity": 7},
            format="json",
        )
        delete_response = self.client.delete(
            reverse("admin_panel:product-detail", kwargs={"pk": self.product.pk})
        )

        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        actions = set(AdminActivityLog.objects.values_list("action", flat=True))
        self.assertIn(AdminActivityLog.Action.PRODUCT_PRICE_CHANGED, actions)
        self.assertIn(AdminActivityLog.Action.PRODUCT_INVENTORY_CHANGED, actions)
        self.assertIn(AdminActivityLog.Action.PRODUCT_DELETED, actions)

    def test_only_super_admin_can_view_activity_log(self):
        AdminActivityLog.objects.create(
            actor=self.product_manager,
            action=AdminActivityLog.Action.PRODUCT_DELETED,
            entity_type="product",
            entity_id=self.product.pk,
            description="تست گزارش",
        )
        self.client.force_authenticate(self.product_manager)
        forbidden_response = self.client.get(reverse("admin_panel:activity-logs"))
        self.client.force_authenticate(self.super_admin)
        allowed_response = self.client.get(reverse("admin_panel:activity-logs"))

        self.assertEqual(forbidden_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(allowed_response.status_code, status.HTTP_200_OK)
        self.assertEqual(allowed_response.data["count"], 1)


class AdminSprintContractAPITests(APITestCase):
    def setUp(self):
        self.media_directory = tempfile.TemporaryDirectory()
        self.media_override = override_settings(MEDIA_ROOT=self.media_directory.name)
        self.media_override.enable()
        self.super_admin = User.objects.create_superuser(
            email="contract-root@example.com",
            username="contract-root",
            password="test-password",
        )
        self.support = User.objects.create_user(
            email="contract-support@example.com",
            username="contract-support",
            password="test-password",
            admin_role=User.AdminRole.SUPPORT,
        )
        self.product_manager = User.objects.create_user(
            email="contract-products@example.com",
            username="contract-products",
            password="test-password",
            admin_role=User.AdminRole.PRODUCT_MANAGER,
        )

    def tearDown(self):
        self.media_override.disable()
        self.media_directory.cleanup()
        super().tearDown()

    def make_image(self, name):
        png = base64.b64decode(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
        )
        return SimpleUploadedFile(name, png, content_type="image/png")

    def test_design_request_reply_contract_uses_post(self):
        design_request = DesignRequest.objects.create(
            order_type=DesignRequest.OrderType.CONSULTING,
            description="درخواست تست قرارداد",
            contact_name="مشتری تست",
            contact_phone="09120000000",
        )
        self.client.force_authenticate(self.support)

        response = self.client.post(
            reverse("admin_panel:design-request-reply", kwargs={"pk": design_request.pk}),
            {"admin_response": "پاسخ مدیر"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        design_request.refresh_from_db()
        self.assertEqual(design_request.admin_response, "پاسخ مدیر")
        self.assertTrue(
            AdminActivityLog.objects.filter(
                action=AdminActivityLog.Action.DESIGN_REQUEST_REPLIED,
                entity_id=str(design_request.pk),
            ).exists()
        )

    def test_product_gallery_upload_primary_selection_and_delete(self):
        product = Product.objects.create(title="محصول گالری", price=100000)
        self.client.force_authenticate(self.product_manager)

        upload_response = self.client.post(
            reverse("admin_panel:product-images", kwargs={"pk": product.pk}),
            {"gallery_images": [self.make_image("first.png"), self.make_image("second.png")]},
            format="multipart",
        )

        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        images = list(ProductImage.objects.filter(product=product).order_by("sort_order"))
        self.assertEqual(len(images), 2)
        self.assertTrue(images[0].is_primary)

        primary_response = self.client.patch(
            reverse("admin_panel:product-image-detail", kwargs={"pk": product.pk, "image_id": images[1].pk}),
            format="json",
        )
        delete_response = self.client.delete(
            reverse("admin_panel:product-image-detail", kwargs={"pk": product.pk, "image_id": images[0].pk})
        )

        self.assertEqual(primary_response.status_code, status.HTTP_200_OK)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        images[1].refresh_from_db()
        self.assertTrue(images[1].is_primary)
        self.assertEqual(ProductImage.objects.filter(product=product).count(), 1)

    def test_product_creation_accepts_gallery_images(self):
        self.client.force_authenticate(self.product_manager)

        response = self.client.post(
            reverse("admin_panel:products"),
            {
                "title": "محصول جدید با تصویر",
                "price": "150000",
                "gallery_images": [self.make_image("new-product.png")],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        product = Product.objects.get(pk=response.data["id"])
        gallery_image = ProductImage.objects.get(product=product)
        self.assertTrue(gallery_image.is_primary)
        self.assertEqual(product.image.name, gallery_image.image.name)

    def test_order_detail_returns_linked_customer_file(self):
        order = Order.objects.create(
            order_number="ORD-FILE-1",
            receiver_name="مشتری فایل",
            phone="09120000000",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=100000,
            total_amount=100000,
        )
        uploaded_file = UploadedFile.objects.create(
            file=self.make_image("design.png"),
            original_name="design.png",
            content_type="image/png",
            size=68,
        )
        DesignRequest.objects.create(
            order=order,
            uploaded_file=uploaded_file,
            order_type=DesignRequest.OrderType.PRINT,
            description="چاپ فایل",
            contact_name="مشتری فایل",
            contact_phone="09120000000",
        )
        self.client.force_authenticate(self.super_admin)

        response = self.client.get(reverse("admin_panel:order-detail", kwargs={"pk": order.pk}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["customer_files"]), 1)
        self.assertEqual(response.data["customer_files"][0]["filename"], "design.png")
        self.assertEqual(response.data["customer_files"][0]["order_id"], order.pk)

    def test_csv_export_uses_order_filters_and_neutralizes_formulas(self):
        matching_order = Order.objects.create(
            order_number="ORD-CSV-MATCH",
            receiver_name="=HYPERLINK(\"https://example.com\")",
            phone="09121111111",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=100000,
            total_amount=100000,
            status=Order.Status.REVIEWING,
        )
        Order.objects.create(
            order_number="ORD-CSV-OTHER",
            receiver_name="سفارش دیگر",
            phone="09122222222",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=200000,
            total_amount=200000,
        )
        self.client.force_authenticate(self.super_admin)

        response = self.client.get(
            reverse("admin_panel:orders-export-csv"),
            {"q": matching_order.order_number, "status": Order.Status.REVIEWING},
        )
        content = b"".join(response.streaming_content).decode("utf-8")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(content.startswith("\ufeff"))
        self.assertIn("ORD-CSV-MATCH", content)
        self.assertNotIn("ORD-CSV-OTHER", content)
        self.assertIn("'=HYPERLINK", content)


class AdminAcceptanceCriteriaTests(APITestCase):
    def setUp(self):
        self.order_manager = User.objects.create_user(
            email="acceptance-orders@example.com",
            username="acceptance-orders",
            password="test-password",
            admin_role=User.AdminRole.ORDER_MANAGER,
        )
        self.regular_user = User.objects.create_user(
            email="regular@example.com",
            username="regular-user",
            password="test-password",
        )
        self.matching_order = Order.objects.create(
            order_number="ORD-SEARCH-ONE",
            user=self.regular_user,
            receiver_name="مشتری قابل جستجو",
            phone="09124445555",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=100000,
            total_amount=100000,
            status=Order.Status.REVIEWING,
        )
        Order.objects.create(
            order_number="ORD-SEARCH-TWO",
            receiver_name="مشتری دیگر",
            phone="09126667777",
            province="تهران",
            city="تهران",
            address="خیابان تست",
            postal_code="1234567890",
            shipping_cost=0,
            subtotal=100000,
            total_amount=100000,
            status=Order.Status.REGISTERED,
        )

    def test_order_search_and_status_filter_work_together(self):
        self.client.force_authenticate(self.order_manager)

        response = self.client.get(
            reverse("admin_panel:orders"),
            {"q": "09124445555", "status": Order.Status.REVIEWING},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.matching_order.pk)

    def test_regular_user_is_denied_from_every_admin_domain(self):
        self.client.force_authenticate(self.regular_user)
        urls = [
            reverse("admin_panel:me"),
            reverse("admin_panel:dashboard"),
            reverse("admin_panel:products"),
            reverse("admin_panel:categories"),
            reverse("admin_panel:orders"),
            reverse("admin_panel:design-requests"),
            reverse("admin_panel:contact-messages"),
            reverse("admin_panel:customer-files"),
            reverse("admin_panel:customers"),
            reverse("admin_panel:activity-logs"),
            reverse("admin_panel:admin-users"),
        ]

        for url in urls:
            with self.subTest(url=url):
                response = self.client.get(url)
                self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_internal_order_notes_are_never_exposed_to_customer(self):
        OrderInternalNote.objects.create(
            order=self.matching_order,
            author=self.order_manager,
            text="یادداشت محرمانه مدیریت",
        )
        self.client.force_authenticate(self.regular_user)

        response = self.client.get(f"/api/v1/orders/{self.matching_order.pk}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("internal_notes", response.data)
        self.assertNotIn("یادداشت محرمانه مدیریت", str(response.data))


class AdminManagerSettingsAPITests(APITestCase):
    def setUp(self):
        self.super_admin = User.objects.create_superuser(
            email="settings-root@example.com",
            username="settings-root",
            password="test-password",
        )
        self.customer = User.objects.create_user(
            email="future-manager@example.com",
            username="future-manager",
            password="test-password",
        )
        self.support = User.objects.create_user(
            email="settings-support@example.com",
            username="settings-support",
            password="test-password",
            admin_role=User.AdminRole.SUPPORT,
        )

    def test_super_admin_can_grant_update_and_revoke_manager_access(self):
        self.client.force_authenticate(self.super_admin)

        grant_response = self.client.post(
            reverse("admin_panel:admin-users"),
            {"email": self.customer.email, "admin_role": User.AdminRole.ORDER_MANAGER},
            format="json",
        )
        update_response = self.client.patch(
            reverse("admin_panel:admin-user-detail", kwargs={"pk": self.customer.pk}),
            {"admin_role": User.AdminRole.PRODUCT_MANAGER, "is_active": True},
            format="json",
        )
        revoke_response = self.client.patch(
            reverse("admin_panel:admin-user-detail", kwargs={"pk": self.customer.pk}),
            {"admin_role": "", "is_active": False},
            format="json",
        )

        self.assertEqual(grant_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(revoke_response.status_code, status.HTTP_200_OK)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.admin_role, "")
        self.assertFalse(self.customer.is_active)
        self.assertEqual(
            AdminActivityLog.objects.filter(
                action=AdminActivityLog.Action.ADMIN_ACCESS_CHANGED,
                entity_id=str(self.customer.pk),
            ).count(),
            3,
        )

    def test_non_super_admin_cannot_manage_admin_users(self):
        self.client.force_authenticate(self.support)

        response = self.client.post(
            reverse("admin_panel:admin-users"),
            {"email": self.customer.email, "admin_role": User.AdminRole.SUPPORT},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superuser_and_current_account_are_protected(self):
        self.client.force_authenticate(self.super_admin)

        response = self.client.patch(
            reverse("admin_panel:admin-user-detail", kwargs={"pk": self.super_admin.pk}),
            {"is_active": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.super_admin.refresh_from_db()
        self.assertTrue(self.super_admin.is_active)
