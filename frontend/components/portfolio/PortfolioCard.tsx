import type { PortfolioItem } from "@/lib/portfolio-api";

const workTypeTone: Record<string, string> = {
  mug: "from-[#F6F1E8] via-white to-[#FAFAF8] text-[#B2894C]",
  tshirt: "from-[#F2EEE6] via-white to-[#FAFAF8] text-[#B2894C]",
  gift: "from-[#F6F1E8] via-white to-[#F2EEE6] text-[#B2894C]",
  branding: "from-[#FAFAF8] via-white to-[#F2EEE6] text-[#333230]",
  design: "from-[#F6F1E8] via-white to-[#FAFAF8] text-[#B2894C]",
};

export default function PortfolioCard({
  item,
  onPreview,
}: {
  item: PortfolioItem;
  onPreview: (item: PortfolioItem) => void;
}) {
  const tone =
    workTypeTone[item.work_type] || "from-[#FAFAF8] via-white to-[#F2EEE6] text-[#333230]";

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E3DED5] bg-white shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] transition duration-300 hover:-translate-y-1 hover:border-[#D2AD70] hover:shadow-[0_22px_55px_-36px_rgba(51,50,48,0.75)]">
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
            <span className="inline-flex h-10 items-center rounded-xl bg-white px-4 text-sm font-black text-[#333230]">
              مشاهده سریع
            </span>
          </div>

          {item.is_featured && (
            <span className="absolute right-3 top-3 rounded-lg border border-[#D2AD70]/45 bg-[#F6F1E8] px-3 py-1 text-xs font-black text-[#333230] shadow-sm">
              منتخب
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-lg border border-[#E3DED5] bg-[#F6F1E8] px-3 py-1 text-xs font-black text-[#B2894C]">
              {item.work_type_label}
            </span>
            {item.completed_at && (
              <span className="text-xs font-bold text-[#77736D]">
                {new Date(item.completed_at).toLocaleDateString("fa-IR")}
              </span>
            )}
          </div>

          <h2 className="mt-4 line-clamp-1 text-lg font-black text-[#333230]">
            {item.title}
          </h2>

          <p className="mt-3 min-h-12 text-sm leading-6 text-[#77736D]">
            {item.short_description ||
              "نمونه‌کاری واقعی برای نمایش کیفیت چاپ، طراحی و اجرای سفارش."}
          </p>

          {item.client_name && (
            <p className="mt-4 text-xs font-black text-[#77736D]">
              نوع سفارش: {item.client_name}
            </p>
          )}
        </div>
      </button>
    </article>
  );
}
