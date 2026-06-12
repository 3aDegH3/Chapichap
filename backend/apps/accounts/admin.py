from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {
            "fields": ("phone_number", "phone_verified", "avatar")
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Additional Info", {
            "fields": ("phone_number", "phone_verified", "avatar")
        }),
    )

    list_display = ("username", "email", "phone_number", "is_staff", "is_active")
    search_fields = ("username", "email", "phone_number")