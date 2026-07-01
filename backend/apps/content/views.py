from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactMessageCreateAPIView(CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact_messages"
