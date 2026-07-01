from django.contrib.auth import get_user_model
from django.db import transaction

from .notification_adapters import (
    DatabaseNotificationAdapter,
    EmailNotificationAdapter,
    SmsNotificationAdapter,
)
from .notification_events import NotificationEvent
from .notification_templates import get_order_status_message, render_notification


DATABASE_ADAPTER = DatabaseNotificationAdapter()
EMAIL_ADAPTER = EmailNotificationAdapter()
SMS_ADAPTER = SmsNotificationAdapter()


def get_default_adapters():
    return [DATABASE_ADAPTER]


def is_valid_recipient(user):
    return bool(user and getattr(user, "is_authenticated", False) and getattr(user, "is_active", True))


def send_notification_event(user, *, event_type, context=None, adapters=None):
    if not is_valid_recipient(user):
        return

    rendered = render_notification(event_type, context or {})
    if context and context.get("link"):
        rendered["link"] = context["link"]
    active_adapters = adapters or get_default_adapters()

    def dispatch():
        for adapter in active_adapters:
            adapter.send(
                recipient=user,
                event_type=event_type,
                title=rendered["title"],
                message=rendered["message"],
                link=rendered["link"],
                context=context or {},
            )

    transaction.on_commit(dispatch)


def notify_user(user, *, title, message, event_type, link=""):
    if not is_valid_recipient(user):
        return

    def create_notification():
        DATABASE_ADAPTER.send(
            recipient=user,
            event_type=event_type,
            title=title,
            message=message,
            link=link,
        )

    transaction.on_commit(create_notification)


def notify_staff_users(*, event_type, context=None):
    User = get_user_model()
    staff_users = list(User.objects.filter(is_active=True, is_staff=True))

    for user in staff_users:
        send_notification_event(user, event_type=event_type, context=context or {})


def notify_order_registered(order):
    send_notification_event(
        order.user,
        event_type=NotificationEvent.ORDER_REGISTERED,
        context={"order_id": order.id, "order_number": order.order_number},
    )


def notify_order_status_changed(order, *, previous_status="", new_status="", actor=None):
    send_notification_event(
        order.user,
        event_type=NotificationEvent.ORDER_STATUS_CHANGED,
        context={
            "order_id": order.id,
            "order_number": order.order_number,
            "previous_status": previous_status,
            "new_status": new_status or order.status,
            "status_message": get_order_status_message(new_status or order.status),
        },
    )


def notify_payment_successful(payment):
    send_notification_event(
        payment.order.user,
        event_type=NotificationEvent.PAYMENT_SUCCESSFUL,
        context={
            "order_id": payment.order_id,
            "order_number": payment.order_number or payment.order.order_number,
        },
    )


def notify_payment_failed(payment):
    send_notification_event(
        payment.order.user,
        event_type=NotificationEvent.PAYMENT_FAILED,
        context={
            "order_id": payment.order_id,
            "order_number": payment.order_number or payment.order.order_number,
        },
    )


def notify_design_request_received(design_request):
    context = {
        "design_request_id": design_request.id,
        "order_type_label": design_request.get_order_type_display(),
        "contact_name": design_request.contact_name,
    }

    send_notification_event(
        design_request.user,
        event_type=NotificationEvent.DESIGN_REQUEST_RECEIVED,
        context=context,
    )
    staff_context = {
        **context,
        "link": f"/admin/design-requests/{design_request.id}",
    }
    notify_staff_users(event_type=NotificationEvent.DESIGN_REQUEST_RECEIVED, context=staff_context)


def notify_design_request_admin_reply(design_request):
    send_notification_event(
        design_request.user,
        event_type=NotificationEvent.DESIGN_REQUEST_ADMIN_REPLY,
        context={
            "design_request_id": design_request.id,
            "order_type_label": design_request.get_order_type_display(),
        },
    )


def notify_contact_message_created(contact_message):
    notify_staff_users(
        event_type=NotificationEvent.CONTACT_MESSAGE_CREATED,
        context={
            "contact_message_id": contact_message.id,
            "full_name": contact_message.full_name,
            "subject_label": contact_message.get_subject_display(),
        },
    )


def notify_ticket_created(ticket):
    send_notification_event(
        ticket.user,
        event_type=NotificationEvent.TICKET_CREATED,
        context={"ticket_id": ticket.id, "subject": ticket.subject},
    )


def notify_ticket_closed(ticket):
    send_notification_event(
        ticket.user,
        event_type=NotificationEvent.TICKET_CLOSED,
        context={"ticket_id": ticket.id, "subject": ticket.subject},
    )


def notify_support_reply(message):
    ticket = message.ticket
    send_notification_event(
        ticket.user,
        event_type=NotificationEvent.SUPPORT_REPLY,
        context={"ticket_id": ticket.id, "subject": ticket.subject},
    )
