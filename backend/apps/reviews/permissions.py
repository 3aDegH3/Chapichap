from rest_framework.permissions import BasePermission


class IsReviewOwner(BasePermission):
    message = "فقط صاحب نظر می‌تواند آن را تغییر دهد."

    def has_object_permission(self, request, view, obj):
        return bool(request.user.is_authenticated and obj.user_id == request.user.id)

