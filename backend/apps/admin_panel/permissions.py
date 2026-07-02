from rest_framework.permissions import BasePermission

from apps.accounts.models import User


ADMIN_PERMISSION_DASHBOARD = "dashboard"
ADMIN_PERMISSION_PRODUCTS = "products"
ADMIN_PERMISSION_CATEGORIES = "categories"
ADMIN_PERMISSION_ORDERS = "orders"
ADMIN_PERMISSION_DESIGN_REQUESTS = "design_requests"
ADMIN_PERMISSION_CONTACT_MESSAGES = "contact_messages"
ADMIN_PERMISSION_CUSTOMER_FILES = "customer_files"
ADMIN_PERMISSION_CUSTOMERS = "customers"
ADMIN_PERMISSION_ACTIVITY_LOGS = "activity_logs"
ADMIN_PERMISSION_SETTINGS = "settings"
ADMIN_PERMISSION_REVIEWS = "reviews"

SUPER_ADMIN_PERMISSIONS = {
    ADMIN_PERMISSION_DASHBOARD,
    ADMIN_PERMISSION_PRODUCTS,
    ADMIN_PERMISSION_CATEGORIES,
    ADMIN_PERMISSION_ORDERS,
    ADMIN_PERMISSION_DESIGN_REQUESTS,
    ADMIN_PERMISSION_CONTACT_MESSAGES,
    ADMIN_PERMISSION_CUSTOMER_FILES,
    ADMIN_PERMISSION_CUSTOMERS,
    ADMIN_PERMISSION_ACTIVITY_LOGS,
    ADMIN_PERMISSION_SETTINGS,
    ADMIN_PERMISSION_REVIEWS,
}

ROLE_PERMISSIONS = {
    User.AdminRole.SUPER_ADMIN: SUPER_ADMIN_PERMISSIONS,
    User.AdminRole.ORDER_MANAGER: {
        ADMIN_PERMISSION_DASHBOARD,
        ADMIN_PERMISSION_ORDERS,
        ADMIN_PERMISSION_CUSTOMERS,
        ADMIN_PERMISSION_CUSTOMER_FILES,
    },
    User.AdminRole.PRODUCT_MANAGER: {
        ADMIN_PERMISSION_DASHBOARD,
        ADMIN_PERMISSION_PRODUCTS,
        ADMIN_PERMISSION_CATEGORIES,
        ADMIN_PERMISSION_REVIEWS,
    },
    User.AdminRole.SUPPORT: {
        ADMIN_PERMISSION_DASHBOARD,
        ADMIN_PERMISSION_ORDERS,
        ADMIN_PERMISSION_DESIGN_REQUESTS,
        ADMIN_PERMISSION_CONTACT_MESSAGES,
        ADMIN_PERMISSION_CUSTOMER_FILES,
        ADMIN_PERMISSION_REVIEWS,
    },
}


def get_admin_permissions(user):
    role = getattr(user, "effective_admin_role", "")
    permissions = ROLE_PERMISSIONS.get(role, set())
    return sorted(permissions)


def user_has_admin_permission(user, permission):
    if not user or not user.is_authenticated or not user.is_active:
        return False
    if not getattr(user, "is_admin_panel_user", False):
        return False
    return permission in ROLE_PERMISSIONS.get(user.effective_admin_role, set())


class IsAdminPanelUser(BasePermission):
    message = "دسترسی به پنل مدیریت فقط برای مدیران فعال مجاز است."

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_admin_panel_user)


class IsSuperAdmin(BasePermission):
    message = "این عملیات فقط برای Super Admin مجاز است."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_SETTINGS)


class CanManageProducts(BasePermission):
    message = "دسترسی مدیریت محصولات برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_PRODUCTS)


class CanManageOrders(BasePermission):
    message = "دسترسی مدیریت سفارش‌ها برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_ORDERS)


class CanManageDesignRequests(BasePermission):
    message = "دسترسی مدیریت درخواست‌های طراحی برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_DESIGN_REQUESTS)


class CanManageContactMessages(BasePermission):
    message = "دسترسی مدیریت پیام‌های تماس برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_CONTACT_MESSAGES)


class CanHandleSupport(BasePermission):
    message = "دسترسی پشتیبانی برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return any(
            user_has_admin_permission(request.user, permission)
            for permission in [ADMIN_PERMISSION_DESIGN_REQUESTS, ADMIN_PERMISSION_CONTACT_MESSAGES, ADMIN_PERMISSION_CUSTOMER_FILES]
        )


class CanManageCustomerFiles(BasePermission):
    message = "دسترسی مدیریت فایل‌های مشتری برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_CUSTOMER_FILES)


class CanManageCustomers(BasePermission):
    message = "دسترسی مدیریت مشتریان برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_CUSTOMERS)


class CanViewActivityLogs(BasePermission):
    message = "مشاهده گزارش فعالیت‌ها فقط برای Super Admin مجاز است."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_ACTIVITY_LOGS)


class CanManageReviews(BasePermission):
    message = "دسترسی مدیریت نظرات برای این نقش مجاز نیست."

    def has_permission(self, request, view):
        return user_has_admin_permission(request.user, ADMIN_PERMISSION_REVIEWS)
