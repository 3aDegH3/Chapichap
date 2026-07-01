# گزارش تحویل پنل مدیریت پیشرفته

## وضعیت Definition of Done

تمام موارد Definition of Done در کد و تست پوشش داده شده‌اند:

- محافظت مسیرها و APIهای مدیریتی با Role و Permission مستقل
- مدیریت کامل محصولات، دسته‌بندی‌ها، تصاویر، قیمت، تخفیف و موجودی
- فهرست، جستجو، فیلتر، CSV و جزئیات کامل سفارش
- تاریخچه وضعیت، کد رهگیری و یادداشت داخلی محرمانه
- Preview و Download امن فایل‌ها همراه Audit Log
- مدیریت درخواست‌های طراحی، پیام‌های تماس، مشتریان و مدیران
- Loading، Empty، Error، Pagination و نمای موبایل
- ثبت فعالیت‌های حساس مدیران و محدودیت مشاهده برای Super Admin

## فایل‌های اصلی ایجادشده

Backend:

```text
backend/apps/admin_panel/
├── admin.py
├── apps.py
├── models.py
├── permissions.py
├── serializers.py
├── services.py
├── tests.py
├── urls.py
├── views.py
└── migrations/0001_initial.py

backend/apps/core/file_security.py
backend/config/settings/test.py
```

Frontend:

```text
frontend/app/admin/
├── activity-logs/
├── categories/
├── contact-messages/
├── customer-files/
├── customers/
├── design-requests/
├── orders/
├── products/
├── settings/
├── admin-dashboard-client.tsx
├── layout.tsx
└── page.tsx

frontend/components/admin/AdminGuard.tsx
frontend/components/admin/AdminShell.tsx
frontend/lib/admin-api.ts
```

مستندات:

```text
docs/admin-panel-api.md
docs/admin-panel-scope.md
docs/admin-panel-delivery.md
```

## Migrationهای اسپرینت

```text
accounts/0003_user_admin_role.py
accounts/0004_alter_supportattachment_file.py
admin_panel/0001_initial.py
content/0002_contactmessage_deleted_at_contactmessage_deleted_by_and_more.py
design_request/0003_designrequest_admin_response_and_more.py
design_request/0004_designrequest_order_alter_designrequest_status_and_more.py
orders/0007_order_shipping_provider_order_shipping_tracking_code.py
orders/0008_orderinternalnote.py
payments/0004_alter_payment_order_number.py
products/0005_product_purchase_metadata.py
products/0006_alter_category_options_category_image_and_more.py
products/0007_product_discount_ends_at_product_discount_price_and_more.py
products/0008_backfill_product_gallery.py
```

## Endpointها

قرارداد کامل endpointها در `docs/admin-panel-api.md` ثبت شده است. دامنه‌های اصلی عبارت‌اند از:

```text
/api/v1/admin/me/
/api/v1/admin/dashboard/
/api/v1/admin/products/
/api/v1/admin/categories/
/api/v1/admin/orders/
/api/v1/admin/design-requests/
/api/v1/admin/contact-messages/
/api/v1/admin/customer-files/
/api/v1/admin/customers/
/api/v1/admin/activity-logs/
/api/v1/admin/settings/admin-users/
```

## اجرای تست و Build

```bash
cd backend
../venv/bin/python manage.py check --settings=config.settings.test
../venv/bin/python manage.py makemigrations --check --dry-run --settings=config.settings.test
../venv/bin/python manage.py test apps.admin_panel.tests --settings=config.settings.test

cd ../frontend
npm run lint
npm run build
```

مجموعه فعلی شامل ۲۰ تست رفتاری پنل است. این تست‌ها migrationها را روی SQLite خالی اجرا می‌کنند و Permission، محصولات، گالری، سفارش، CSV، تاریخچه، فایل، پیام، مشتری، Audit Log و مدیریت مدیران را پوشش می‌دهند.

## استقرار دیتابیس

PostgreSQL محلی هنگام تحویل در دسترس نبود و اجرای migration روی دیتابیس توسعه با خطای اتصال متوقف شد. پس از راه‌اندازی PostgreSQL، تنها گام محیطی باقی‌مانده این فرمان است:

```bash
cd backend
../venv/bin/python manage.py migrate --noinput
```

هیچ migration معلقی از نظر تطابق مدل وجود ندارد و `makemigrations --check` موفق است.
