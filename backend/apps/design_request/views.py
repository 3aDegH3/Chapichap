from rest_framework.generics import ListCreateAPIView
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import DesignRequest
from .serializers import DesignRequestSerializer, UploadedFileSerializer


class DesignRequestListCreateAPIView(ListCreateAPIView):
    serializer_class = DesignRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "design_requests"

    def get_queryset(self):
        queryset = DesignRequest.objects.select_related("product", "uploaded_file", "user")

        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)

        return queryset.none()


class FileUploadAPIView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "design_uploads"

    def post(self, request):
        if not request.session.session_key:
            request.session.create()

        serializer = UploadedFileSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        upload = serializer.save()
        return Response(UploadedFileSerializer(upload, context={"request": request}).data)
