from django.contrib import admin

from .models import Portfolio, PortfolioImage


class PortfolioImageInline(admin.TabularInline):
    model = PortfolioImage
    extra = 1
    fields = ("image", "alt_text", "sort_order")


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "work_type",
        "client_name",
        "is_featured",
        "is_active",
        "completed_at",
    )
    list_filter = ("work_type", "is_featured", "is_active")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "client_name", "short_description", "description")
    inlines = [PortfolioImageInline]


@admin.register(PortfolioImage)
class PortfolioImageAdmin(admin.ModelAdmin):
    list_display = ("portfolio", "alt_text", "sort_order", "created_at")
    list_filter = ("portfolio__work_type",)
    search_fields = ("portfolio__title", "alt_text")
