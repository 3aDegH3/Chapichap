import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <p className="text-lg font-bold text-slate-900">چاپینو</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
            فروشگاه آنلاین چاپ و هدایای اختصاصی؛ برای وقتی که می‌خواهید
            یک هدیه خاص، شخصی و به‌یادماندنی بسازید.
          </p>
        </div>

        <div>
          <p className="font-semibold text-slate-900">دسترسی سریع</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/products">محصولات</Link>
            <Link href="/portfolio">نمونه‌کارها</Link>
            <Link href="/design-request">سفارش طراحی</Link>
          </div>
        </div>

        <div>
          <p className="font-semibold text-slate-900">پشتیبانی</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600">
            <Link href="/faq">سوالات متداول</Link>
            <Link href="/about">درباره ما</Link>
            <Link href="/contact">تماس با ما</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
        © تمام حقوق برای چاپینو محفوظ است.
      </div>
    </footer>
  );
}