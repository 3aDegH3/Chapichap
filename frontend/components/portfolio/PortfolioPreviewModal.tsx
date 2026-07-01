"use client";

import { useEffect, useState } from "react";

import {
  getPortfolioItem,
  type PortfolioDetail,
  type PortfolioItem,
} from "@/lib/portfolio-api";

export default function PortfolioPreviewModal({
  item,
  onClose,
}: {
  item: PortfolioItem | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<PortfolioDetail | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!item) return;

    const previewItem = item;
    let isMounted = true;

    async function loadDetail() {
      setIsLoading(true);
      setDetail(null);
      setActiveImageUrl(previewItem.cover_image_url);

      try {
        const data = await getPortfolioItem(previewItem.slug);
        if (!isMounted) return;
        setDetail(data);
        setActiveImageUrl(data.cover_image_url || data.images[0]?.image_url || null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [item]);

  useEffect(() => {
    if (!item) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const current = detail || item;
  const galleryImages = detail
    ? [
        ...(detail.cover_image_url
          ? [{ id: "cover", image_url: detail.cover_image_url, alt_text: detail.title }]
          : []),
        ...detail.images,
      ]
    : [];

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        onClick={onClose}
        aria-label="بستن پیش‌نمایش"
      />

      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#E3DED5] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#E3DED5] px-5 py-4">
          <div>
            <p className="text-xs font-black text-[#B2894C]">
              {current.work_type_label}
            </p>
            <h2 className="mt-1 text-xl font-black text-[#333230]">
              {current.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E3DED5] text-xl font-black text-[#77736D] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] hover:text-[#333230]"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-[#F6F1E8] p-4">
            <div className="aspect-square overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
              {activeImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImageUrl}
                  alt={current.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-8">
                  <div className="grid h-40 w-40 place-items-center rounded-full border border-[#D2AD70]/35 bg-white text-center text-2xl font-black text-[#B2894C] shadow-sm">
                    نمونه‌کار
                  </div>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {galleryImages.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageUrl(image.image_url)}
                    className={[
                      "aspect-square overflow-hidden rounded-xl border bg-white transition",
                      activeImageUrl === image.image_url
                        ? "border-[#D2AD70] ring-4 ring-[#D2AD70]/20"
                        : "border-[#E3DED5] hover:border-[#D2AD70]",
                    ].join(" ")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.image_url}
                      alt={image.alt_text || current.title}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-5 w-32 animate-pulse rounded bg-[#E3DED5]" />
                <div className="h-24 animate-pulse rounded bg-[#E3DED5]" />
                <div className="h-12 animate-pulse rounded bg-[#E3DED5]" />
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-[#FAFAF8] p-4">
                    <p className="text-xs font-bold text-[#77736D]">نوع کار</p>
                    <p className="mt-1 font-black text-[#333230]">
                      {current.work_type_label}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FAFAF8] p-4">
                    <p className="text-xs font-bold text-[#77736D]">نوع سفارش</p>
                    <p className="mt-1 font-black text-[#333230]">
                      {current.client_name || "سفارش اختصاصی"}
                    </p>
                  </div>
                </div>

                <p className="mt-6 whitespace-pre-line leading-8 text-[#77736D]">
                  {current.description ||
                    current.short_description ||
                    "جزئیات این نمونه‌کار به‌زودی کامل‌تر می‌شود."}
                </p>

                {detail && detail.related_items.length > 0 && (
                  <div className="mt-7 border-t border-[#E3DED5] pt-5">
                    <h3 className="font-black text-[#333230]">نمونه‌کارهای مشابه</h3>
                    <div className="mt-3 grid gap-2">
                      {detail.related_items.map((related) => (
                        <div
                          key={related.id}
                          className="rounded-xl bg-[#FAFAF8] px-4 py-3 text-right text-sm font-black text-[#77736D]"
                        >
                          {related.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
