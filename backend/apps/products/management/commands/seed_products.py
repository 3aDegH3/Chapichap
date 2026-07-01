from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.products.models import Category, Product


CATEGORIES = [
    {
        "title": "چاپ روی ماگ",
        "slug": "mug-printing",
        "description": "ماگ‌های اختصاصی برای هدیه، مناسبت و برندینگ.",
    },
    {
        "title": "چاپ روی تیشرت",
        "slug": "tshirt-printing",
        "description": "تیشرت سفارشی با عکس، متن یا طرح اختصاصی.",
    },
    {
        "title": "هدیه تبلیغاتی",
        "slug": "promotional-gifts",
        "description": "محصولات چاپی مناسب شرکت‌ها، رویدادها و کمپین‌ها.",
    },
    {
        "title": "هدیه شخصی",
        "slug": "personal-gifts",
        "description": "هدیه‌های خاص و شخصی‌سازی‌شده برای عزیزان.",
    },
]


PRODUCTS = [
    {
        "category": "mug-printing",
        "title": "ماگ سرامیکی اختصاصی",
        "slug": "custom-ceramic-mug",
        "short_description": "ماگ سفید با چاپ عکس، متن یا طرح دلخواه شما.",
        "description": "مناسب هدیه تولد، سالگرد و سفارش‌های شخصی. چاپ با کیفیت بالا انجام می‌شود و قبل از تولید، طرح نهایی قابل بررسی است.",
        "price": "250000",
        "product_type": Product.ProductType.MUG,
        "gift_usage": Product.GiftUsage.BIRTHDAY,
        "material": "سرامیک سفید براق",
        "dimensions": "۳۳۰ میلی‌لیتر",
        "preparation_time": "۲ تا ۳ روز کاری",
        "stock_quantity": 25,
    },
    {
        "category": "mug-printing",
        "title": "ماگ حرارتی جادویی",
        "slug": "magic-heat-mug",
        "short_description": "ماگی که با نوشیدنی گرم، طرح چاپ‌شده را نمایش می‌دهد.",
        "description": "انتخابی جذاب برای هدیه‌های سورپرایزی. مناسب چاپ عکس، لوگو یا پیام کوتاه.",
        "price": "340000",
        "product_type": Product.ProductType.MUG,
        "gift_usage": Product.GiftUsage.ROMANTIC,
        "material": "سرامیک حرارتی",
        "dimensions": "۳۳۰ میلی‌لیتر",
        "preparation_time": "۳ تا ۴ روز کاری",
        "stock_quantity": 14,
    },
    {
        "category": "tshirt-printing",
        "title": "تیشرت نخ پنبه چاپ اختصاصی",
        "slug": "custom-cotton-tshirt",
        "short_description": "تیشرت راحت با چاپ طرح شخصی برای استفاده روزمره.",
        "description": "قابل سفارش برای هدیه، ست دوستانه، تیمی و رویدادها. طرح نهایی قبل از چاپ تایید می‌شود.",
        "price": "390000",
        "product_type": Product.ProductType.APPAREL,
        "gift_usage": Product.GiftUsage.DAILY,
        "material": "نخ پنبه",
        "dimensions": "سایزهای S تا XXL",
        "preparation_time": "۳ تا ۵ روز کاری",
        "stock_quantity": 18,
    },
    {
        "category": "tshirt-printing",
        "title": "تیشرت تبلیغاتی برند",
        "slug": "brand-promotional-tshirt",
        "short_description": "تیشرت مناسب رویداد، کمپین و تیم‌های سازمانی.",
        "description": "برای سفارش‌های تعداد بالا و چاپ لوگو یا پیام برند طراحی شده است. کیفیت چاپ و ظاهر یکدست در اولویت است.",
        "price": "420000",
        "product_type": Product.ProductType.APPAREL,
        "gift_usage": Product.GiftUsage.CORPORATE,
        "material": "پنبه و پلی‌استر",
        "dimensions": "سایز سازمانی قابل انتخاب",
        "preparation_time": "۵ تا ۷ روز کاری",
        "stock_quantity": 40,
    },
    {
        "category": "promotional-gifts",
        "title": "ست هدیه تبلیغاتی اقتصادی",
        "slug": "economic-promotional-gift-set",
        "short_description": "ست ساده و کاربردی برای معرفی برند در تیراژ بالا.",
        "description": "شامل محصولات چاپی منتخب برای کمپین‌ها و مناسبت‌های سازمانی. قابل شخصی‌سازی با لوگو و رنگ برند.",
        "price": "690000",
        "product_type": Product.ProductType.GIFT_SET,
        "gift_usage": Product.GiftUsage.CORPORATE,
        "material": "ترکیبی از اقلام چاپی",
        "dimensions": "بسته‌بندی ۲۵ × ۱۸ سانتی‌متر",
        "preparation_time": "۵ تا ۸ روز کاری",
        "stock_quantity": 12,
    },
    {
        "category": "promotional-gifts",
        "title": "دفترچه یادداشت با چاپ لوگو",
        "slug": "branded-notebook",
        "short_description": "دفترچه کاربردی با چاپ لوگو برای هدیه سازمانی.",
        "description": "مناسب نمایشگاه‌ها، جلسات و بسته‌های خوشامدگویی. امکان هماهنگی رنگ و طرح جلد وجود دارد.",
        "price": "180000",
        "product_type": Product.ProductType.STATIONERY,
        "gift_usage": Product.GiftUsage.EVENT,
        "material": "جلد سخت با کاغذ تحریر",
        "dimensions": "A5",
        "preparation_time": "۳ تا ۵ روز کاری",
        "stock_quantity": 35,
    },
    {
        "category": "personal-gifts",
        "title": "تابلو عکس اختصاصی",
        "slug": "custom-photo-frame",
        "short_description": "تابلو دکوراتیو با عکس یا نوشته اختصاصی.",
        "description": "گزینه‌ای احساسی برای هدیه شخصی. طرح می‌تواند مینیمال، مناسبتی یا کاملا شخصی‌سازی‌شده باشد.",
        "price": "520000",
        "product_type": Product.ProductType.FRAME,
        "gift_usage": Product.GiftUsage.PERSONAL,
        "material": "چاپ عکس روی تخته شاسی",
        "dimensions": "۳۰ × ۴۰ سانتی‌متر",
        "preparation_time": "۲ تا ۴ روز کاری",
        "stock_quantity": 8,
    },
    {
        "category": "personal-gifts",
        "title": "پک هدیه عاشقانه",
        "slug": "romantic-gift-pack",
        "short_description": "پکیج اختصاصی برای سالگرد، ولنتاین و مناسبت‌های خاص.",
        "description": "ترکیبی از محصولات چاپی و یادگاری‌های شخصی که با متن، عکس یا طرح شما آماده می‌شود.",
        "price": "850000",
        "product_type": Product.ProductType.GIFT_SET,
        "gift_usage": Product.GiftUsage.ROMANTIC,
        "material": "پک ترکیبی هدیه",
        "dimensions": "بسته‌بندی هدیه اختصاصی",
        "preparation_time": "۴ تا ۶ روز کاری",
        "stock_quantity": 6,
    },
    {
        "category": "mug-printing",
        "title": "ماگ لوگودار شرکتی",
        "slug": "corporate-logo-mug",
        "short_description": "ماگ مناسب هدیه سازمانی با چاپ لوگوی برند.",
        "description": "برای استفاده روزمره کارمندان، هدیه مشتریان و کمپین‌های تبلیغاتی. قابل سفارش در تعداد بالا.",
        "price": "280000",
        "product_type": Product.ProductType.MUG,
        "gift_usage": Product.GiftUsage.CORPORATE,
        "material": "سرامیک سفید",
        "dimensions": "۳۳۰ میلی‌لیتر",
        "preparation_time": "۴ تا ۶ روز کاری",
        "stock_quantity": 60,
    },
    {
        "category": "tshirt-printing",
        "title": "هودی چاپ اختصاصی",
        "slug": "custom-printed-hoodie",
        "short_description": "هودی گرم و راحت با چاپ طرح دلخواه.",
        "description": "مناسب هدیه، تیم‌های کوچک و سفارش‌های خاص. طرح روی سینه یا پشت هودی قابل چاپ است.",
        "price": "890000",
        "product_type": Product.ProductType.APPAREL,
        "gift_usage": Product.GiftUsage.PERSONAL,
        "material": "دورس گرم بالا",
        "dimensions": "سایزهای M تا XXL",
        "preparation_time": "۵ تا ۷ روز کاری",
        "stock_quantity": 0,
    },
]


DEFAULT_PRINT_FILE_GUIDE = "فایل پیشنهادی با کیفیت ۳۰۰dpi، فرمت PNG یا JPG و رنگ‌های واضح ارسال شود. اگر فایل آماده نداری، از گزینه درخواست طراحی اختصاصی استفاده کن."
DEFAULT_SIZE_GUIDE = "در صورت نیاز به سایز دقیق، قبل از ثبت سفارش با پشتیبانی هماهنگ کن."


class Command(BaseCommand):
    help = "Seed demo categories and products for Sprint 2."

    def handle(self, *args, **options):
        categories = {}

        for item in CATEGORIES:
            category, _ = Category.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "description": item["description"],
                    "is_active": True,
                },
            )
            categories[item["slug"]] = category

        created_count = 0
        updated_count = 0

        for item in PRODUCTS:
            product, created = Product.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "category": categories[item["category"]],
                    "title": item["title"],
                    "short_description": item["short_description"],
                    "description": item["description"],
                    "price": Decimal(item["price"]),
                    "product_type": item["product_type"],
                    "gift_usage": item["gift_usage"],
                    "material": item["material"],
                    "dimensions": item["dimensions"],
                    "size_guide": DEFAULT_SIZE_GUIDE,
                    "preparation_time": item["preparation_time"],
                    "print_file_guide": DEFAULT_PRINT_FILE_GUIDE,
                    "stock_quantity": item["stock_quantity"],
                    "is_active": True,
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(categories)} categories, created {created_count} products, updated {updated_count} products."
            )
        )
