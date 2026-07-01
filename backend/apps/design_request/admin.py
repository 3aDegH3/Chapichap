from django.contrib import admin
from django.utils import timezone

from apps.accounts.services import notify_design_request_admin_reply

from .models import DesignRequest, DesignRequestInternalNote, DesignRequestStatusHistory, UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ["id", "original_name", "content_type", "size", "uploaded_by", "created_at"]
    search_fields = ["original_name", "uploaded_by__email"]
    readonly_fields = ["created_at"]


@admin.register(DesignRequest)
class DesignRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "order_type", "contact_name", "contact_phone", "status", "order", "has_admin_response", "created_at"]
    list_filter = ["order_type", "status", "created_at"]
    search_fields = ["contact_name", "contact_phone", "contact_email", "description", "admin_response", "order__order_number"]
    readonly_fields = ["admin_response_at", "responded_by", "created_at", "updated_at"]

    fieldsets = [
        (
            "درخواست",
            {
                "fields": [
                    "user",
                    "product",
                    "order",
                    "order_type",
                    "description",
                    "uploaded_file",
                    "status",
                ]
            },
        ),
        (
            "اطلاعات تماس",
            {"fields": ["contact_name", "contact_phone", "contact_email"]},
        ),
        (
            "پاسخ ادمین",
            {"fields": ["admin_response", "admin_response_at", "responded_by"]},
        ),
        ("زمان‌ها", {"fields": ["created_at", "updated_at"]}),
    ]

    def has_admin_response(self, obj):
        return bool(obj.admin_response)

    has_admin_response.boolean = True
    has_admin_response.short_description = "پاسخ"

    def save_model(self, request, obj, form, change):
        previous_response = ""
        if change and obj.pk:
            previous_response = (
                DesignRequest.objects.filter(pk=obj.pk)
                .values_list("admin_response", flat=True)
                .first()
                or ""
            )

        response_changed = "admin_response" in form.changed_data
        if obj.admin_response and response_changed:
            obj.admin_response_at = timezone.now()
            obj.responded_by = request.user if request.user.is_authenticated else None

        super().save_model(request, obj, form, change)

        if obj.admin_response and obj.admin_response != previous_response:
            notify_design_request_admin_reply(obj)


@admin.register(DesignRequestStatusHistory)
class DesignRequestStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ["design_request", "previous_status", "new_status", "created_by", "created_at"]
    list_filter = ["new_status", "created_at"]
    search_fields = ["design_request__contact_name", "design_request__contact_phone", "note", "created_by__email"]
    readonly_fields = ["created_at"]


@admin.register(DesignRequestInternalNote)
class DesignRequestInternalNoteAdmin(admin.ModelAdmin):
    list_display = ["design_request", "author", "created_at", "updated_at"]
    search_fields = ["design_request__contact_name", "design_request__contact_phone", "text", "author__email"]
    readonly_fields = ["created_at", "updated_at"]
