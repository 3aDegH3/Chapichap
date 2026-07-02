# Reviews API

Base URL: `/api/v1`

## Public endpoints

- `GET /products/{slug-or-id}/rating-summary/` — میانگین، تعداد و توزیع امتیازهای تأییدشده.
- `GET /products/{slug-or-id}/reviews/?page=1&ordering=-created_at&rating=5` — نظرات تأییدشده.

Ordering values: `-created_at`, `created_at`, `-rating`, `rating`.

## Customer endpoints

JWT authentication is required.

- `GET /products/{slug-or-id}/review-eligibility/` — خرید واجد شرایط و امکان ثبت نظر.
- `POST /products/{product-id}/reviews/` — ثبت نظر Pending.
- `PATCH /reviews/{id}/` — ویرایش نظر متعلق به کاربر و بازگشت آن به Pending.
- `DELETE /reviews/{id}/` — حذف نرم نظر متعلق به کاربر.
- `GET /account/reviews/?page=1` — نظرات کاربر فعلی.

Create payload:

```json
{
  "rating": 5,
  "title": "کیفیت چاپ عالی بود",
  "body": "کیفیت چاپ و بسته‌بندی بسیار خوب بود.",
  "order_item_id": 125
}
```

`rating` بین ۱ تا ۵ و `body` بین ۱۰ تا ۲۰۰۰ کاراکتر است. `order_item_id` اختیاری است؛ در صورت حذف، بک‌اند آخرین خرید واجد شرایط و استفاده‌نشده را پیدا می‌کند. نشان خرید تأییدشده فقط از روی مالک سفارش، پرداخت موفق و وضعیت معتبر سفارش محاسبه می‌شود.

محدودیت ثبت نظر: ۵ درخواست در ساعت برای هر کاربر/آدرس.

## Admin endpoints

Admin permission `reviews` is required.

- `GET /admin/reviews/?status=pending&product=12&reported=true&q=...`
- `PATCH /admin/reviews/{id}/` با `status` و/یا `admin_reply`.
- `DELETE /admin/reviews/{id}/` — حذف نرم.
- `PATCH /admin/reviews/bulk/` — عملیات گروهی.

Statuses: `pending`, `approved`, `rejected`, `hidden`.

Bulk payload:

```json
{
  "ids": [1, 2, 3],
  "action": "approve"
}
```

Bulk actions: `approve`, `reject`, `hide`, `delete`.

## Rating cache

`Product.average_rating` و `Product.approved_reviews_count` بعد از ایجاد، ویرایش، تغییر وضعیت یا حذف Review بازسازی می‌شوند. فقط Reviewهای `approved` و حذف‌نشده در این cache و API عمومی محاسبه می‌شوند.

