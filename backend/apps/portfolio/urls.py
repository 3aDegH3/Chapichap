from django.urls import path

from .views import PortfolioDetailAPIView, PortfolioDetailByIdAPIView, PortfolioListAPIView

urlpatterns = [
    path("", PortfolioListAPIView.as_view(), name="portfolio-list"),
    path("<int:pk>/", PortfolioDetailByIdAPIView.as_view(), name="portfolio-detail-by-id"),
    path("<slug:slug>/", PortfolioDetailAPIView.as_view(), name="portfolio-detail"),
]
