from django.urls import path

from .views import DesignRequestListCreateAPIView, FileUploadAPIView

urlpatterns = [
    path("design-requests/", DesignRequestListCreateAPIView.as_view(), name="design-request-list"),
    path("upload/", FileUploadAPIView.as_view(), name="file-upload"),
]
