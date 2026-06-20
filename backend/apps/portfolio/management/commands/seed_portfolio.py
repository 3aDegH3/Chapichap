from datetime import date

from django.core.management.base import BaseCommand

from apps.portfolio.models import Portfolio


PORTFOLIO_ITEMS = [
    {
        "title": "ماگ تولد با تصویر خانوادگی",
        "slug": "family-birthday-mug",
        "work_type": Portfolio.WorkType.MUG,
        "client_name": "سفارش شخصی",
        "short_description": "چاپ تصویر خانوادگی روی ماگ سرامیکی برای هدیه تولد.",
        "description": "در این سفارش، تصویر خانوادگی با یک نوشته کوتاه ترکیب شد تا هدیه‌ای شخصی، ساده و ماندگار ساخته شود. تمرکز کار روی خوانایی عکس و رنگ‌های گرم بود.",
        "is_featured": True,
        "completed_at": date(2026, 5, 18),
    },
    {
        "title": "تیشرت تیم رویداد استارتاپی",
        "slug": "startup-event-team-tshirt",
        "work_type": Portfolio.WorkType.TSHIRT,
        "client_name": "رویداد تیمی",
        "short_description": "طراحی و چاپ تیشرت یکدست برای تیم اجرایی رویداد.",
        "description": "برای این پروژه، طرح مینیمال با لوگوی رویداد و رنگ سازمانی آماده شد. خروجی نهایی برای استفاده طولانی در روز رویداد سبک و خوانا طراحی شد.",
        "is_featured": True,
        "completed_at": date(2026, 5, 2),
    },
    {
        "title": "پک هدیه سازمانی نوروز",
        "slug": "nowruz-corporate-gift-pack",
        "work_type": Portfolio.WorkType.BRANDING,
        "client_name": "برند سازمانی",
        "short_description": "پک هدیه تبلیغاتی با چاپ لوگو و پیام مناسبتی.",
        "description": "این پک برای هدیه نوروزی مشتریان طراحی شد و شامل چند آیتم چاپی با هویت بصری یکسان بود. هدف، حس رسمی اما صمیمی در لحظه دریافت هدیه بود.",
        "is_featured": True,
        "completed_at": date(2026, 3, 12),
    },
    {
        "title": "تابلو عکس سالگرد",
        "slug": "anniversary-photo-frame",
        "work_type": Portfolio.WorkType.GIFT,
        "client_name": "سفارش شخصی",
        "short_description": "تابلو دکوراتیو با عکس و متن اختصاصی برای سالگرد.",
        "description": "در این نمونه‌کار، عکس اصلی با تایپوگرافی فارسی و ترکیب‌بندی خلوت آماده شد تا برای فضای خانه مناسب باشد.",
        "is_featured": False,
        "completed_at": date(2026, 4, 24),
    },
    {
        "title": "طراحی کاراکتر برای چاپ روی ماگ",
        "slug": "custom-character-mug-design",
        "work_type": Portfolio.WorkType.DESIGN,
        "client_name": "سفارش طراحی",
        "short_description": "طراحی کاراکتر اختصاصی و آماده‌سازی فایل برای چاپ ماگ.",
        "description": "ابتدا اتود کاراکتر آماده شد، سپس رنگ‌بندی و فایل چاپی نهایی بر اساس ابعاد ماگ تنظیم شد. نتیجه مناسب هدیه شخصی و چاپ تکی بود.",
        "is_featured": False,
        "completed_at": date(2026, 4, 5),
    },
    {
        "title": "ماگ لوگودار برای کافه",
        "slug": "cafe-logo-mug",
        "work_type": Portfolio.WorkType.MUG,
        "client_name": "کافه محلی",
        "short_description": "چاپ لوگوی کافه روی ماگ برای استفاده روزانه و هدیه مشتریان.",
        "description": "لوگوی برند با رنگ ثابت روی ماگ سفید چاپ شد. تمرکز پروژه روی سادگی، دوام و دیده شدن برند در استفاده روزمره بود.",
        "is_featured": False,
        "completed_at": date(2026, 2, 16),
    },
    {
        "title": "تیشرت گروه دوستانه سفر",
        "slug": "travel-group-tshirt",
        "work_type": Portfolio.WorkType.TSHIRT,
        "client_name": "گروه دوستانه",
        "short_description": "چاپ طرح مشترک برای گروه سفر و عکاسی.",
        "description": "طرح نهایی با یک عبارت کوتاه و نشانه تصویری سفر آماده شد تا در عکس‌های گروهی خوانا و هماهنگ دیده شود.",
        "is_featured": False,
        "completed_at": date(2026, 1, 28),
    },
    {
        "title": "ست خوشامدگویی کارمندان",
        "slug": "employee-welcome-kit",
        "work_type": Portfolio.WorkType.BRANDING,
        "client_name": "شرکت خدماتی",
        "short_description": "پک خوشامدگویی با اقلام چاپی هماهنگ برای نیروی جدید.",
        "description": "این نمونه‌کار برای onboarding طراحی شد. اقلام پک با زبان بصری برند هماهنگ شدند تا تجربه ورود به شرکت گرم‌تر و حرفه‌ای‌تر باشد.",
        "is_featured": False,
        "completed_at": date(2026, 1, 10),
    },
]


class Command(BaseCommand):
    help = "Seed demo portfolio items for Sprint 2."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in PORTFOLIO_ITEMS:
            _, created = Portfolio.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "work_type": item["work_type"],
                    "client_name": item["client_name"],
                    "short_description": item["short_description"],
                    "description": item["description"],
                    "is_featured": item["is_featured"],
                    "is_active": True,
                    "completed_at": item["completed_at"],
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded portfolio: created {created_count}, updated {updated_count}."
            )
        )
