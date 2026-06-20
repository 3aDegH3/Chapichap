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

      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-black text-[var(--secondary)]">
              {current.work_type_label}
            </p>
            <h2 className="mt-1 text-xl font-black text-[var(--dark)]">
              {current.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-xl font-black text-gray-600 transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            aria-label="بستن"
          >
            ×
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="bg-gradient-to-br from-sky-50 via-white to-pink-50 p-4">
            <div className="aspect-square overflow-hidden rounded-lg border border-white bg-white shadow-sm">
              {activeImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeImageUrl}
                  alt={current.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-8">
                  <div className="grid h-40 w-40 place-items-center rounded-full border border-sky-100 bg-white text-center text-2xl font-black text-[var(--secondary)] shadow-sm">
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
                      "aspect-square overflow-hidden rounded-lg border bg-white transition",
                      activeImageUrl === image.image_url
                        ? "border-[var(--secondary)] ring-4 ring-sky-100"
                        : "border-gray-200 hover:border-[var(--secondary)]",
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
                <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
                <div className="h-24 animate-pulse rounded bg-gray-100" />
                <div className="h-12 animate-pulse rounded bg-gray-100" />
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500">نوع کار</p>
                    <p className="mt-1 font-black text-[var(--dark)]">
                      {current.work_type_label}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs font-bold text-gray-500">نوع سفارش</p>
                    <p className="mt-1 font-black text-[var(--dark)]">
                      {current.client_name || "سفارش اختصاصی"}
                    </p>
                  </div>
                </div>

                <p className="mt-6 whitespace-pre-line leading-8 text-gray-600">
                  {current.description ||
                    current.short_description ||
                    "جزئیات این نمونه‌کار به‌زودی کامل‌تر می‌شود."}
                </p>

                {detail && detail.related_items.length > 0 && (
                  <div className="mt-7 border-t border-gray-100 pt-5">
                    <h3 className="font-black text-[var(--dark)]">نمونه‌کارهای مشابه</h3>
                    <div className="mt-3 grid gap-2">
                      {detail.related_items.map((related) => (
                        <div
                          key={related.id}
                          className="rounded-lg bg-gray-50 px-4 py-3 text-right text-sm font-black text-gray-700"
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
