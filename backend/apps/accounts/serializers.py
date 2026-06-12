from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework import serializers

from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("email", "phone_number", "username", "password")

    def create(self, validated_data):
        print(validated_data)  # 👈 اینجا بذار

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
        identifier = attrs.get("identifier")
        password = attrs.get("password")

        user = User.objects.filter(
            Q(email=identifier) | Q(phone_number=identifier)
        ).first()

        if not user:
            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")

        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "phone_number", "username", "avatar")
        read_only_fields = ("id",)