from django.contrib import admin

from .models import DesignRequest, UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ["id", "original_name", "content_type", "size", "uploaded_by", "created_at"]
    search_fields = ["original_name", "uploaded_by__email"]
    readonly_fields = ["created_at"]


@admin.register(DesignRequest)
class DesignRequestAdmin(admin.ModelAdmin):
    list_display = ["id", "order_type", "contact_name", "contact_phone", "status", "created_at"]
    list_filter = ["order_type", "status", "created_at"]
    search_fields = ["contact_name", "contact_phone", "contact_email", "description"]
    readonly_fields = ["created_at", "updated_at"]
