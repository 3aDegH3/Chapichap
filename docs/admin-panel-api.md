# قرارداد API پنل مدیریت

تمام مسیرها با پیشوند `/api/v1/admin/` در دسترس‌اند و به توکن JWT مدیر فعال نیاز دارند. دسترسی هر endpoint علاوه بر احراز هویت، با Role و Permission متناظر کنترل می‌شود.

## پاسخ‌ها و صفحه‌بندی

- فهرست‌ها از ساختار استاندارد DRF شامل `count`، `next`، `previous` و `results` استفاده می‌کنند.
- عملیات تغییردهنده عموماً ساختار `success`، `message` و `data` دارند.
- خطاهای اعتبارسنجی با HTTP 400، عدم احراز هویت با 401 و نبود دسترسی با 403 برگردانده می‌شوند.
- اندازه پیش‌فرض هر صفحه ۱۰ رکورد است و شماره صفحه با پارامتر `page` ارسال می‌شود.

## داشبورد

```text
GET /dashboard/
```

## محصولات

```text
GET    /products/
POST   /products/
GET    /products/{id}/
PATCH  /products/{id}/
DELETE /products/{id}/
PATCH  /products/{id}/toggle-active/
GET    /products/{id}/inventory-history/
GET    /products/{id}/images/
POST   /products/{id}/images/
PATCH  /products/{id}/images/{image_id}/
DELETE /products/{id}/images/{image_id}/
```

برای آپلود گالری، فایل‌ها با کلید تکرارشونده `gallery_images` و `multipart/form-data` ارسال می‌شوند. حداکثر ۸ تصویر و حداکثر حجم هر تصویر ۵ مگابایت است. درخواست PATCH تصویر را به تصویر اصلی تبدیل می‌کند.

## دسته‌بندی‌ها

```text
GET    /categories/
POST   /categories/
GET    /categories/{id}/
PATCH  /categories/{id}/
DELETE /categories/{id}/
```

## سفارش‌ها

```text
GET    /orders/
GET    /orders/export/csv/
GET    /orders/{id}/
PATCH  /orders/{id}/status/
PATCH  /orders/{id}/shipping/
GET    /orders/{id}/history/
GET    /orders/{id}/notes/
POST   /orders/{id}/notes/
PATCH  /orders/{id}/notes/{note_id}/
DELETE /orders/{id}/notes/{note_id}/
```

جزئیات سفارش، فایل‌های درخواست طراحی و پیوست‌های پشتیبانی متصل به همان سفارش را در `customer_files` برمی‌گرداند.

خروجی CSV همان پارامترهای جستجو و فیلتر فهرست سفارش‌ها را می‌پذیرد، به‌صورت streaming تولید می‌شود و برای بازشدن صحیح متن فارسی در Excel دارای UTF-8 BOM است.

## درخواست‌های طراحی

```text
GET   /design-requests/
GET   /design-requests/{id}/
PATCH /design-requests/{id}/status/
POST  /design-requests/{id}/reply/
PATCH /design-requests/{id}/order/
GET   /design-requests/{id}/history/
GET   /design-requests/{id}/notes/
POST  /design-requests/{id}/notes/
```

بدنه پاسخ مدیر:

```json
{
  "admin_response": "متن پاسخ مدیر"
}
```

مسیر قدیمی `PATCH /design-requests/{id}/response/` برای سازگاری حفظ شده است.

## پیام‌های تماس

```text
GET    /contact-messages/
GET    /contact-messages/{id}/
DELETE /contact-messages/{id}/
PATCH  /contact-messages/{id}/status/
PATCH  /contact-messages/bulk-read/
GET    /contact-messages/{id}/notes/
POST   /contact-messages/{id}/notes/
```

حذف پیام تماس نرم است. عملیات گروهی فقط پیام‌های دارای وضعیت `new` را به `read` تغییر می‌دهد.

## مشتریان و فایل‌ها

```text
GET /customers/
GET /customers/{id}/
GET /customer-files/
GET /customer-files/{source}/{id}/preview/
GET /customer-files/{source}/{id}/download/
```

هیچ serializer مدیریتی فیلد رمز عبور یا hash آن را برنمی‌گرداند. مشاهده و دانلود فایل حساس در Audit Log ثبت می‌شود.

## گزارش فعالیت مدیران

```text
GET /activity-logs/
```

این مسیر فقط برای Super Admin مجاز است و از فیلترهای `action`، `entity_type`، `actor`، `date_from`، `date_to` و جستجوی `q` پشتیبانی می‌کند.

## تنظیمات مدیران

```text
GET   /settings/admin-users/
POST  /settings/admin-users/
PATCH /settings/admin-users/{id}/
```

این مسیرها فقط برای Super Admin مجازند. افزودن دسترسی تنها برای حسابی انجام می‌شود که قبلاً ثبت‌نام کرده است. Superuser و حساب مدیر فعلی از داخل پنل قابل تغییر نیستند و مدیریت اضطراری Superuser در Django Admin باقی می‌ماند.

## QA اسپرینت

```bash
cd backend
../venv/bin/python manage.py check --settings=config.settings.test
../venv/bin/python manage.py makemigrations --check --dry-run --settings=config.settings.test
../venv/bin/python manage.py test apps.admin_panel.tests --settings=config.settings.test

cd ../frontend
npm run lint
npm run build
```

تست‌های پنل شامل Permission، عملیات سفارش، قیمت و موجودی، Audit Log، پیام تماس، مشتری، پاسخ طراحی، گالری تصاویر و فایل متصل به سفارش هستند.
