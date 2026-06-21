from django.urls import path

from .views import (
    AccountDashboardAPIView,
    AccountOrderDetailAPIView,
    AccountOrdersAPIView,
    AccountOrderStatusHistoryAPIView,
    AccountOffersAPIView,
    AccountPasswordChangeAPIView,
    AccountProfileAPIView,
    AddressDetailAPIView,
    AddressListCreateAPIView,
    AddressSetDefaultAPIView,
    NotificationReadAPIView,
    NotificationsAPIView,
    NotificationsReadAllAPIView,
    TicketCloseAPIView,
    TicketDetailAPIView,
    TicketListCreateAPIView,
    TicketMessageAPIView,
    ValidateOfferAPIView,
)


urlpatterns = [
    path("account/dashboard/", AccountDashboardAPIView.as_view(), name="account-dashboard"),
    path("account/profile/", AccountProfileAPIView.as_view(), name="account-profile"),
    path("account/security/password/", AccountPasswordChangeAPIView.as_view(), name="account-change-password"),
    path("account/addresses/", AddressListCreateAPIView.as_view(), name="account-addresses"),
    path("account/addresses/<int:pk>/", AddressDetailAPIView.as_view(), name="account-address-detail"),
    path("account/addresses/<int:pk>/default/", AddressSetDefaultAPIView.as_view(), name="account-address-default"),
    path("account/orders/", AccountOrdersAPIView.as_view(), name="account-orders"),
    path("account/orders/<int:pk>/", AccountOrderDetailAPIView.as_view(), name="account-order-detail"),
    path("account/orders/<int:pk>/status-history/", AccountOrderStatusHistoryAPIView.as_view(), name="account-order-status-history"),
    path("account/offers/", AccountOffersAPIView.as_view(), name="account-offers"),
    path("account/tickets/", TicketListCreateAPIView.as_view(), name="account-tickets"),
    path("account/tickets/<int:pk>/", TicketDetailAPIView.as_view(), name="account-ticket-detail"),
    path("account/tickets/<int:pk>/messages/", TicketMessageAPIView.as_view(), name="account-ticket-message"),
    path("account/tickets/<int:pk>/close/", TicketCloseAPIView.as_view(), name="account-ticket-close"),
    path("account/notifications/", NotificationsAPIView.as_view(), name="account-notifications"),
    path("account/notifications/<int:pk>/read/", NotificationReadAPIView.as_view(), name="account-notification-read"),
    path("account/notifications/read-all/", NotificationsReadAllAPIView.as_view(), name="account-notifications-read-all"),
    path("checkout/validate-offer/", ValidateOfferAPIView.as_view(), name="checkout-validate-offer"),
]
