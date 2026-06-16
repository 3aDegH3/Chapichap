from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class RegisterAPIView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)

            return Response(
                {
                    "success": True,
                    "message": "ثبت‌نام با موفقیت انجام شد.",
                    "data": {
                        "user": UserSerializer(user).data,
                        "tokens": tokens,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            {
                "success": False,
                "message": "ثبت‌نام ناموفق بود.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginAPIView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            tokens = get_tokens_for_user(user)

            return Response(
                {
                    "success": True,
                    "message": "ورود با موفقیت انجام شد.",
                    "data": {
                        "user": UserSerializer(user).data,
                        "tokens": tokens,
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "success": False,
                "message": "ورود ناموفق بود.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "success": False,
                    "message": "Refresh token ارسال نشده است.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {
                    "success": True,
                    "message": "خروج با موفقیت انجام شد.",
                },
                status=status.HTTP_200_OK,
            )

        except TokenError:
            return Response(
                {
                    "success": False,
                    "message": "توکن نامعتبر است یا قبلاً منقضی شده است.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            {
                "success": True,
                "message": "اطلاعات کاربر دریافت شد.",
                "data": {
                    "user": UserSerializer(request.user).data,
                },
            },
            status=status.HTTP_200_OK,
        )