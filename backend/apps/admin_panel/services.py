from .models import AdminActivityLog


def get_request_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip() or None
    return request.META.get("REMOTE_ADDR") or None


def log_admin_activity(
    request,
    *,
    action,
    entity_type,
    entity_id,
    description,
):
    user = getattr(request, "user", None)
    actor = user if user and user.is_authenticated else None
    return AdminActivityLog.objects.create(
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        description=description,
        ip_address=get_request_ip(request),
    )
