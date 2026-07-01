from django.urls import path

from .views import (
    EmailRequestCodeAPIView,
    EmailVerifyAPIView,
    ForgotPasswordAPIView,
    RegisterAPIView,
    LoginAPIView,
    LogoutAPIView,
    MeAPIView,
    ResetPasswordAPIView,
)


urlpatterns = [
    path("register/", RegisterAPIView.as_view(), name="auth-register"),
    path("login/", LoginAPIView.as_view(), name="auth-login"),
    path("logout/", LogoutAPIView.as_view(), name="auth-logout"),
    path("me/", MeAPIView.as_view(), name="auth-me"),
    path("email/request-code/", EmailRequestCodeAPIView.as_view(), name="auth-email-request-code"),
    path("email/verify/", EmailVerifyAPIView.as_view(), name="auth-email-verify"),
    path("forgot-password/", ForgotPasswordAPIView.as_view(), name="auth-forgot-password"),
    path("reset-password/", ResetPasswordAPIView.as_view(), name="auth-reset-password"),
]
