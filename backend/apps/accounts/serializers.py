from django.db.models import Q
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "phone_number", "username", "password")
        extra_kwargs = {
            "email": {"required": True},
            "phone_number": {"required": False, "allow_blank": True},
            "username": {"required": False, "allow_blank": True},
        }

    def validate(self, attrs):
        email = attrs.get("email")
        phone_number = attrs.get("phone_number")
        username = attrs.get("username")

        if email:
            attrs["email"] = email.strip().lower()

        if phone_number == "":
            attrs["phone_number"] = None

        if username == "":
            attrs["username"] = None

        return attrs

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            username=validated_data.get("username"),
            phone_number=validated_data.get("phone_number"),
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    identifier = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        identifier = attrs.get("identifier", "").strip()
        password = attrs.get("password")

        user = User.objects.filter(
            Q(email__iexact=identifier) | Q(phone_number=identifier)
        ).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({
                "detail": "ایمیل/شماره موبایل یا رمز عبور اشتباه است."
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "حساب کاربری شما غیرفعال است."
            })

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "phone_number",
            "username",
            "avatar",
            "date_joined",
        )
        read_only_fields = ("id", "date_joined")