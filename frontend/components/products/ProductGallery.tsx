"use client";

import { useMemo, useState } from "react";

import type { ProductDetail } from "@/lib/products-api";

type GalleryImage = {
  id: string;
  url: string | null;
  alt: string;
};

export default function ProductGallery({ product }: { product: ProductDetail }) {
  const images = useMemo<GalleryImage[]>(() => {
    const galleryImages = product.images.map((image) => ({
      id: String(image.id),
      url: image.image_url,
      alt: image.alt_text || product.title,
    }));

    if (product.image_url) {
      return [
        {
          id: "cover",
          url: product.image_url,
          alt: product.title,
        },
        ...galleryImages,
      ];
    }

    return galleryImages.length > 0
      ? galleryImages
      : [
          {
            id: "placeholder",
            url: null,
            alt: product.title,
          },
        ];
  }, [product]);

  const [activeId, setActiveId] = useState(images[0]?.id || "placeholder");
  const activeImage = images.find((image) => image.id === activeId) || images[0];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-[#E3DED5] bg-[#F6F1E8] shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
        <div className="aspect-square">
          {activeImage?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeImage.url}
              alt={activeImage.alt}
              className="h-full w-full object-cover"
              loading="eager"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-[#D2AD70]/50 bg-white text-5xl font-black text-[#B2894C] shadow-sm">
                چاپ
              </div>
            </div>
          )}
        </div>
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image) => {
            const isActive = image.id === activeId;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveId(image.id)}
                className={[
                  "aspect-square overflow-hidden rounded-xl border bg-white transition",
                  isActive
                    ? "border-[#D2AD70] ring-4 ring-[#D2AD70]/20"
                    : "border-[#E3DED5] hover:border-[#D2AD70]",
                ].join(" ")}
                aria-label={`نمایش تصویر ${image.alt}`}
              >
                {image.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm font-black text-[#B2894C]">
                    چاپ
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
