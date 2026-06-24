from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = [
        "full_name",
        "phone",
        "subject",
        "status",
        "contact_permission",
        "created_at",
    ]
    list_filter = ["subject", "status", "contact_permission", "created_at"]
    search_fields = ["full_name", "phone", "message"]
    readonly_fields = ["ip_address", "user_agent", "created_at", "updated_at"]
