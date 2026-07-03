import type { SVGProps } from "react";

import type { PortfolioItem } from "@/lib/portfolio-api";

type IconProps = SVGProps<SVGSVGElement>;

function formatPortfolioDate(date?: string | null) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getPortfolioDescription(item: PortfolioItem) {
  return (
    item.short_description ||
    "نمونه‌کاری واقعی برای نمایش کیفیت طراحی، چاپ و اجرای سفارش اختصاصی."
  );
}

export default function PortfolioCard({
  item,
  onPreview,
}: {
  item: PortfolioItem;
  onPreview: (item: PortfolioItem) => void;
}) {
  const completedDate = formatPortfolioDate(item.completed_at);
  const description = getPortfolioDescription(item);

  return (
    <article className="group relative h-full overflow-hidden rounded-[32px] border border-[#e6ded2] bg-[#f4eee5] shadow-[0_22px_55px_-38px_rgba(57,48,38,0.3)] transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#d1aa69] hover:shadow-[0_30px_65px_-38px_rgba(83,62,34,0.34)]">
      <button
        type="button"
        onClick={() => onPreview(item)}
        className="flex h-full w-full flex-col text-right outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c4934c]/65"
        aria-label={`مشاهده نمونه‌کار ${item.title}`}
      >
        {/* بخش تصویر نمونه‌کار */}
        <div className="relative aspect-[5/4] w-full overflow-hidden bg-[linear-gradient(145deg,#f5efe5_0%,#ede4d7_55%,#f8f4ed_100%)] sm:aspect-[4/3]">
          {/* محل خالی تصویر */}
          <div className="absolute inset-5 overflow-hidden rounded-[50%] border border-[#dcbf8d] bg-white/45 shadow-[inset_0_0_0_7px_rgba(255,255,255,0.45)] sm:inset-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.95),rgba(244,235,220,0.45)_65%,rgba(222,199,160,0.2)_100%)]" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#dfc59a] bg-white/85 text-[#a77835] shadow-[0_16px_35px_-25px_rgba(91,61,24,0.38)]">
                  <ImagePlaceholderIcon className="h-9 w-9" />
                </span>

                <span className="mt-4 text-[14px] font-black text-[#9a7a50]">
                  محل تصویر نمونه‌کار
                </span>
              </div>
            </div>
          </div>

          {/* تزئینات ملایم */}
          <div className="pointer-events-none absolute inset-0">
            <span className="absolute -right-16 bottom-10 h-44 w-72 rotate-[-12deg] rounded-[50%] border border-white/55" />
            <span className="absolute -right-20 bottom-3 h-40 w-80 rotate-[-8deg] rounded-[50%] border border-white/40" />

            <span className="absolute left-[8%] top-[21%] h-2.5 w-2.5 rotate-45 bg-[#d0a45e]" />
            <span className="absolute left-[13%] top-[25%] h-1.5 w-1.5 rotate-45 bg-[#e0c18c]" />

            <span className="absolute right-[11%] top-[42%] h-2 w-2 rounded-full bg-[#d5b375]/50" />
            <span className="absolute right-[15%] top-[47%] h-1.5 w-1.5 rounded-full bg-[#d5b375]/40" />
          </div>

          {/* نشان نمونه‌کار */}
          <span className="absolute left-4 top-4 inline-flex min-h-[46px] items-center gap-2.5 rounded-[16px] border border-[#e1bd7d] bg-white/88 px-4 text-[15px] font-black text-[#966727] shadow-[0_12px_28px_-20px_rgba(80,54,24,0.45)] backdrop-blur-md sm:left-5 sm:top-5">
            <SparklesIcon className="h-5 w-5 text-[#b37c33]" />

            {item.is_featured ? "نمونه‌کار منتخب" : "نمونه‌کار"}
          </span>
        </div>

        {/* پنل اطلاعات */}
        <div className="relative -mt-1 flex flex-1 flex-col rounded-t-[32px] bg-white px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
          {/* نوع کار و تاریخ */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex min-h-[44px] items-center gap-2.5 rounded-[15px] border border-[#e6dac8] bg-[#faf6ef] px-4 text-[15px] font-black text-[#936426]">
              <WorkIcon className="h-5 w-5 text-[#af7933]" />

              {item.work_type_label}
            </span>

            {completedDate && (
              <span className="inline-flex min-h-[44px] items-center gap-2.5 rounded-[15px] border border-[#e8e1d8] bg-white px-4 text-[14px] font-black text-[#5f5952]">
                <CalendarIcon className="h-5 w-5 text-[#aa7431]" />

                {completedDate}
              </span>
            )}
          </div>

          {/* جداکننده تزئینی */}
          <div
            className="my-5 flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span className="h-px flex-1 border-t border-dashed border-[#e2d8ca]" />

            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute h-3 w-3 rotate-45 rounded-[2px] bg-[#ca9b50]" />
              <span className="absolute h-1.5 w-1.5 rotate-45 rounded-[1px] bg-[#f4dfb9]" />
            </span>

            <span className="h-px flex-1 border-t border-dashed border-[#e2d8ca]" />
          </div>

          {/* عنوان */}
          <h2 className="line-clamp-2 text-center text-[24px] font-black leading-[1.6] text-[#322d29] transition-colors duration-300 group-hover:text-[#82571f] sm:text-[27px]">
            {item.title}
          </h2>

          {/* توضیحات */}
          <p className="mx-auto mt-3 line-clamp-3 min-h-[84px] max-w-[94%] text-center text-[16px] font-medium leading-[1.95] text-[#766f68] sm:text-[17px]">
            {description}
          </p>

          {/* نوع سفارش */}
          <div className="mt-5 border-t border-[#ebe4db] pt-4">
            <div className="flex min-h-[54px] items-center justify-center gap-3 rounded-[17px] bg-[#fcfaf7] px-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-[#f4eadb] text-[#a56f2d]">
                <UsersIcon className="h-6 w-6" />
              </span>

              <p className="text-center text-[15px] font-black text-[#4e4842] sm:text-[16px]">
                <span className="text-[#b0782c]">نوع سفارش:</span>{" "}
                {item.client_name || "سفارش اختصاصی"}
              </p>
            </div>
          </div>

          {/* راهنمای مشاهده */}
          <div className="mt-auto pt-4">
            <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] border border-[#e6ddd1] bg-white text-[14px] font-black text-[#8b622c] transition-[background-color,border-color,color] duration-300 group-hover:border-[#d2ad70] group-hover:bg-[#f8f1e6] group-hover:text-[#65451e]">
              مشاهده جزئیات نمونه‌کار

              <ArrowLeftIcon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />

      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
    </svg>
  );
}

function WorkIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 5h16v14H4z" />
      <path d="M8 5V3h8v2M4 10h16" />
    </svg>
  );
}

function CalendarIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4M17 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M14.5 15.5A4.5 4.5 0 0 1 21 19.5" />
    </svg>
  );
}

function ImagePlaceholderIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-5-5L5 20" />
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}