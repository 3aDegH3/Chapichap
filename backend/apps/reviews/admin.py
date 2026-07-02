from django.contrib import admin

from .models import Review
from .services import set_review_status


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "product",
        "user",
        "rating",
        "status",
        "is_verified_purchase",
        "is_reported",
        "created_at",
    )
    list_filter = ("status", "rating", "is_verified_purchase", "is_reported", "created_at")
    search_fields = ("title", "body", "product__title", "user__email")
    readonly_fields = (
        "is_verified_purchase",
        "approved_at",
        "deleted_at",
        "deleted_by",
        "created_at",
        "updated_at",
    )
    actions = ("approve_selected", "reject_selected", "hide_selected")

    @admin.action(description="تأیید نظرات انتخاب‌شده")
    def approve_selected(self, request, queryset):
        for review in queryset:
            set_review_status(review=review, status=Review.Status.APPROVED)

    @admin.action(description="رد نظرات انتخاب‌شده")
    def reject_selected(self, request, queryset):
        for review in queryset:
            set_review_status(review=review, status=Review.Status.REJECTED)

    @admin.action(description="مخفی‌کردن نظرات انتخاب‌شده")
    def hide_selected(self, request, queryset):
        for review in queryset:
            set_review_status(review=review, status=Review.Status.HIDDEN)

