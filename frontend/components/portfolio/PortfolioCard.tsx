import type { PortfolioItem } from "@/lib/portfolio-api";

const workTypeTone: Record<string, string> = {
  mug: "from-sky-50 via-white to-pink-50 text-[var(--secondary)]",
  tshirt: "from-pink-50 via-white to-yellow-50 text-[var(--primary)]",
  gift: "from-yellow-50 via-white to-sky-50 text-[#9A6B00]",
  branding: "from-gray-50 via-white to-sky-50 text-[var(--dark)]",
  design: "from-pink-50 via-white to-sky-50 text-[var(--primary)]",
};

export default function PortfolioCard({
  item,
  onPreview,
}: {
  item: PortfolioItem;
  onPreview: (item: PortfolioItem) => void;
}) {
  const tone =
    workTypeTone[item.work_type] || "from-gray-50 via-white to-sky-50 text-[var(--dark)]";

  return (
    <article className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl">
      <button
        type="button"
        onClick={() => onPreview(item)}
        className="block w-full text-right"
      >
        <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${tone}`}>
          {item.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.cover_image_url}
              alt={item.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="grid h-36 w-36 place-items-center rounded-full border border-white bg-white/80 text-center text-lg font-black shadow-sm backdrop-blur">
                نمونه‌کار
              </div>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-black text-[var(--dark)]">
              مشاهده سریع
            </span>
          </div>

          {item.is_featured && (
            <span className="absolute right-3 top-3 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-black text-[var(--dark)] shadow-sm">
              منتخب
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-[var(--secondary)]">
              {item.work_type_label}
            </span>
            {item.completed_at && (
              <span className="text-xs font-bold text-gray-400">
                {new Date(item.completed_at).toLocaleDateString("fa-IR")}
              </span>
            )}
          </div>

          <h2 className="mt-4 line-clamp-1 text-lg font-black text-[var(--dark)]">
            {item.title}
          </h2>

          <p className="mt-3 min-h-12 text-sm leading-6 text-gray-600">
            {item.short_description ||
              "نمونه‌کاری واقعی برای نمایش کیفیت چاپ، طراحی و اجرای سفارش."}
          </p>

          {item.client_name && (
            <p className="mt-4 text-xs font-black text-gray-500">
              نوع سفارش: {item.client_name}
            </p>
          )}
        </div>
      </button>
    </article>
  );
}
