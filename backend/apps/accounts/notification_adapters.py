import logging

from .models import Notification


logger = logging.getLogger(__name__)


class BaseNotificationAdapter:
    channel = "base"

    def send(self, *, recipient, event_type, title, message, link="", context=None):
        raise NotImplementedError


class DatabaseNotificationAdapter(BaseNotificationAdapter):
    channel = "database"

    def send(self, *, recipient, event_type, title, message, link="", context=None):
        if not recipient:
            return None

        return Notification.objects.create(
            user=recipient,
            title=title,
            message=message,
            event_type=event_type,
            link=link,
        )


class ConsoleNotificationAdapter(BaseNotificationAdapter):
    channel = "console"

    def send(self, *, recipient, event_type, title, message, link="", context=None):
        logger.info(
            "notification.%s user=%s event=%s title=%s message=%s link=%s",
            self.channel,
            getattr(recipient, "id", None),
            event_type,
            title,
            message,
            link,
        )
        return None


class EmailNotificationAdapter(ConsoleNotificationAdapter):
    channel = "email"


class SmsNotificationAdapter(ConsoleNotificationAdapter):
    channel = "sms"
