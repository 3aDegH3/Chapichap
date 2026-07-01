import re

from rest_framework import serializers

from apps.accounts.services import notify_contact_message_created

from .models import ContactMessage


PHONE_PATTERN = re.compile(r"^[0-9۰-۹٠-٩+\-()\s]+$")


class ContactMessageSerializer(serializers.ModelSerializer):
    subject_label = serializers.CharField(source="get_subject_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "full_name",
            "phone",
            "subject",
            "subject_label",
            "message",
            "contact_permission",
            "status",
            "status_label",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "subject_label",
            "status",
            "status_label",
            "created_at",
        ]

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("نام را کامل‌تر وارد کنید.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        if len(value) < 8 or not PHONE_PATTERN.match(value):
            raise serializers.ValidationError("شماره تماس معتبر وارد کنید.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("متن پیام باید حداقل ۱۰ کاراکتر باشد.")
        return value

    def create(self, validated_data):
        request = self.context.get("request")

        if request:
            forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
            ip_address = forwarded_for.split(",")[0].strip() if forwarded_for else request.META.get("REMOTE_ADDR")
            validated_data["ip_address"] = ip_address or None
            validated_data["user_agent"] = request.META.get("HTTP_USER_AGENT", "")[:255]

        contact_message = super().create(validated_data)
        notify_contact_message_created(contact_message)
        return contact_message
