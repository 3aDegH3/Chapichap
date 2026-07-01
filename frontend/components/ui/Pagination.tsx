"use client";

type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

type PaginationProps = {
  page: number;
  totalPages: number;
  label: string;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  page,
  totalPages,
  label,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(page, totalPages);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label={label}
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="h-11 rounded-xl border border-[#E3DED5] px-4 text-sm font-black text-[#77736D] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] disabled:cursor-not-allowed disabled:opacity-40"
      >
        قبلی
      </button>

      {items.map((item) => {
        if (typeof item !== "number") {
          return (
            <span
              key={item}
              className="flex h-11 min-w-11 items-center justify-center rounded-xl text-sm font-black text-[#77736D]"
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={[
              "h-11 min-w-11 rounded-xl px-3 text-sm font-black transition",
              item === page
                ? "border border-[#D2AD70] bg-[#F6F1E8] text-[#333230]"
                : "border border-[#E3DED5] bg-white text-[#77736D] hover:border-[#D2AD70] hover:bg-[#F6F1E8]",
            ].join(" ")}
          >
            {item.toLocaleString("fa-IR")}
          </button>
        );
      })}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="h-11 rounded-xl border border-[#E3DED5] px-4 text-sm font-black text-[#77736D] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] disabled:cursor-not-allowed disabled:opacity-40"
      >
        بعدی
      </button>
    </nav>
  );
}

function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    2,
    totalPages - 1,
    totalPages,
    page - 1,
    page,
    page + 1,
  ]);

  const visiblePages = Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];

  visiblePages.forEach((item, index) => {
    const previous = visiblePages[index - 1];

    if (previous && item - previous > 1) {
      items.push(index < visiblePages.length / 2 ? "start-ellipsis" : "end-ellipsis");
    }

    items.push(item);
  });

  return items;
}
