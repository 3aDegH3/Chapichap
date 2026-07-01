from dataclasses import dataclass

from .notification_events import NotificationEvent


class SafeFormatDict(dict):
    def __missing__(self, key):
        return ""


@dataclass(frozen=True)
class NotificationTemplate:
    title: str
    message: str
    link: str = ""

    def render(self, context):
        values = SafeFormatDict(context or {})
        return {
            "title": self.title.format_map(values),
            "message": self.message.format_map(values),
            "link": self.link.format_map(values),
        }


ORDER_STATUS_MESSAGES = {
    "REGISTERED": "سفارش شما ثبت شد.",
    "REVIEWING": "سفارش شما در حال بررسی است.",
    "WAITING_DESIGN_APPROVAL": "طرح سفارش شما آماده تأیید است.",
    "READY_FOR_PRINT": "سفارش شما وارد مرحله چاپ شد.",
    "PRINTING": "سفارش شما وارد مرحله چاپ شد.",
    "READY_TO_SHIP": "سفارش شما آماده ارسال است.",
    "SHIPPED": "سفارش شما ارسال شد.",
    "DELIVERED": "سفارش شما تحویل شد.",
    "CANCELLED": "سفارش شما لغو شد.",
}


TEMPLATES = {
    NotificationEvent.ORDER_REGISTERED: NotificationTemplate(
        title="سفارش ثبت شد",
        message="سفارش {order_number} ثبت شد.",
        link="/account/orders/{order_id}",
    ),
    NotificationEvent.PAYMENT_SUCCESSFUL: NotificationTemplate(
        title="پرداخت موفق",
        message="پرداخت سفارش {order_number} با موفقیت انجام شد.",
        link="/account/orders/{order_id}",
    ),
    NotificationEvent.PAYMENT_FAILED: NotificationTemplate(
        title="پرداخت ناموفق",
        message="پرداخت سفارش {order_number} ناموفق بود. می‌توانی دوباره تلاش کنی.",
        link="/account/orders/{order_id}",
    ),
    NotificationEvent.ORDER_STATUS_CHANGED: NotificationTemplate(
        title="وضعیت سفارش تغییر کرد",
        message="{status_message}",
        link="/account/orders/{order_id}",
    ),
    NotificationEvent.DESIGN_REQUEST_RECEIVED: NotificationTemplate(
        title="درخواست طراحی دریافت شد",
        message="درخواست طراحی {order_type_label} دریافت شد.",
        link="/account/design-requests",
    ),
    NotificationEvent.DESIGN_REQUEST_ADMIN_REPLY: NotificationTemplate(
        title="پاسخ طراحی آماده شد",
        message="برای درخواست طراحی شما یک پاسخ جدید ثبت شد.",
        link="/account/design-requests",
    ),
    NotificationEvent.CONTACT_MESSAGE_CREATED: NotificationTemplate(
        title="فرم تماس جدید",
        message="فرم تماس «{subject_label}» از طرف {full_name} ثبت شد.",
        link="/admin/content/contactmessage/{contact_message_id}/change/",
    ),
    NotificationEvent.TICKET_CREATED: NotificationTemplate(
        title="تیکت ثبت شد",
        message="تیکت «{subject}» ثبت شد و در صف بررسی پشتیبانی قرار گرفت.",
        link="/account/tickets/{ticket_id}",
    ),
    NotificationEvent.TICKET_CLOSED: NotificationTemplate(
        title="تیکت بسته شد",
        message="تیکت «{subject}» بسته شد.",
        link="/account/tickets/{ticket_id}",
    ),
    NotificationEvent.SUPPORT_REPLY: NotificationTemplate(
        title="پاسخ پشتیبانی دریافت شد",
        message="برای تیکت «{subject}» یک پاسخ جدید ثبت شد.",
        link="/account/tickets/{ticket_id}",
    ),
}


def get_order_status_message(status):
    return ORDER_STATUS_MESSAGES.get(status, "وضعیت سفارش شما به‌روزرسانی شد.")


def render_notification(event_type, context=None):
    template = TEMPLATES[event_type]
    return template.render(context or {})
