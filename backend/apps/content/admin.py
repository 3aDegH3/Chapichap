from django.contrib import admin

from .models import ContactMessage, ContactMessageInternalNote


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "phone",
        "subject",
        "status",
        "contact_permission",
        "is_deleted",
        "created_at",
    ]
    list_filter = ["subject", "status", "contact_permission", "is_deleted", "created_at"]
    search_fields = ["full_name", "phone", "message"]
    readonly_fields = ["ip_address", "user_agent", "deleted_at", "deleted_by", "created_at", "updated_at"]


@admin.register(ContactMessageInternalNote)
class ContactMessageInternalNoteAdmin(admin.ModelAdmin):
    list_display = ["contact_message", "author", "created_at", "updated_at"]
    search_fields = ["contact_message__full_name", "contact_message__phone", "text"]
    readonly_fields = ["created_at", "updated_at"]
