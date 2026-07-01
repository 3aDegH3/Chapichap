import csv

from django.db import transaction
from django.db.models import Count, F, Max, Prefetch, Q, Sum
from django.http import FileResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from PIL import Image, UnidentifiedImageError
from rest_framework import status
from rest_framework import serializers as drf_serializers
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView, ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import SupportAttachment, User
from apps.accounts.services import notify_design_request_admin_reply, notify_order_status_changed
from apps.content.models import ContactMessage, ContactMessageInternalNote
from apps.core.file_security import PREVIEWABLE_CUSTOMER_FILE_TYPES, normalize_customer_content_type
from apps.design_request.models import DesignRequest, DesignRequestInternalNote, DesignRequestStatusHistory, UploadedFile
from apps.orders.models import Order, OrderInternalNote, OrderStatusHistory
from apps.payments.models import Payment
from apps.products.models import Category, Product, ProductImage

from .models import AdminActivityLog
from .permissions import ADMIN_PERMISSION_ACTIVITY_LOGS, ADMIN_PERMISSION_DASHBOARD, CanManageContactMessages, CanManageCustomerFiles, CanManageCustomers, CanManageDesignRequests, CanManageOrders, CanManageProducts, CanViewActivityLogs, IsAdminPanelUser, IsSuperAdmin, user_has_admin_permission
from .serializers import (
    AdminActivityLogSerializer,
    AdminContactMessageBulkReadSerializer,
    AdminContactMessageDetailSerializer,
    AdminContactMessageInternalNoteCreateSerializer,
    AdminContactMessageInternalNoteSerializer,
    AdminContactMessageListSerializer,
    AdminContactMessageStatusUpdateSerializer,
    AdminCustomerDetailSerializer,
    AdminCustomerFileSerializer,
    AdminCustomerListSerializer,
    AdminDashboardContactMessageSerializer,
    AdminDashboardDesignRequestSerializer,
    AdminDashboardOrderSerializer,
    AdminDashboardProductSerializer,
    AdminDesignRequestDetailSerializer,
    AdminDesignRequestInternalNoteCreateSerializer,
    AdminDesignRequestInternalNoteSerializer,
    AdminDesignRequestListSerializer,
    AdminDesignRequestOrderLinkSerializer,
    AdminDesignRequestResponseUpdateSerializer,
    AdminDesignRequestStatusHistorySerializer,
    AdminDesignRequestStatusUpdateSerializer,
    AdminInventoryChangeSerializer,
    AdminManagerGrantSerializer,
    AdminManagerSerializer,
    AdminManagerUpdateSerializer,
    AdminOrderListSerializer,
    AdminOrderDetailSerializer,
    AdminOrderInternalNoteCreateSerializer,
    AdminOrderInternalNoteSerializer,
    AdminOrderShippingUpdateSerializer,
    AdminOrderStatusHistorySerializer,
    AdminOrderStatusUpdateSerializer,
    AdminProductCategorySerializer,
    AdminProductSerializer,
    AdminUserSerializer,
    build_design_file_record,
    build_support_file_record,
)
from .services import log_admin_activity


def admin_response(message="OK", data=None, http_status=status.HTTP_200_OK):
    return Response(
        {
            "success": True,
            "message": message,
            "data": data if data is not None else {},
        },
        status=http_status,
    )


MAX_PRODUCT_GALLERY_IMAGES = 8
MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024


def validate_product_gallery_files(files, existing_count=0):
    if existing_count + len(files) > MAX_PRODUCT_GALLERY_IMAGES:
        raise drf_serializers.ValidationError(
            {"gallery_images": f"برای هر محصول حداکثر {MAX_PRODUCT_GALLERY_IMAGES} تصویر مجاز است."}
        )

    for file in files:
        if file.size > MAX_PRODUCT_IMAGE_SIZE:
            raise drf_serializers.ValidationError(
                {"gallery_images": f"حجم تصویر «{file.name}» نباید بیشتر از ۵ مگابایت باشد."}
            )
        try:
            with Image.open(file) as image:
                width, height = image.size
                if width * height > 40_000_000:
                    raise drf_serializers.ValidationError(
                        {"gallery_images": f"ابعاد تصویر «{file.name}» بیش از حد مجاز است."}
                    )
                image.verify()
        except (UnidentifiedImageError, OSError, SyntaxError):
            raise drf_serializers.ValidationError(
                {"gallery_images": f"فایل «{file.name}» تصویر معتبر نیست."}
            )
        finally:
            file.seek(0)


def append_product_gallery_images(product, files):
    if not files:
        return

    has_primary = product.images.filter(is_primary=True).exists()
    next_sort_order = product.images.count()
    for index, file in enumerate(files):
        gallery_image = ProductImage.objects.create(
            product=product,
            image=file,
            alt_text=product.title,
            is_primary=not has_primary and index == 0,
            sort_order=next_sort_order + index,
        )
        if gallery_image.is_primary:
            product.image.name = gallery_image.image.name
            product.save(update_fields=["image", "updated_at"])


class AdminMeAPIView(APIView):
    permission_classes = [IsAdminPanelUser]

    def get(self, request):
        return admin_response(
            message="دسترسی مدیر تأیید شد.",
            data={"user": AdminUserSerializer(request.user).data},
        )


class AdminManagerListCreateAPIView(ListAPIView):
    permission_classes = [IsSuperAdmin]
    serializer_class = AdminManagerSerializer

    def get_queryset(self):
        queryset = User.objects.filter(
            Q(is_superuser=True) | Q(is_staff=True) | ~Q(admin_role="")
        ).order_by("-is_superuser", "email")
        search = (self.request.query_params.get("q") or "").strip()
        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(phone_number__icontains=search)
            )
        if role:
            if role == User.AdminRole.SUPER_ADMIN:
                queryset = queryset.filter(Q(is_superuser=True) | Q(admin_role=role))
            elif role == User.AdminRole.SUPPORT:
                queryset = queryset.filter(
                    Q(admin_role=role) | Q(admin_role="", is_staff=True, is_superuser=False)
                )
            else:
                queryset = queryset.filter(admin_role=role)
        if is_active in {"true", "false"}:
            queryset = queryset.filter(is_active=is_active == "true")
        return queryset.distinct()

    def post(self, request):
        serializer = AdminManagerGrantSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if not user:
            raise drf_serializers.ValidationError(
                {"email": "ابتدا کاربر باید از مسیر ثبت‌نام یک حساب فعال ایجاد کند."}
            )
        if user.is_superuser:
            raise drf_serializers.ValidationError(
                {"email": "دسترسی Superuser فقط از Django Admin مدیریت می‌شود."}
            )
        if user.pk == request.user.pk:
            raise drf_serializers.ValidationError(
                {"email": "نقش حساب فعلی را نمی‌توانید از همین صفحه تغییر دهید."}
            )

        previous_role = user.effective_admin_role or "بدون دسترسی"
        user.admin_role = serializer.validated_data["admin_role"]
        user.is_active = True
        user.save(update_fields=["admin_role", "is_active"])
        log_admin_activity(
            request,
            action=AdminActivityLog.Action.ADMIN_ACCESS_CHANGED,
            entity_type="admin_user",
            entity_id=user.pk,
            description=f"نقش {user.email} از {previous_role} به {user.get_admin_role_display()} تغییر کرد.",
        )
        return admin_response(
            message="دسترسی مدیریتی ثبت شد.",
            data={"manager": AdminManagerSerializer(user, context={"request": request}).data},
        )


class AdminManagerDetailAPIView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        if user.is_superuser:
            raise drf_serializers.ValidationError(
                {"detail": "دسترسی Superuser فقط از Django Admin مدیریت می‌شود."}
            )
        if user.pk == request.user.pk:
            raise drf_serializers.ValidationError(
                {"detail": "برای جلوگیری از قفل‌شدن پنل، حساب فعلی از این صفحه قابل تغییر نیست."}
            )

        serializer = AdminManagerUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        previous_role = user.effective_admin_role or "بدون دسترسی"
        previous_active = user.is_active
        update_fields = []

        if "admin_role" in serializer.validated_data:
            user.admin_role = serializer.validated_data["admin_role"]
            update_fields.append("admin_role")
            if not user.admin_role and user.is_staff:
                user.is_staff = False
                update_fields.append("is_staff")
        if "is_active" in serializer.validated_data:
            user.is_active = serializer.validated_data["is_active"]
            update_fields.append("is_active")

        user.save(update_fields=update_fields)
        new_role = user.effective_admin_role or "بدون دسترسی"
        log_admin_activity(
            request,
            action=AdminActivityLog.Action.ADMIN_ACCESS_CHANGED,
            entity_type="admin_user",
            entity_id=user.pk,
            description=(
                f"دسترسی {user.email} تغییر کرد: نقش {previous_role} به {new_role}، "
                f"وضعیت فعال {previous_active} به {user.is_active}."
            ),
        )
        return admin_response(
            message="دسترسی مدیر به‌روزرسانی شد.",
            data={"manager": AdminManagerSerializer(user, context={"request": request}).data},
        )


class AdminDashboardAPIView(APIView):
    permission_classes = [IsAdminPanelUser]

    def get(self, request):
        if not user_has_admin_permission(request.user, ADMIN_PERMISSION_DASHBOARD):
            return Response(
                {
                    "success": False,
                    "message": "دسترسی مشاهده داشبورد برای این نقش مجاز نیست.",
                    "data": {},
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        low_stock_threshold = 5
        latest_payment_prefetch = Prefetch(
            "payments",
            queryset=Payment.objects.order_by("-created_at"),
        )

        latest_orders = (
            Order.objects.prefetch_related(latest_payment_prefetch)
            .order_by("-created_at")[:6]
        )
        latest_design_requests = DesignRequest.objects.select_related("product").order_by("-created_at")[:6]
        low_stock_products = (
            Product.objects.select_related("category")
            .filter(is_active=True, unlimited_stock=False, stock_quantity__lte=F("low_stock_threshold"))
            .order_by("stock_quantity", "-updated_at")[:6]
        )
        latest_contact_messages = ContactMessage.objects.filter(is_deleted=False).order_by("-created_at")[:6]

        order_status_counts = dict(
            Order.objects.values("status").annotate(total=Count("id")).values_list("status", "total")
        )
        can_view_activity_logs = user_has_admin_permission(request.user, ADMIN_PERMISSION_ACTIVITY_LOGS)
        recent_admin_activities = (
            AdminActivityLog.objects.select_related("actor")[:6]
            if can_view_activity_logs
            else AdminActivityLog.objects.none()
        )

        stats = {
            "new_orders": order_status_counts.get(Order.Status.REGISTERED, 0),
            "reviewing_orders": order_status_counts.get(Order.Status.REVIEWING, 0),
            "ready_for_print_orders": order_status_counts.get(Order.Status.READY_FOR_PRINT, 0),
            "ready_to_ship_orders": order_status_counts.get(Order.Status.READY_TO_SHIP, 0),
            "new_design_requests": DesignRequest.objects.filter(status=DesignRequest.Status.RECEIVED).count(),
            "unread_contact_messages": ContactMessage.objects.filter(
                status=ContactMessage.Status.NEW,
                is_deleted=False,
            ).count(),
            "low_stock_products": Product.objects.filter(
                is_active=True,
                unlimited_stock=False,
                stock_quantity__lte=F("low_stock_threshold"),
            ).count(),
            "customers": User.objects.filter(is_active=True, is_staff=False, is_superuser=False).count(),
        }

        return admin_response(
            message="آمار داشبورد دریافت شد.",
            data={
                "stats": stats,
                "low_stock_threshold": low_stock_threshold,
                "latest_orders": AdminDashboardOrderSerializer(latest_orders, many=True).data,
                "latest_design_requests": AdminDashboardDesignRequestSerializer(
                    latest_design_requests,
                    many=True,
                ).data,
                "low_stock_products": AdminDashboardProductSerializer(low_stock_products, many=True).data,
                "latest_contact_messages": AdminDashboardContactMessageSerializer(
                    latest_contact_messages,
                    many=True,
                ).data,
                "can_view_activity_logs": can_view_activity_logs,
                "recent_admin_activities": AdminActivityLogSerializer(
                    recent_admin_activities,
                    many=True,
                ).data,
            },
        )


class AdminActivityLogQuerySearchFilter(SearchFilter):
    search_param = "q"


class AdminActivityLogListAPIView(ListAPIView):
    permission_classes = [CanViewActivityLogs]
    serializer_class = AdminActivityLogSerializer
    filter_backends = [DjangoFilterBackend, AdminActivityLogQuerySearchFilter, OrderingFilter]
    filterset_fields = {
        "actor": ["exact"],
        "action": ["exact"],
        "entity_type": ["exact"],
    }
    search_fields = [
        "actor__email",
        "actor__first_name",
        "actor__last_name",
        "entity_id",
        "description",
        "ip_address",
    ]
    ordering_fields = ["created_at", "action", "entity_type"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = AdminActivityLog.objects.select_related("actor")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        return queryset


class AdminProductQuerySearchFilter(SearchFilter):
    search_param = "q"


class AdminProductCategoryListAPIView(ListAPIView):
    permission_classes = [CanManageProducts]
    serializer_class = AdminProductCategorySerializer
    pagination_class = None

    def get_queryset(self):
        return (
            Category.objects.order_by("title")
            .annotate(product_count=Count("products", distinct=True), children_count=Count("children", distinct=True))
        )

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}


class AdminCategoryQuerySearchFilter(SearchFilter):
    search_param = "q"


class AdminCategoryListCreateAPIView(ListCreateAPIView):
    permission_classes = [CanManageProducts]
    serializer_class = AdminProductCategorySerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, AdminCategoryQuerySearchFilter, OrderingFilter]
    filterset_fields = {
        "parent": ["exact"],
        "is_active": ["exact"],
    }
    search_fields = ["title", "slug", "description"]
    ordering_fields = ["sort_order", "title", "created_at", "updated_at"]
    ordering = ["sort_order", "title"]

    def get_queryset(self):
        return (
            Category.objects.select_related("parent")
            .annotate(product_count=Count("products", distinct=True), children_count=Count("children", distinct=True))
        )

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}


class AdminCategoryDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [CanManageProducts]
    serializer_class = AdminProductCategorySerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            Category.objects.select_related("parent")
            .annotate(product_count=Count("products", distinct=True), children_count=Count("children", distinct=True))
        )

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.products.exists():
            return Response(
                {
                    "success": False,
                    "message": "دسته‌بندی دارای محصول قابل حذف نیست.",
                    "data": {},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if instance.children.exists():
            return Response(
                {
                    "success": False,
                    "message": "دسته‌بندی دارای زیرمجموعه قابل حذف نیست.",
                    "data": {},
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return super().destroy(request, *args, **kwargs)


class AdminProductListCreateAPIView(ListCreateAPIView):
    permission_classes = [CanManageProducts]
    serializer_class = AdminProductSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, AdminProductQuerySearchFilter, OrderingFilter]
    filterset_fields = {
        "category": ["exact"],
        "category__slug": ["exact"],
        "product_type": ["exact"],
        "gift_usage": ["exact"],
        "is_active": ["exact"],
    }
    search_fields = ["title", "slug", "short_description", "description", "material", "dimensions"]
    ordering_fields = ["price", "stock_quantity", "updated_at", "created_at", "title"]
    ordering = ["-updated_at"]

    def get_queryset(self):
        queryset = Product.objects.select_related("category").prefetch_related("images").all()
        availability = self.request.query_params.get("availability")

        if availability == "in_stock":
            queryset = queryset.filter(stock_quantity__gt=0)
        elif availability == "out_of_stock":
            queryset = queryset.filter(stock_quantity=0)

        return queryset

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}

    def create(self, request, *args, **kwargs):
        gallery_files = request.FILES.getlist("gallery_images")
        validate_product_gallery_files(gallery_files)
        with transaction.atomic():
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        product = serializer.save()
        append_product_gallery_images(product, self.request.FILES.getlist("gallery_images"))


class AdminProductDetailAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [CanManageProducts]
    serializer_class = AdminProductSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return Product.objects.select_related("category").prefetch_related("images").all()

    def get_serializer_context(self):
        return {**super().get_serializer_context(), "request": self.request}

    def update(self, request, *args, **kwargs):
        product = self.get_object()
        gallery_files = request.FILES.getlist("gallery_images")
        validate_product_gallery_files(gallery_files, product.images.count())
        with transaction.atomic():
            return super().update(request, *args, **kwargs)

    def perform_update(self, serializer):
        product = serializer.instance
        previous_price = product.price
        previous_discount_price = product.discount_price
        previous_stock = product.stock_quantity
        product = serializer.save()

        if previous_price != product.price or previous_discount_price != product.discount_price:
            log_admin_activity(
                self.request,
                action=AdminActivityLog.Action.PRODUCT_PRICE_CHANGED,
                entity_type="product",
                entity_id=product.pk,
                description=(
                    f"قیمت محصول «{product.title}» از {previous_price} به {product.price} و "
                    f"قیمت تخفیف از {previous_discount_price or '-'} به {product.discount_price or '-'} تغییر کرد."
                ),
            )

        if previous_stock != product.stock_quantity:
            log_admin_activity(
                self.request,
                action=AdminActivityLog.Action.PRODUCT_INVENTORY_CHANGED,
                entity_type="product",
                entity_id=product.pk,
                description=(
                    f"موجودی محصول «{product.title}» از {previous_stock} به {product.stock_quantity} تغییر کرد."
                ),
            )

        append_product_gallery_images(product, self.request.FILES.getlist("gallery_images"))
        product._prefetched_objects_cache.pop("images", None)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])
        log_admin_activity(
            self.request,
            action=AdminActivityLog.Action.PRODUCT_DELETED,
            entity_type="product",
            entity_id=instance.pk,
            description=f"محصول «{instance.title}» به‌صورت نرم حذف شد.",
        )


class AdminProductImageListCreateAPIView(APIView):
    permission_classes = [CanManageProducts]

    def get_product(self, pk):
        return get_object_or_404(Product.objects.prefetch_related("images"), pk=pk)

    def get(self, request, pk):
        product = self.get_product(pk)
        return Response(AdminProductSerializer(product, context={"request": request}).data["gallery_images"])

    def post(self, request, pk):
        product = self.get_product(pk)
        files = request.FILES.getlist("gallery_images")
        if not files:
            raise drf_serializers.ValidationError({"gallery_images": "حداقل یک تصویر انتخاب کنید."})
        validate_product_gallery_files(files, product.images.count())
        with transaction.atomic():
            append_product_gallery_images(product, files)
        product = self.get_product(pk)
        return admin_response(
            message="تصاویر محصول اضافه شدند.",
            data={"product": AdminProductSerializer(product, context={"request": request}).data},
            http_status=status.HTTP_201_CREATED,
        )


class AdminProductImageDetailAPIView(APIView):
    permission_classes = [CanManageProducts]

    def get_object(self, pk, image_id):
        return get_object_or_404(ProductImage.objects.select_related("product"), product_id=pk, pk=image_id)

    def patch(self, request, pk, image_id):
        gallery_image = self.get_object(pk, image_id)
        product = gallery_image.product
        with transaction.atomic():
            product.images.update(is_primary=False)
            gallery_image.is_primary = True
            gallery_image.save(update_fields=["is_primary"])
            product.image.name = gallery_image.image.name
            product.save(update_fields=["image", "updated_at"])
        product = get_object_or_404(Product.objects.prefetch_related("images"), pk=pk)
        return admin_response(
            message="تصویر اصلی محصول تغییر کرد.",
            data={"product": AdminProductSerializer(product, context={"request": request}).data},
        )

    def delete(self, request, pk, image_id):
        gallery_image = self.get_object(pk, image_id)
        product = gallery_image.product
        was_primary = gallery_image.is_primary
        image_file = gallery_image.image

        with transaction.atomic():
            gallery_image.delete()
            if was_primary:
                next_image = product.images.order_by("sort_order", "id").first()
                if next_image:
                    next_image.is_primary = True
                    next_image.save(update_fields=["is_primary"])
                    product.image.name = next_image.image.name
                else:
                    product.image = None
                product.save(update_fields=["image", "updated_at"])
        image_file.delete(save=False)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminProductToggleActiveAPIView(APIView):
    permission_classes = [CanManageProducts]

    def patch(self, request, pk):
        product = get_object_or_404(Product.objects.select_related("category"), pk=pk)
        product.is_active = not product.is_active
        product.save(update_fields=["is_active", "updated_at"])

        return admin_response(
            message="وضعیت انتشار محصول تغییر کرد.",
            data={"product": AdminProductSerializer(product, context={"request": request}).data},
        )


class AdminProductInventoryHistoryAPIView(ListAPIView):
    permission_classes = [CanManageProducts]
    serializer_class = AdminInventoryChangeSerializer

    def get_queryset(self):
        product = get_object_or_404(Product, pk=self.kwargs["pk"])
        return product.inventory_changes.select_related("changed_by")


class AdminOrderListAPIView(ListAPIView):
    permission_classes = [CanManageOrders]
    serializer_class = AdminOrderListSerializer

    def get_queryset(self):
        return get_admin_order_queryset(self.request)


def get_admin_order_queryset(request):
    latest_payment_prefetch = Prefetch(
        "payments",
        queryset=Payment.objects.order_by("-created_at"),
    )
    queryset = (
        Order.objects.select_related("user")
        .prefetch_related(latest_payment_prefetch)
        .annotate(items_count=Count("items", distinct=True))
        .order_by("-created_at")
    )

    search = (request.query_params.get("q") or "").strip()
    order_status = request.query_params.get("status")
    payment_status = request.query_params.get("payment_status")
    delivery_method = request.query_params.get("delivery_method")
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    if search:
        queryset = queryset.filter(
            Q(order_number__icontains=search)
            | Q(receiver_name__icontains=search)
            | Q(phone__icontains=search)
            | Q(user__email__icontains=search)
            | Q(payments__tracking_code__icontains=search)
            | Q(payments__receipt_number__icontains=search)
            | Q(payments__provider_reference__icontains=search)
        )

    if order_status:
        queryset = queryset.filter(status=order_status)
    if payment_status:
        queryset = queryset.filter(payments__status=payment_status)
    if delivery_method:
        queryset = queryset.filter(delivery_method=delivery_method)
    if date_from:
        queryset = queryset.filter(created_at__date__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__date__lte=date_to)

    return queryset.distinct()


class CSVBuffer:
    def write(self, value):
        return value


def csv_safe(value):
    text = "" if value is None else str(value)
    if text.startswith(("=", "+", "-", "@")):
        return f"'{text}"
    return text


class AdminOrderCSVExportAPIView(APIView):
    permission_classes = [CanManageOrders]

    def get(self, request):
        queryset = get_admin_order_queryset(request)
        writer = csv.writer(CSVBuffer())

        def stream_rows():
            yield "\ufeff"
            yield writer.writerow(
                [
                    "شماره سفارش",
                    "نام مشتری",
                    "شماره تماس",
                    "ایمیل",
                    "مبلغ نهایی",
                    "وضعیت سفارش",
                    "وضعیت پرداخت",
                    "روش پرداخت",
                    "روش تحویل",
                    "تاریخ ثبت",
                ]
            )
            for order in queryset.iterator(chunk_size=500):
                payments = list(order.payments.all())
                payment = payments[0] if payments else None
                yield writer.writerow(
                    [
                        csv_safe(order.order_number),
                        csv_safe(order.receiver_name),
                        csv_safe(order.phone),
                        csv_safe(order.user.email if order.user else ""),
                        order.total_amount,
                        order.get_status_display(),
                        payment.get_status_display() if payment else "ثبت نشده",
                        payment.get_method_display() if payment else "ثبت نشده",
                        order.get_delivery_method_display(),
                        timezone.localtime(order.created_at).isoformat(),
                    ]
                )

        response = StreamingHttpResponse(stream_rows(), content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="orders-{timezone.localdate().isoformat()}.csv"'
        response["X-Content-Type-Options"] = "nosniff"
        return response


class AdminOrderDetailAPIView(APIView):
    permission_classes = [CanManageOrders]

    def get_object(self, pk):
        return get_object_or_404(
            Order.objects.select_related("user").prefetch_related(
                "items",
                "payments",
                "status_history__created_by",
            ),
            pk=pk,
        )

    def get(self, request, pk):
        order = self.get_object(pk)
        return Response(AdminOrderDetailSerializer(order, context={"request": request}).data)


class AdminOrderStatusUpdateAPIView(APIView):
    permission_classes = [CanManageOrders]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = AdminOrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        previous_status = order.status
        new_status = serializer.validated_data["status"]
        note = serializer.validated_data.get("note", "")

        if previous_status != new_status:
            order.status = new_status
            order.save(update_fields=["status", "updated_at"])

            OrderStatusHistory.objects.create(
                order=order,
                previous_status=previous_status,
                new_status=new_status,
                title=order.get_status_display(),
                description=note or "وضعیت سفارش توسط مدیریت به‌روزرسانی شد.",
                visible_to_customer=serializer.validated_data.get("visible_to_customer", True),
                created_by=request.user if request.user.is_authenticated else None,
            )
            notify_order_status_changed(
                order,
                previous_status=previous_status,
                new_status=new_status,
                actor=request.user,
            )
            log_admin_activity(
                request,
                action=AdminActivityLog.Action.ORDER_STATUS_CHANGED,
                entity_type="order",
                entity_id=order.pk,
                description=(
                    f"وضعیت سفارش {order.order_number} از "
                    f"{dict(Order.Status.choices).get(previous_status, previous_status)} به "
                    f"{dict(Order.Status.choices).get(new_status, new_status)} تغییر کرد."
                ),
            )

        order = AdminOrderDetailAPIView().get_object(pk)
        return admin_response(
            message="وضعیت سفارش به‌روزرسانی شد.",
            data={"order": AdminOrderDetailSerializer(order, context={"request": request}).data},
        )


class AdminOrderShippingUpdateAPIView(APIView):
    permission_classes = [CanManageOrders]

    def patch(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = AdminOrderShippingUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        update_fields = ["updated_at"]
        for field in ["delivery_method", "shipping_provider", "shipping_tracking_code"]:
            if field in serializer.validated_data:
                setattr(order, field, serializer.validated_data[field])
                update_fields.append(field)

        order.save(update_fields=update_fields)
        order = AdminOrderDetailAPIView().get_object(pk)

        return admin_response(
            message="اطلاعات ارسال سفارش به‌روزرسانی شد.",
            data={"order": AdminOrderDetailSerializer(order, context={"request": request}).data},
        )


class AdminOrderStatusHistoryAPIView(ListAPIView):
    permission_classes = [CanManageOrders]
    serializer_class = AdminOrderStatusHistorySerializer

    def get_queryset(self):
        order = get_object_or_404(Order, pk=self.kwargs["pk"])
        return order.status_history.select_related("created_by")


class AdminOrderInternalNoteListCreateAPIView(APIView):
    permission_classes = [CanManageOrders]

    def get(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        notes = order.internal_notes.select_related("author")
        return Response(AdminOrderInternalNoteSerializer(notes, many=True, context={"request": request}).data)

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = AdminOrderInternalNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = OrderInternalNote.objects.create(
            order=order,
            author=request.user if request.user.is_authenticated else None,
            text=serializer.validated_data["text"],
        )
        return admin_response(
            message="یادداشت داخلی ثبت شد.",
            data={"note": AdminOrderInternalNoteSerializer(note, context={"request": request}).data},
            http_status=status.HTTP_201_CREATED,
        )


class AdminOrderInternalNoteDetailAPIView(APIView):
    permission_classes = [CanManageOrders]

    def get_object(self, pk, note_id):
        return get_object_or_404(OrderInternalNote.objects.select_related("author"), order_id=pk, pk=note_id)

    def ensure_can_edit(self, request, note):
        if request.user.is_superuser or note.author_id == request.user.id:
            return None
        return Response(
            {
                "success": False,
                "message": "ویرایش این یادداشت فقط برای نویسنده یا Super Admin مجاز است.",
                "data": {},
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    def patch(self, request, pk, note_id):
        note = self.get_object(pk, note_id)
        permission_response = self.ensure_can_edit(request, note)
        if permission_response:
            return permission_response

        serializer = AdminOrderInternalNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note.text = serializer.validated_data["text"]
        note.save(update_fields=["text", "updated_at"])

        return admin_response(
            message="یادداشت داخلی به‌روزرسانی شد.",
            data={"note": AdminOrderInternalNoteSerializer(note, context={"request": request}).data},
        )

    def delete(self, request, pk, note_id):
        note = self.get_object(pk, note_id)
        permission_response = self.ensure_can_edit(request, note)
        if permission_response:
            return permission_response

        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminDesignRequestQuerySearchFilter(SearchFilter):
    search_param = "q"


class AdminDesignRequestListAPIView(ListAPIView):
    permission_classes = [CanManageDesignRequests]
    serializer_class = AdminDesignRequestListSerializer
    filter_backends = [DjangoFilterBackend, AdminDesignRequestQuerySearchFilter, OrderingFilter]
    filterset_fields = {
        "status": ["exact"],
        "order_type": ["exact"],
        "product": ["exact"],
        "order": ["exact"],
    }
    search_fields = [
        "contact_name",
        "contact_phone",
        "contact_email",
        "description",
        "product__title",
        "order__order_number",
        "uploaded_file__original_name",
    ]
    ordering_fields = ["created_at", "updated_at", "status", "order_type"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return DesignRequest.objects.select_related("user", "product", "order", "uploaded_file")


class AdminDesignRequestDetailAPIView(APIView):
    permission_classes = [CanManageDesignRequests]

    def get_object(self, pk):
        return get_object_or_404(
            DesignRequest.objects.select_related("user", "product", "order", "uploaded_file")
            .prefetch_related("status_history__created_by"),
            pk=pk,
        )

    def get(self, request, pk):
        design_request = self.get_object(pk)
        return Response(AdminDesignRequestDetailSerializer(design_request, context={"request": request}).data)


class AdminDesignRequestStatusUpdateAPIView(APIView):
    permission_classes = [CanManageDesignRequests]

    def patch(self, request, pk):
        design_request = get_object_or_404(DesignRequest, pk=pk)
        serializer = AdminDesignRequestStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        previous_status = design_request.status
        new_status = serializer.validated_data["status"]
        note = serializer.validated_data.get("note", "")

        if previous_status != new_status:
            design_request.status = new_status
            design_request.save(update_fields=["status", "updated_at"])
            DesignRequestStatusHistory.objects.create(
                design_request=design_request,
                previous_status=previous_status,
                new_status=new_status,
                note=note,
                created_by=request.user if request.user.is_authenticated else None,
            )

        design_request = AdminDesignRequestDetailAPIView().get_object(pk)
        return admin_response(
            message="وضعیت درخواست طراحی به‌روزرسانی شد.",
            data={
                "design_request": AdminDesignRequestDetailSerializer(
                    design_request,
                    context={"request": request},
                ).data
            },
        )


class AdminDesignRequestResponseUpdateAPIView(APIView):
    permission_classes = [CanManageDesignRequests]

    def post(self, request, pk):
        return self.patch(request, pk)

    def patch(self, request, pk):
        design_request = get_object_or_404(DesignRequest, pk=pk)
        serializer = AdminDesignRequestResponseUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        previous_response = design_request.admin_response
        design_request.admin_response = serializer.validated_data["admin_response"]
        if design_request.admin_response:
            design_request.admin_response_at = timezone.now()
            design_request.responded_by = request.user if request.user.is_authenticated else None
            update_fields = ["admin_response", "admin_response_at", "responded_by", "updated_at"]
        else:
            design_request.admin_response_at = None
            design_request.responded_by = None
            update_fields = ["admin_response", "admin_response_at", "responded_by", "updated_at"]
        design_request.save(update_fields=update_fields)

        if design_request.admin_response and design_request.admin_response != previous_response:
            notify_design_request_admin_reply(design_request)

        if design_request.admin_response != previous_response:
            log_admin_activity(
                request,
                action=AdminActivityLog.Action.DESIGN_REQUEST_REPLIED,
                entity_type="design_request",
                entity_id=design_request.pk,
                description=f"پاسخ مدیریتی درخواست طراحی DR-{design_request.pk:06d} به‌روزرسانی شد.",
            )

        design_request = AdminDesignRequestDetailAPIView().get_object(pk)
        return admin_response(
            message="پاسخ ادمین ثبت شد.",
            data={
                "design_request": AdminDesignRequestDetailSerializer(
                    design_request,
                    context={"request": request},
                ).data
            },
        )


class AdminDesignRequestOrderLinkAPIView(APIView):
    permission_classes = [CanManageDesignRequests]

    def patch(self, request, pk):
        design_request = get_object_or_404(DesignRequest, pk=pk)
        serializer = AdminDesignRequestOrderLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data.get("order_id")
        order = None
        if order_id:
            order = get_object_or_404(Order, pk=order_id)

        design_request.order = order
        design_request.save(update_fields=["order", "updated_at"])
        design_request = AdminDesignRequestDetailAPIView().get_object(pk)

        return admin_response(
            message="ارتباط درخواست طراحی با سفارش به‌روزرسانی شد.",
            data={
                "design_request": AdminDesignRequestDetailSerializer(
                    design_request,
                    context={"request": request},
                ).data
            },
        )


class AdminDesignRequestStatusHistoryAPIView(ListAPIView):
    permission_classes = [CanManageDesignRequests]
    serializer_class = AdminDesignRequestStatusHistorySerializer

    def get_queryset(self):
        design_request = get_object_or_404(DesignRequest, pk=self.kwargs["pk"])
        return design_request.status_history.select_related("created_by")


class AdminDesignRequestInternalNoteListCreateAPIView(APIView):
    permission_classes = [CanManageDesignRequests]

    def get(self, request, pk):
        design_request = get_object_or_404(DesignRequest, pk=pk)
        notes = design_request.internal_notes.select_related("author")
        return Response(AdminDesignRequestInternalNoteSerializer(notes, many=True, context={"request": request}).data)

    def post(self, request, pk):
        design_request = get_object_or_404(DesignRequest, pk=pk)
        serializer = AdminDesignRequestInternalNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = DesignRequestInternalNote.objects.create(
            design_request=design_request,
            author=request.user if request.user.is_authenticated else None,
            text=serializer.validated_data["text"],
        )
        return admin_response(
            message="یادداشت داخلی درخواست طراحی ثبت شد.",
            data={"note": AdminDesignRequestInternalNoteSerializer(note, context={"request": request}).data},
            http_status=status.HTTP_201_CREATED,
        )


class AdminDesignRequestInternalNoteDetailAPIView(APIView):
    permission_classes = [CanManageDesignRequests]

    def get_object(self, pk, note_id):
        return get_object_or_404(
            DesignRequestInternalNote.objects.select_related("author"),
            design_request_id=pk,
            pk=note_id,
        )

    def ensure_can_edit(self, request, note):
        if request.user.is_superuser or note.author_id == request.user.id:
            return None
        return Response(
            {
                "success": False,
                "message": "ویرایش این یادداشت فقط برای نویسنده یا Super Admin مجاز است.",
                "data": {},
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    def patch(self, request, pk, note_id):
        note = self.get_object(pk, note_id)
        permission_response = self.ensure_can_edit(request, note)
        if permission_response:
            return permission_response

        serializer = AdminDesignRequestInternalNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note.text = serializer.validated_data["text"]
        note.save(update_fields=["text", "updated_at"])

        return admin_response(
            message="یادداشت داخلی درخواست طراحی به‌روزرسانی شد.",
            data={"note": AdminDesignRequestInternalNoteSerializer(note, context={"request": request}).data},
        )

    def delete(self, request, pk, note_id):
        note = self.get_object(pk, note_id)
        permission_response = self.ensure_can_edit(request, note)
        if permission_response:
            return permission_response

        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminContactMessageQuerySearchFilter(SearchFilter):
    search_param = "q"


class AdminContactMessageListAPIView(ListAPIView):
    permission_classes = [CanManageContactMessages]
    serializer_class = AdminContactMessageListSerializer
    filter_backends = [DjangoFilterBackend, AdminContactMessageQuerySearchFilter, OrderingFilter]
    filterset_fields = {
        "status": ["exact"],
        "subject": ["exact"],
    }
    search_fields = ["phone", "full_name", "message"]
    ordering_fields = ["created_at", "updated_at", "status", "subject"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return ContactMessage.objects.filter(is_deleted=False).annotate(
            notes_count=Count("internal_notes", distinct=True)
        )


class AdminContactMessageDetailAPIView(APIView):
    permission_classes = [CanManageContactMessages]

    def get_object(self, pk):
        return get_object_or_404(
            ContactMessage.objects.filter(is_deleted=False).annotate(
                notes_count=Count("internal_notes", distinct=True)
            ),
            pk=pk,
        )

    def get(self, request, pk):
        contact_message = self.get_object(pk)
        if contact_message.status == ContactMessage.Status.NEW:
            contact_message.status = ContactMessage.Status.READ
            contact_message.save(update_fields=["status", "updated_at"])
        return Response(AdminContactMessageDetailSerializer(contact_message).data)

    def delete(self, request, pk):
        contact_message = self.get_object(pk)
        contact_message.is_deleted = True
        contact_message.deleted_at = timezone.now()
        contact_message.deleted_by = request.user
        contact_message.save(update_fields=["is_deleted", "deleted_at", "deleted_by", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminContactMessageStatusUpdateAPIView(APIView):
    permission_classes = [CanManageContactMessages]

    def patch(self, request, pk):
        contact_message = get_object_or_404(ContactMessage, pk=pk, is_deleted=False)
        serializer = AdminContactMessageStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact_message.status = serializer.validated_data["status"]
        contact_message.save(update_fields=["status", "updated_at"])
        contact_message = AdminContactMessageDetailAPIView().get_object(pk)
        return admin_response(
            message="وضعیت پیام تماس به‌روزرسانی شد.",
            data={"contact_message": AdminContactMessageDetailSerializer(contact_message).data},
        )


class AdminContactMessageBulkReadAPIView(APIView):
    permission_classes = [CanManageContactMessages]

    def patch(self, request):
        serializer = AdminContactMessageBulkReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_count = ContactMessage.objects.filter(
            pk__in=serializer.validated_data["ids"],
            is_deleted=False,
            status=ContactMessage.Status.NEW,
        ).update(status=ContactMessage.Status.READ, updated_at=timezone.now())
        return admin_response(
            message="پیام‌های انتخاب‌شده به‌عنوان خوانده‌شده ثبت شدند.",
            data={"updated_count": updated_count},
        )


class AdminContactMessageInternalNoteListCreateAPIView(APIView):
    permission_classes = [CanManageContactMessages]

    def get_contact_message(self, pk):
        return get_object_or_404(ContactMessage, pk=pk, is_deleted=False)

    def get(self, request, pk):
        contact_message = self.get_contact_message(pk)
        notes = contact_message.internal_notes.select_related("author")
        return Response(AdminContactMessageInternalNoteSerializer(notes, many=True, context={"request": request}).data)

    def post(self, request, pk):
        contact_message = self.get_contact_message(pk)
        serializer = AdminContactMessageInternalNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note = ContactMessageInternalNote.objects.create(
            contact_message=contact_message,
            author=request.user,
            text=serializer.validated_data["text"],
        )
        return admin_response(
            message="یادداشت داخلی پیام ثبت شد.",
            data={"note": AdminContactMessageInternalNoteSerializer(note, context={"request": request}).data},
            http_status=status.HTTP_201_CREATED,
        )


class AdminContactMessageInternalNoteDetailAPIView(APIView):
    permission_classes = [CanManageContactMessages]

    def get_object(self, pk, note_id):
        return get_object_or_404(
            ContactMessageInternalNote.objects.select_related("author"),
            contact_message_id=pk,
            contact_message__is_deleted=False,
            pk=note_id,
        )

    def ensure_can_edit(self, request, note):
        if request.user.is_superuser or note.author_id == request.user.id:
            return None
        return Response(
            {
                "success": False,
                "message": "ویرایش این یادداشت فقط برای نویسنده یا Super Admin مجاز است.",
                "data": {},
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    def patch(self, request, pk, note_id):
        note = self.get_object(pk, note_id)
        permission_response = self.ensure_can_edit(request, note)
        if permission_response:
            return permission_response
        serializer = AdminContactMessageInternalNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        note.text = serializer.validated_data["text"]
        note.save(update_fields=["text", "updated_at"])
        return admin_response(
            message="یادداشت داخلی پیام به‌روزرسانی شد.",
            data={"note": AdminContactMessageInternalNoteSerializer(note, context={"request": request}).data},
        )

    def delete(self, request, pk, note_id):
        note = self.get_object(pk, note_id)
        permission_response = self.ensure_can_edit(request, note)
        if permission_response:
            return permission_response
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def get_admin_customer_queryset():
    return (
        User.objects.filter(is_staff=False, is_superuser=False, admin_role="")
        .annotate(
            order_count=Count("orders", distinct=True),
            total_order_amount=Sum(
                "orders__total_amount",
                filter=~Q(orders__status=Order.Status.CANCELLED),
                default=0,
            ),
            last_order_at=Max("orders__created_at"),
        )
    )


class AdminCustomerQuerySearchFilter(SearchFilter):
    search_param = "q"


class AdminCustomerListAPIView(ListAPIView):
    permission_classes = [CanManageCustomers]
    serializer_class = AdminCustomerListSerializer
    filter_backends = [DjangoFilterBackend, AdminCustomerQuerySearchFilter, OrderingFilter]
    filterset_fields = {"is_active": ["exact"]}
    search_fields = ["first_name", "last_name", "email", "phone_number"]
    ordering_fields = ["date_joined", "last_order_at", "order_count", "total_order_amount", "email"]
    ordering = ["-date_joined"]

    def get_queryset(self):
        return get_admin_customer_queryset()


class AdminCustomerDetailAPIView(APIView):
    permission_classes = [CanManageCustomers]

    def get(self, request, pk):
        customer = get_object_or_404(
            get_admin_customer_queryset().prefetch_related("addresses"),
            pk=pk,
        )
        return Response(AdminCustomerDetailSerializer(customer, context={"request": request}).data)


class AdminCustomerFilePagination(PageNumberPagination):
    page_size = 10


class AdminCustomerFileListAPIView(APIView):
    permission_classes = [CanManageCustomerFiles]

    def get(self, request):
        source = request.query_params.get("source", "")
        query = (request.query_params.get("q") or "").strip().lower()

        records = []

        if source in ["", "design"]:
            design_files = UploadedFile.objects.select_related("uploaded_by").prefetch_related("design_requests")
            records.extend(build_design_file_record(item, request) for item in design_files)

        if source in ["", "support"]:
            support_files = SupportAttachment.objects.select_related(
                "message__sender",
                "message__ticket__order",
            )
            records.extend(build_support_file_record(item, request) for item in support_files)

        if query:
            records = [
                item
                for item in records
                if query in item["filename"].lower()
                or query in item["related_label"].lower()
                or query in item["uploaded_by_label"].lower()
                or query in item["order_number"].lower()
            ]

        records.sort(key=lambda item: item["created_at"], reverse=True)
        paginator = AdminCustomerFilePagination()
        page = paginator.paginate_queryset(records, request, view=self)
        serializer = AdminCustomerFileSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


def get_customer_file_object(source, pk):
    if source == "design":
        obj = get_object_or_404(UploadedFile, pk=pk)
        return obj.file, obj.original_name, obj.content_type
    if source == "support":
        obj = get_object_or_404(SupportAttachment, pk=pk)
        return obj.file, obj.filename, obj.mime_type
    return None, "", ""


class AdminCustomerFileServeAPIView(APIView):
    permission_classes = [CanManageCustomerFiles]
    as_attachment = True

    def get(self, request, source, pk):
        file_field, filename, mime_type = get_customer_file_object(source, pk)
        if not file_field:
            return Response({"detail": "فایل پیدا نشد."}, status=status.HTTP_404_NOT_FOUND)

        content_type = normalize_customer_content_type(mime_type, filename)
        if not self.as_attachment and content_type not in PREVIEWABLE_CUSTOMER_FILE_TYPES:
            return Response({"detail": "Preview برای این نوع فایل مجاز نیست."}, status=status.HTTP_400_BAD_REQUEST)

        file_field.open("rb")

        action = (
            AdminActivityLog.Action.SENSITIVE_FILE_DOWNLOADED
            if self.as_attachment
            else AdminActivityLog.Action.SENSITIVE_FILE_VIEWED
        )
        action_label = "دانلود" if self.as_attachment else "مشاهده"
        log_admin_activity(
            request,
            action=action,
            entity_type="customer_file",
            entity_id=f"{source}:{pk}",
            description=f"فایل حساس «{filename}» از منبع {source} {action_label} شد.",
        )

        response = FileResponse(
            file_field,
            as_attachment=self.as_attachment,
            filename=filename,
            content_type=content_type,
        )
        response["X-Content-Type-Options"] = "nosniff"
        response["Content-Security-Policy"] = "sandbox"
        return response


class AdminCustomerFilePreviewAPIView(AdminCustomerFileServeAPIView):
    as_attachment = False
