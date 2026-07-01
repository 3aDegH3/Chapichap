from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import SupportMessage
from .services import notify_support_reply


@receiver(post_save, sender=SupportMessage)
def notify_customer_about_staff_reply(sender, instance, created, **kwargs):
    if created and instance.is_staff_message:
        notify_support_reply(instance)
