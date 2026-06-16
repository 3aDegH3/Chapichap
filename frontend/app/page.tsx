import Link from "next/link";

const categories = [
  {
    title: "هدیه شخصی",
    description: "ماگ، تیشرت و محصولات خاص با طرح دلخواه شما",
    icon: "🎁",
  },
  {
    title: "چاپ روی ماگ",
    description: "ماگ اختصاصی برای تولد، عشق، برند یا مناسبت خاص",
    icon: "☕",
  },
  {
    title: "چاپ روی تیشرت",
    description: "تیشرت سفارشی با عکس، متن یا طراحی اختصاصی",
    icon: "👕",
  },
  {
    title: "هدیه تبلیغاتی",
    description: "محصولات چاپی برای برندها، سازمان‌ها و رویدادها",
    icon: "🏷️",
  },
];

const portfolioItems = [
  {
    title: "ماگ تولد اختصاصی",
    icon: "☕",
  },
  {
    title: "تیشرت سفارشی",
    icon: "👕",
  },
  {
    title: "هدیه عاشقانه",
    icon: "💝",
  },
  {
    title: "ست تبلیغاتی برند",
    icon: "🏷️",
  },
  {
    title: "طراحی کاریکاتور",
    icon: "🎨",
  },
  {
    title: "چاپ مناسبتی",
    icon: "✨",
  },
];

const orderSteps = [
  "انتخاب محصول",
  "ارسال طرح یا ایده",
  "تایید نهایی",
  "چاپ و آماده‌سازی",
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white">
      {/* Hero */}
      <section className="relative bg-[var(--dark)] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-30 blur-3xl" />
          <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[var(--secondary)] opacity-30 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-40 w-40 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur">
              چاپ و هدایای اختصاصی
            </span>

            <h1 className="mt-6 max-w-2xl text-4xl font-black leading-[1.35] tracking-tight sm:text-5xl lg:text-6xl">
              هدیه‌ای بساز که فقط برای یک نفر طراحی شده باشد
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/75 sm:text-lg">
              از چاپ روی ماگ و تیشرت تا طراحی اختصاصی و هدیه‌های شخصی؛
              اینجا فقط چاپ نمی‌خری، یک حس خاص و ماندگار می‌سازی.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-black text-white shadow-lg shadow-pink-900/30 transition hover:scale-[1.02] hover:opacity-90"
              >
                شروع سفارش چاپ
              </Link>

              <Link
                href="/design-request"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-black text-[var(--dark)] transition hover:scale-[1.02] hover:bg-[var(--accent)]"
              >
                ثبت درخواست طراحی
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="rounded-[1.5rem] bg-white p-6 text-[var(--dark)]">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-pink-50 p-6">
                    <div className="text-5xl">☕</div>
                    <p className="mt-5 font-black">ماگ اختصاصی</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      با عکس، متن یا طرح دلخواه
                    </p>
                  </div>

                  <div className="rounded-3xl bg-sky-50 p-6">
                    <div className="text-5xl">👕</div>
                    <p className="mt-5 font-black">تیشرت سفارشی</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      مناسب هدیه و برندینگ
                    </p>
                  </div>

                  <div className="rounded-3xl bg-yellow-50 p-6 sm:col-span-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-5xl">🎨</div>
                        <p className="mt-5 font-black">طراحی اختصاصی</p>
                        <p className="mt-2 text-sm leading-6 text-gray-600">
                          ایده‌ات را بفرست، ما برای چاپ آماده‌اش می‌کنیم.
                        </p>
                      </div>

                      <div className="hidden rounded-2xl bg-white px-4 py-3 text-sm font-black text-[var(--primary)] shadow-sm sm:block">
                        آماده سفارش
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black text-[var(--primary)]">
              دسته‌بندی خدمات
            </p>
            <h2 className="mt-3 text-3xl font-black text-[var(--dark)]">
              بر اساس نیازت انتخاب کن
            </h2>
            <p className="mt-4 leading-7 text-gray-600">
              دسته‌بندی‌ها را طوری چیدیم که کاربر با نیازش انتخاب کند، نه فقط
              با اسم فنی محصول.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((item) => (
              <Link
                key={item.title}
                href="/products"
                className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl"
              >
                <div className="text-5xl">{item.icon}</div>
                <h3 className="mt-6 text-lg font-black text-[var(--dark)] group-hover:text-[var(--primary)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-black text-[var(--primary)]">
                نمونه‌کارهای منتخب
              </p>
              <h2 className="mt-3 text-3xl font-black text-[var(--dark)]">
                ایده بگیر، بعد سفارش بده
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-gray-600">
                نمونه‌کارها مهم‌ترین بخش اعتمادسازی هستند. فعلاً این بخش
                استاتیک است و در Sprint بعدی به دیتابیس و گالری واقعی وصل
                می‌شود.
              </p>
            </div>

            <Link
              href="/portfolio"
              className="inline-flex rounded-2xl border border-gray-200 px-5 py-3 text-sm font-black text-[var(--dark)] transition hover:border-[var(--primary)] hover:bg-pink-50 hover:text-[var(--primary)]"
            >
              مشاهده همه نمونه‌کارها
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map((item) => (
              <div
                key={item.title}
                className="group overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-pink-50 via-sky-50 to-yellow-50 text-6xl transition group-hover:scale-105">
                  {item.icon}
                </div>
                <div className="bg-white p-5">
                  <p className="font-black text-[var(--dark)]">{item.title}</p>
                  <p className="mt-2 text-sm text-gray-500">
                    مناسب سفارش شخصی‌سازی‌شده
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-black text-[var(--primary)]">چرا ما؟</p>
            <h2 className="mt-3 text-3xl font-black leading-snug text-[var(--dark)]">
              تجربه‌ای ساده، قابل اعتماد و مناسب هدیه
            </h2>
            <p className="mt-5 leading-8 text-gray-600">
              تمرکز ما فقط چاپ نیست؛ کمک می‌کنیم محصولی بسازید که از نظر
              ظاهر، کیفیت و حس هدیه دادن، ارزشمند باشد.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "کیفیت چاپ قابل اعتماد",
              "طراحی اختصاصی",
              "آماده‌سازی سریع",
              "پشتیبانی قبل از سفارش",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)] font-black text-white">
                  ✓
                </div>
                <p className="font-black text-[var(--dark)]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order Steps */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black text-[var(--primary)]">
              مراحل سفارش
            </p>
            <h2 className="mt-3 text-3xl font-black text-[var(--dark)]">
              سفارش ساده، بدون پیچیدگی
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {orderSteps.map((step, index) => (
              <div
                key={step}
                className="rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--dark)] font-black text-white">
                  {index + 1}
                </div>
                <p className="mt-5 font-black text-[var(--dark)]">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[var(--dark)] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-br from-[#E6007E] via-[#d00072] to-[#00AEEF] p-8 text-center shadow-2xl sm:p-12">
          <h2 className="text-3xl font-black leading-snug">
            آماده‌ای هدیه اختصاصی خودت را بسازی؟
          </h2>
          <p className="mx-auto mt-4 max-w-2xl leading-8 text-white/85">
            محصولت را انتخاب کن یا اگر ایده خام داری، درخواست طراحی اختصاصی
            ثبت کن.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="rounded-2xl bg-white px-6 py-3 text-sm font-black text-[var(--dark)] transition hover:bg-[var(--accent)]"
            >
              سفارش چاپ
            </Link>
            <Link
              href="/design-request"
              className="rounded-2xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-black text-white transition hover:bg-white/20"
            >
              سفارش طراحی
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}