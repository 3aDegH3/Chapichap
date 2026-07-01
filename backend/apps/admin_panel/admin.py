from django.contrib import admin

from .models import AdminActivityLog


@admin.register(AdminActivityLog)
class AdminActivityLogAdmin(admin.ModelAdmin):
    list_display = ["actor", "action", "entity_type", "entity_id", "ip_address", "created_at"]
    list_filter = ["action", "entity_type", "created_at"]
    search_fields = ["actor__email", "actor__first_name", "actor__last_name", "entity_id", "description"]
    readonly_fields = ["actor", "action", "entity_type", "entity_id", "description", "ip_address", "created_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
