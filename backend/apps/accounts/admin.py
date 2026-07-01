from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.admin_panel.models import AdminActivityLog
from apps.admin_panel.services import log_admin_activity

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


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {"fields": ("phone_number", "phone_verified", "email_verified", "avatar", "admin_role")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Additional Info", {"fields": ("phone_number", "phone_verified", "email_verified", "avatar", "admin_role")}),
    )
    list_display = ("username", "email", "phone_number", "admin_role", "email_verified", "phone_verified", "is_staff", "is_active")
    list_filter = UserAdmin.list_filter + ("admin_role",)
    search_fields = ("username", "email", "phone_number")

    def save_model(self, request, obj, form, change):
        access_fields = {"admin_role", "is_staff", "is_superuser", "is_active"}
        access_changed = bool(access_fields.intersection(form.changed_data))
        super().save_model(request, obj, form, change)

        if access_changed:
            changed_labels = "، ".join(sorted(access_fields.intersection(form.changed_data)))
            log_admin_activity(
                request,
                action=AdminActivityLog.Action.ADMIN_ACCESS_CHANGED,
                entity_type="admin_user",
                entity_id=obj.pk,
                description=f"دسترسی کاربر {obj.email} تغییر کرد. فیلدها: {changed_labels}",
            )


@admin.register(VerificationChallenge)
class VerificationChallengeAdmin(admin.ModelAdmin):
    list_display = ["user", "channel", "purpose", "destination", "attempts", "expires_at", "consumed_at", "created_at"]
    list_filter = ["channel", "purpose", "consumed_at", "created_at"]
    search_fields = ["user__email", "destination"]
    readonly_fields = ["code_hash", "created_at", "verified_at", "consumed_at"]


@admin.register(CustomerAddress)
class CustomerAddressAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "receiver_name", "phone", "city", "is_default", "updated_at"]
    list_filter = ["is_default", "province", "city"]
    search_fields = ["user__email", "receiver_name", "phone", "address", "postal_code"]


@admin.register(CustomerOffer)
class CustomerOfferAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "offer_type", "discount_type", "discount_value", "coupon_code", "status", "is_active", "expires_at"]
    list_filter = ["offer_type", "discount_type", "is_active", "created_at"]
    search_fields = ["title", "user__email", "coupon_code"]


class SupportAttachmentInline(admin.TabularInline):
    model = SupportAttachment
    extra = 0
    readonly_fields = ["filename", "file_size", "mime_type"]


class SupportMessageInline(admin.StackedInline):
    model = SupportMessage
    extra = 0
    readonly_fields = ["created_at"]
    show_change_link = True


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ["id", "subject", "user", "order", "category", "priority", "status", "updated_at"]
    list_filter = ["category", "priority", "status", "created_at"]
    search_fields = ["subject", "user__email", "order__order_number"]
    inlines = [SupportMessageInline]


@admin.register(SupportMessage)
class SupportMessageAdmin(admin.ModelAdmin):
    list_display = ["ticket", "sender", "is_staff_message", "is_read_by_customer", "created_at"]
    list_filter = ["is_staff_message", "is_read_by_customer", "created_at"]
    search_fields = ["ticket__subject", "sender__email", "message"]
    inlines = [SupportAttachmentInline]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "event_type", "is_read", "created_at"]
    list_filter = ["event_type", "is_read", "created_at"]
    search_fields = ["title", "message", "user__email"]
