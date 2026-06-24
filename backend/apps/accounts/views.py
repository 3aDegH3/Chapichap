import random
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from apps.design_request.models import DesignRequest
from apps.orders.models import Order
from apps.orders.serializers import OrderSerializer
from apps.orders.views import get_order_queryset_for_request

from .models import (
    CustomerAddress,
    CustomerOffer,
    Notification,
    SupportAttachment,
    SupportMessage,
    SupportTicket,
    User,
    VerificationChallenge,
)
from .serializers import (
    ChangePasswordSerializer,
    CustomerAddressSerializer,
    CustomerOfferSerializer,
    EmailRequestCodeSerializer,
    EmailVerifySerializer,
    ForgotPasswordSerializer,
    LoginSerializer,
    NotificationSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    SupportMessageCreateSerializer,
    SupportTicketCreateSerializer,
    SupportTicketSerializer,
    UserSerializer,
)


class EmailDeliveryError(Exception):
    pass


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


def api_response(success=True, message="Operation completed successfully", data=None, errors=None, http_status=status.HTTP_200_OK):
    payload = {"success": success, "message": message, "data": data if data is not None else {}}
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=http_status)


def create_email_challenge(user, purpose=VerificationChallenge.Purpose.EMAIL_VERIFY):
    if settings.EMAIL_BACKEND.endswith("smtp.EmailBackend") and not settings.EMAIL_HOST_PASSWORD:
        raise EmailDeliveryError("ارسال ایمیل فعال نیست. EMAIL_HOST_PASSWORD را با App Password جیمیل تنظیم کن.")

    code = f"{random.randint(0, 999999):06d}"
    now = timezone.now()
    challenge = VerificationChallenge.objects.create(
        user=user,
        channel=VerificationChallenge.Channel.EMAIL,
        purpose=purpose,
        destination=user.email,
        code_hash=make_password(code),
        expires_at=now + timezone.timedelta(minutes=10),
        resend_available_at=now + timezone.timedelta(seconds=60),
    )

    try:
        send_mail(
            subject="کد تایید چاپی‌چاپ",
            message=f"کد تایید شما: {code}\nاین کد تا ۱۰ دقیقه معتبر است.",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@chapichap.local"),
            recipient_list=[user.email],
            fail_silently=False,
        )
    except Exception as exc:
        challenge.delete()
        raise EmailDeliveryError("ارسال ایمیل تایید ناموفق بود. تنظیمات SMTP جیمیل را بررسی کن.") from exc

    VerificationChallenge.objects.filter(
        user=user,
        channel=VerificationChallenge.Channel.EMAIL,
        purpose=purpose,
        consumed_at__isnull=True,
    ).exclude(pk=challenge.pk).update(consumed_at=now)
    return challenge


def verify_email_code(user, code, purpose):
    challenge = VerificationChallenge.objects.filter(
        user=user,
        channel=VerificationChallenge.Channel.EMAIL,
        purpose=purpose,
        consumed_at__isnull=True,
    ).order_by("-created_at").first()

    if not challenge:
        return False, "کد تایید فعال پیدا نشد."
    if challenge.is_expired:
        return False, "کد تایید منقضی شده است."
    if challenge.attempts >= 5:
        return False, "تعداد تلاش ناموفق بیش از حد مجاز است."
    if not check_password(code, challenge.code_hash):
        challenge.attempts += 1
        challenge.save(update_fields=["attempts"])
        return False, "کد تایید اشتباه است."

    now = timezone.now()
    challenge.verified_at = now
    challenge.consumed_at = now
    challenge.save(update_fields=["verified_at", "consumed_at"])
    return True, "کد تایید شد."


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            email_sent = True
            email_message = "کد تایید ایمیل ارسال شد."
            try:
                create_email_challenge(user)
            except EmailDeliveryError as error:
                email_sent = False
                email_message = str(error)
            return api_response(
                message=f"ثبت‌نام با موفقیت انجام شد. {email_message}",
                data={
                    "user": UserSerializer(user).data,
                    "tokens": get_tokens_for_user(user),
                    "email_sent": email_sent,
                },
                http_status=status.HTTP_201_CREATED,
            )
        return api_response(False, "ثبت‌نام ناموفق بود.", errors=serializer.errors, http_status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            return api_response(message="ورود با موفقیت انجام شد.", data={"user": UserSerializer(user).data, "tokens": get_tokens_for_user(user)})
        return api_response(False, "ورود ناموفق بود.", errors=serializer.errors, http_status=status.HTTP_400_BAD_REQUEST)


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return api_response(False, "Refresh token ارسال نشده است.", http_status=status.HTTP_400_BAD_REQUEST)
        try:
            RefreshToken(refresh_token).blacklist()
            return api_response(message="خروج با موفقیت انجام شد.")
        except TokenError:
            return api_response(False, "توکن نامعتبر است یا قبلاً منقضی شده است.", http_status=status.HTTP_400_BAD_REQUEST)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(message="اطلاعات کاربر دریافت شد.", data={"user": UserSerializer(request.user).data})


class EmailRequestCodeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EmailRequestCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            create_email_challenge(request.user, serializer.validated_data.get("purpose", "email_verify"))
        except EmailDeliveryError as error:
            return api_response(False, str(error), http_status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return api_response(message="کد تایید ایمیل ارسال شد.")


class EmailVerifyAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        purpose = serializer.validated_data.get("purpose", "email_verify")
        ok, message = verify_email_code(request.user, serializer.validated_data["code"], purpose)
        if not ok:
            return api_response(False, message, http_status=status.HTTP_400_BAD_REQUEST)
        if purpose == "email_verify":
            request.user.email_verified = True
            request.user.save(update_fields=["email_verified"])
        return api_response(message=message, data={"user": UserSerializer(request.user).data})


class ForgotPasswordAPIView(APIView):
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if user:
            try:
                create_email_challenge(user, VerificationChallenge.Purpose.PASSWORD_RESET)
            except EmailDeliveryError as error:
                return api_response(False, str(error), http_status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return api_response(message="اگر ایمیل در سیستم وجود داشته باشد، کد بازیابی ارسال می‌شود.")


class ResetPasswordAPIView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email__iexact=serializer.validated_data["email"]).first()
        if not user:
            return api_response(False, "کد یا ایمیل معتبر نیست.", http_status=status.HTTP_400_BAD_REQUEST)
        ok, message = verify_email_code(user, serializer.validated_data["code"], VerificationChallenge.Purpose.PASSWORD_RESET)
        if not ok:
            return api_response(False, message, http_status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return api_response(message="رمز عبور با موفقیت تغییر کرد.")


class AccountDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile_fields = [user.first_name, user.last_name, user.email, user.phone_number]
        active_orders = Order.objects.filter(user=user).exclude(status__in=[Order.Status.DELIVERED, Order.Status.CANCELLED])
        latest_order = Order.objects.filter(user=user).prefetch_related("items", "payments", "status_history").first()
        latest_design = DesignRequest.objects.filter(user=user).order_by("-created_at").first()
        active_offer = CustomerOffer.objects.filter(user=user, is_active=True).order_by("-created_at").first()

        return api_response(
            data={
                "user": UserSerializer(user).data,
                "profile_completion": int((sum(1 for item in profile_fields if item) / len(profile_fields)) * 100),
                "active_orders_count": active_orders.count(),
                "design_requests_count": DesignRequest.objects.filter(user=user).count(),
                "open_tickets_count": SupportTicket.objects.filter(user=user).exclude(status__in=[SupportTicket.Status.RESOLVED, SupportTicket.Status.CLOSED]).count(),
                "unread_notifications_count": Notification.objects.filter(user=user, is_read=False).count(),
                "latest_order": OrderSerializer(latest_order, context={"request": request}).data if latest_order else None,
                "latest_design_request": {
                    "id": latest_design.id,
                    "order_type_label": latest_design.get_order_type_display(),
                    "status_label": latest_design.get_status_display(),
                    "created_at": latest_design.created_at,
                } if latest_design else None,
                "active_offer": CustomerOfferSerializer(active_offer).data if active_offer else None,
            }
        )


class AccountProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(data={"user": UserSerializer(request.user).data})

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_response(message="پروفایل به‌روزرسانی شد.", data={"user": serializer.data})


class AccountPasswordChangeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["current_password"]):
            return api_response(False, "رمز فعلی اشتباه است.", http_status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return api_response(message="رمز عبور تغییر کرد.")


class AddressListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(data={"addresses": CustomerAddressSerializer(CustomerAddress.objects.filter(user=request.user), many=True).data})

    def post(self, request):
        serializer = CustomerAddressSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        address = serializer.save()
        return api_response(message="آدرس ذخیره شد.", data={"address": CustomerAddressSerializer(address).data}, http_status=status.HTTP_201_CREATED)


class AddressDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        return CustomerAddress.objects.get(user=request.user, pk=pk)

    def patch(self, request, pk):
        try:
            address = self.get_object(request, pk)
        except CustomerAddress.DoesNotExist:
            return api_response(False, "آدرس پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        serializer = CustomerAddressSerializer(address, data=request.data, partial=True, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return api_response(message="آدرس به‌روزرسانی شد.", data={"address": serializer.data})

    def delete(self, request, pk):
        try:
            self.get_object(request, pk).delete()
        except CustomerAddress.DoesNotExist:
            return api_response(False, "آدرس پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        return api_response(message="آدرس حذف شد.")


class AddressSetDefaultAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            address = CustomerAddress.objects.get(user=request.user, pk=pk)
        except CustomerAddress.DoesNotExist:
            return api_response(False, "آدرس پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        CustomerAddress.objects.filter(user=request.user).update(is_default=False)
        address.is_default = True
        address.save(update_fields=["is_default", "updated_at"])
        return api_response(message="آدرس پیش‌فرض شد.", data={"address": CustomerAddressSerializer(address).data})


class AccountOrdersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = get_order_queryset_for_request(request)
        return api_response(data={"orders": OrderSerializer(queryset, many=True, context={"request": request}).data})


class AccountOrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_order_queryset_for_request(request).filter(pk=pk).first()
        if not order:
            return api_response(False, "سفارش پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        return api_response(data={"order": OrderSerializer(order, context={"request": request}).data})


class AccountOrderStatusHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        order = get_order_queryset_for_request(request).filter(pk=pk).first()
        if not order:
            return api_response(False, "سفارش پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        return api_response(data={"history": list(order.status_history.filter(visible_to_customer=True).values("id", "previous_status", "new_status", "title", "description", "created_at"))})


class AccountOffersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(data={"offers": CustomerOfferSerializer(CustomerOffer.objects.filter(user=request.user), many=True).data})


class ValidateOfferAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        code = request.data.get("coupon_code", "").strip()
        try:
            order_amount = Decimal(str(request.data.get("order_amount", "0") or "0"))
            shipping_cost = Decimal(str(request.data.get("shipping_cost", "0") or "0"))
        except Exception:
            return api_response(False, "مبلغ سفارش معتبر نیست.", http_status=status.HTTP_400_BAD_REQUEST)

        offer = CustomerOffer.objects.filter(user=request.user, coupon_code__iexact=code).first()
        if not offer or offer.status != "active":
            return api_response(False, "این پیشنهاد معتبر نیست.", http_status=status.HTTP_400_BAD_REQUEST)
        if order_amount < offer.minimum_order_amount:
            return api_response(False, "مبلغ سفارش برای این پیشنهاد کافی نیست.", http_status=status.HTTP_400_BAD_REQUEST)

        discount = Decimal("0")
        if offer.discount_type == CustomerOffer.DiscountType.PERCENT:
            discount = (order_amount * offer.discount_value) / Decimal("100")
        elif offer.discount_type == CustomerOffer.DiscountType.FIXED:
            discount = min(order_amount, offer.discount_value)
        elif offer.discount_type == CustomerOffer.DiscountType.FREE_SHIPPING:
            discount = min(order_amount, shipping_cost)
        return api_response(data={"offer": CustomerOfferSerializer(offer).data, "discount_amount": discount, "final_amount": max(order_amount - discount, Decimal("0"))})


def create_support_attachments(request, message):
    allowed_types = {"image/jpeg", "image/png", "image/webp", "application/pdf", "application/zip"}
    for file in request.FILES.getlist("files"):
        mime_type = getattr(file, "content_type", "")
        if mime_type and mime_type not in allowed_types:
            continue
        if file.size > 10 * 1024 * 1024:
            continue
        SupportAttachment.objects.create(message=message, file=file, filename=file.name, file_size=file.size, mime_type=mime_type)


class TicketListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        tickets = SupportTicket.objects.filter(user=request.user).prefetch_related("messages__attachments")
        return api_response(data={"tickets": SupportTicketSerializer(tickets, many=True, context={"request": request}).data})

    def post(self, request):
        serializer = SupportTicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = None
        if serializer.validated_data.get("order"):
            order = Order.objects.filter(user=request.user, id=serializer.validated_data["order"]).first()
        ticket = SupportTicket.objects.create(
            user=request.user,
            order=order,
            subject=serializer.validated_data["subject"],
            category=serializer.validated_data["category"],
            priority=serializer.validated_data["priority"],
            status=SupportTicket.Status.AWAITING_SUPPORT,
        )
        message = SupportMessage.objects.create(ticket=ticket, sender=request.user, message=serializer.validated_data["message"])
        create_support_attachments(request, message)
        return api_response(message="تیکت ثبت شد.", data={"ticket": SupportTicketSerializer(ticket, context={"request": request}).data}, http_status=status.HTTP_201_CREATED)


class TicketDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        ticket = SupportTicket.objects.filter(user=request.user, pk=pk).prefetch_related("messages__attachments").first()
        if not ticket:
            return api_response(False, "تیکت پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        ticket.messages.filter(is_staff_message=True, is_read_by_customer=False).update(is_read_by_customer=True)
        return api_response(data={"ticket": SupportTicketSerializer(ticket, context={"request": request}).data})


class TicketMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        ticket = SupportTicket.objects.filter(user=request.user, pk=pk).first()
        if not ticket:
            return api_response(False, "تیکت پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        serializer = SupportMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = SupportMessage.objects.create(ticket=ticket, sender=request.user, message=serializer.validated_data["message"])
        create_support_attachments(request, message)
        ticket.status = SupportTicket.Status.AWAITING_SUPPORT
        ticket.save(update_fields=["status", "updated_at"])
        return api_response(message="پیام ارسال شد.", data={"ticket": SupportTicketSerializer(ticket, context={"request": request}).data})


class TicketCloseAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        ticket = SupportTicket.objects.filter(user=request.user, pk=pk).first()
        if not ticket:
            return api_response(False, "تیکت پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        ticket.status = SupportTicket.Status.CLOSED
        ticket.closed_at = timezone.now()
        ticket.save(update_fields=["status", "closed_at", "updated_at"])
        return api_response(message="تیکت بسته شد.")


class NotificationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return api_response(data={"notifications": NotificationSerializer(Notification.objects.filter(user=request.user), many=True).data})


class NotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        updated = Notification.objects.filter(user=request.user, pk=pk).update(is_read=True)
        if not updated:
            return api_response(False, "اعلان پیدا نشد.", http_status=status.HTTP_404_NOT_FOUND)
        return api_response(message="اعلان خوانده شد.")


class NotificationsReadAllAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return api_response(message="همه اعلان‌ها خوانده شدند.")
