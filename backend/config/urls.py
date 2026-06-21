"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path ,include
from apps.products.views import CategoryListAPIView, ProductSearchAPIView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/v1/", include("apps.core.api.v1.urls")),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/products/", include("apps.products.urls")),
    path("api/v1/", include("apps.orders.urls")),
    path("api/v1/", include("apps.accounts.account_urls")),
    path("api/v1/", include("apps.payments.urls")),
    path("api/v1/", include("apps.design_request.urls")),
    path("api/v1/categories/", CategoryListAPIView.as_view(), name="category-list"),
    path("api/v1/search/", ProductSearchAPIView.as_view(), name="product-search"),
    path("api/v1/portfolio/", include("apps.portfolio.urls")),



]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
