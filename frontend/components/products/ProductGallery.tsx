"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type SVGProps,
  type TouchEvent as ReactTouchEvent,
} from "react";

import type { ProductDetail } from "@/lib/products-api";

type IconProps = SVGProps<SVGSVGElement>;

type GalleryImage = {
  id: string;
  url: string | null;
  alt: string;
};

type GalleryStyle = CSSProperties & {
  "--gallery-pointer-x"?: string;
  "--gallery-pointer-y"?: string;
};

function createGalleryImages(product: ProductDetail): GalleryImage[] {
  const rawImages: GalleryImage[] = [];

  if (product.image_url) {
    rawImages.push({
      id: "cover",
      url: product.image_url,
      alt: product.title,
    });
  }

  for (const image of product.images ?? []) {
    rawImages.push({
      id: String(image.id),
      url: image.image_url,
      alt: image.alt_text || product.title,
    });
  }

  const seenImages = new Set<string>();

  const uniqueImages = rawImages.filter((image) => {
    const uniqueKey = image.url || `image-${image.id}`;

    if (seenImages.has(uniqueKey)) {
      return false;
    }

    seenImages.add(uniqueKey);
    return true;
  });

  if (uniqueImages.length > 0) {
    return uniqueImages;
  }

  return [
    {
      id: "placeholder",
      url: null,
      alt: product.title,
    },
  ];
}

export default function ProductGallery({
  product,
}: {
  product: ProductDetail;
}) {
  const images = useMemo(() => createGalleryImages(product), [product]);

  const [selectedImageId, setSelectedImageId] = useState(
    images[0]?.id ?? "placeholder",
  );
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isContainMode, setIsContainMode] = useState(true);

  const mainStageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const thumbnailRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});

  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);

  const selectedImageIndex = images.findIndex(
    (image) => image.id === selectedImageId,
  );
  const activeIndex = Math.max(0, selectedImageIndex);

  const activeImage = images[activeIndex] ?? images[0];
  const activeId = activeImage?.id ?? "placeholder";
  const isImageLoaded =
    !activeImage?.url || loadedImageUrl === activeImage.url;

  const galleryStyle: GalleryStyle = {
    "--gallery-pointer-x": "50%",
    "--gallery-pointer-y": "50%",
  };

  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[activeId];

    activeThumbnail?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeId]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimeout = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(focusTimeout);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        showNextImage();
      }

      if (event.key === "ArrowRight") {
        showPreviousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  useEffect(() => {
    if (images.length <= 1) return;

    const previousIndex =
      activeIndex === 0 ? images.length - 1 : activeIndex - 1;

    const nextIndex =
      activeIndex === images.length - 1 ? 0 : activeIndex + 1;

    const neighboringImages = [
      images[previousIndex],
      images[nextIndex],
    ];

    for (const image of neighboringImages) {
      if (!image?.url) continue;

      const preloadedImage = new window.Image();
      preloadedImage.src = image.url;
    }
  }, [activeIndex, images]);

  function selectImage(imageId: string) {
    if (imageId === activeId) return;

    setSelectedImageId(imageId);
  }

  function showPreviousImage() {
    if (images.length <= 1) return;

    const previousIndex =
      activeIndex === 0 ? images.length - 1 : activeIndex - 1;

    selectImage(images[previousIndex].id);
  }

  function showNextImage() {
    if (images.length <= 1) return;

    const nextIndex =
      activeIndex === images.length - 1 ? 0 : activeIndex + 1;

    selectImage(images[nextIndex].id);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const stage = mainStageRef.current;

    if (!stage || !activeImage?.url) return;

    const bounds = stage.getBoundingClientRect();

    const pointerX =
      ((event.clientX - bounds.left) / bounds.width) * 100;

    const pointerY =
      ((event.clientY - bounds.top) / bounds.height) * 100;

    stage.style.setProperty(
      "--gallery-pointer-x",
      `${Math.min(100, Math.max(0, pointerX))}%`,
    );

    stage.style.setProperty(
      "--gallery-pointer-y",
      `${Math.min(100, Math.max(0, pointerY))}%`,
    );
  }

  function handlePointerLeave() {
    const stage = mainStageRef.current;

    if (!stage) return;

    stage.style.setProperty("--gallery-pointer-x", "50%");
    stage.style.setProperty("--gallery-pointer-y", "50%");
  }

  function handleTouchStart(
    event: ReactTouchEvent<HTMLDivElement>,
  ) {
    const firstTouch = event.touches[0];

    if (!firstTouch) return;

    touchStartXRef.current = firstTouch.clientX;
    touchCurrentXRef.current = firstTouch.clientX;
  }

  function handleTouchMove(
    event: ReactTouchEvent<HTMLDivElement>,
  ) {
    const firstTouch = event.touches[0];

    if (!firstTouch) return;

    touchCurrentXRef.current = firstTouch.clientX;
  }

  function handleTouchEnd() {
    const touchStart = touchStartXRef.current;
    const touchEnd = touchCurrentXRef.current;

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;

    if (touchStart === null || touchEnd === null) return;

    const difference = touchStart - touchEnd;

    if (Math.abs(difference) < 55) return;

    if (difference > 0) {
      showNextImage();
      return;
    }

    showPreviousImage();
  }

  return (
    <>
      <section
        className="product-gallery-root relative"
        aria-label={`گالری تصاویر ${product.title}`}
      >
        {/* عنوان گالری */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="product-gallery-title-icon relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-[#d2ad70]/35 bg-[#f7ecda] text-[#936020] shadow-[0_16px_35px_-26px_rgba(133,85,25,0.7)]">
              <span className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent" />
              <GalleryIcon className="relative h-7 w-7" />
            </span>

            <div>
              <p className="text-[20px] font-black tracking-[0.05em] text-[#a06d29]">
                نمایش محصول
              </p>

              <h2 className="mt-1 text-[24px] font-black leading-9 text-[#302b26] sm:text-[27px]">
                گالری تصاویر
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e2d8ca] bg-white px-4 text-[20px] font-black text-[#766b60] shadow-[0_12px_30px_-24px_rgba(40,34,28,0.5)]"
              aria-live="polite"
            >
              <ImageIcon className="h-5 w-5 text-[#aa7938]" />

              تصویر {(activeIndex + 1).toLocaleString("fa-IR")} از{" "}
              {images.length.toLocaleString("fa-IR")}
            </span>
          </div>
        </div>

        {/* قاب اصلی گالری */}
        <div className="product-gallery-shell relative overflow-hidden rounded-[34px] border border-[#ded3c5] bg-[#f4eee5] shadow-[0_35px_90px_-55px_rgba(43,36,28,0.8)]">
          <div
            className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            aria-hidden="true"
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#d2ad70]/20 blur-[75px]" />

            <span className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white/60 blur-[75px]" />

            <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.7),transparent_62%)]" />

            <span className="product-gallery-grid absolute inset-0 opacity-[0.13]" />
          </div>

          {/* نوار بالای تصویر */}
          <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="product-gallery-floating-badge inline-flex min-h-11 items-center gap-2 rounded-full border border-white/65 bg-white/85 px-4 text-[20px] font-black text-[#7d531e] shadow-[0_15px_35px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl">
                <SparklesIcon className="h-5 w-5 text-[#b47d34]" />
                تصویر واقعی محصول
              </span>

              {images.length > 1 && (
                <span className="hidden min-h-11 items-center gap-2 rounded-full border border-white/55 bg-[#292521]/75 px-4 text-[20px] font-black text-white shadow-[0_15px_35px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:inline-flex">
                  <SwipeIcon className="h-5 w-5 text-[#e0b66e]" />
                  برای تغییر تصویر ورق بزن
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsContainMode((current) => !current)}
              className="group/fit flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/60 bg-white/85 text-[#5f554a] shadow-[0_15px_35px_-24px_rgba(0,0,0,0.65)] backdrop-blur-xl outline-none transition-all duration-500 hover:-translate-y-1 hover:border-[#c99a52] hover:bg-[#292521] hover:text-white focus-visible:ring-2 focus-visible:ring-[#c99a52]/70"
              aria-label={
                isContainMode
                  ? "پر کردن قاب با تصویر"
                  : "نمایش کامل تصویر"
              }
              title={
                isContainMode
                  ? "پر کردن قاب"
                  : "نمایش کامل تصویر"
              }
            >
              {isContainMode ? (
                <MaximizeIcon className="h-6 w-6 transition-transform duration-500 group-hover/fit:scale-110" />
              ) : (
                <MinimizeIcon className="h-6 w-6 transition-transform duration-500 group-hover/fit:scale-110" />
              )}
            </button>
          </div>

          {/* استیج اصلی */}
          <div
            ref={mainStageRef}
            style={galleryStyle}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="product-gallery-stage group relative aspect-[4/3] touch-pan-y overflow-hidden sm:aspect-square"
          >
            {activeImage?.url ? (
              <>
                {!isImageLoaded && (
                  <div className="product-gallery-skeleton absolute inset-0 z-10" />
                )}

                <Image
                  key={`${activeImage.id}-${isContainMode}`}
                  src={activeImage.url}
                  alt={activeImage.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 55vw, 720px"
                  loading="eager"
                  onLoad={() => setLoadedImageUrl(activeImage.url)}
                  onError={() => setLoadedImageUrl(activeImage.url)}
                  className={[
                    "product-gallery-main-image h-full w-full transition-[transform,opacity,filter] duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isContainMode
                      ? "object-contain p-4 sm:p-7"
                      : "object-cover",
                    isImageLoaded
                      ? "opacity-100"
                      : "opacity-0",
                  ].join(" ")}
                />
              </>
            ) : (
              <div className="relative flex h-full w-full items-center justify-center p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(210,173,112,0.34),transparent_48%)]" />

                <div className="product-gallery-placeholder relative flex h-44 w-44 items-center justify-center rounded-full border border-[#d2ad70]/55 bg-white text-[#976524] shadow-[0_32px_70px_-42px_rgba(96,60,20,0.8)] sm:h-52 sm:w-52">
                  <span className="absolute inset-3 rounded-full border border-dashed border-[#d2ad70]/45" />

                  <PrintIcon className="h-16 w-16 sm:h-20 sm:w-20" />
                </div>
              </div>
            )}

            {/* نور دنبال‌کننده ماوس */}
            <span
              className="product-gallery-pointer-light pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden="true"
            />

            {/* لایه‌های روی تصویر */}
            <span
              className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#1d1915]/35 via-transparent to-white/10"
              aria-hidden="true"
            />

            <span
              className="product-gallery-image-shine pointer-events-none absolute inset-y-0 -left-1/2 z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-sm"
              aria-hidden="true"
            />

            {/* باز کردن لایت‌باکس */}
            {activeImage?.url && (
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute inset-0 z-10 cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c99a52]/80"
                aria-label={`نمایش بزرگ تصویر ${activeImage.alt}`}
              />
            )}

            {/* دکمه قبلی */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={showPreviousImage}
                className="product-gallery-navigation product-gallery-navigation--previous absolute right-4 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-[19px] border border-white/30 bg-[#292521]/80 text-white shadow-[0_20px_45px_-25px_rgba(0,0,0,0.95)] backdrop-blur-xl outline-none transition-all duration-500 hover:right-3 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/70 sm:right-5 sm:h-16 sm:w-16"
                aria-label="تصویر قبلی"
              >
                <ChevronRightIcon className="h-7 w-7" />
              </button>
            )}

            {/* دکمه بعدی */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={showNextImage}
                className="product-gallery-navigation product-gallery-navigation--next absolute left-4 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-[19px] border border-white/30 bg-[#292521]/80 text-white shadow-[0_20px_45px_-25px_rgba(0,0,0,0.95)] backdrop-blur-xl outline-none transition-all duration-500 hover:left-3 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/70 sm:left-5 sm:h-16 sm:w-16"
                aria-label="تصویر بعدی"
              >
                <ChevronLeftIcon className="h-7 w-7" />
              </button>
            )}

            {/* کنترل‌های پایین */}
            <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                {images.length > 1 && (
                  <div className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-[#292521]/75 px-3 py-2.5 shadow-[0_15px_35px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:flex">
                    {images.map((image, index) => {
                      const isActive = image.id === activeId;

                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() => selectImage(image.id)}
                          className={[
                            "h-2.5 rounded-full outline-none transition-all duration-500 focus-visible:ring-2 focus-visible:ring-[#d2ad70]",
                            isActive
                              ? "w-8 bg-[#d2ad70]"
                              : "w-2.5 bg-white/40 hover:bg-white/75",
                          ].join(" ")}
                          aria-label={`نمایش تصویر ${(index + 1).toLocaleString(
                            "fa-IR",
                          )}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {activeImage?.url && (
                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  className="group/zoom inline-flex min-h-13 items-center gap-2.5 rounded-[17px] border border-white/25 bg-[#292521]/80 px-5 text-[20px] font-black text-white shadow-[0_18px_40px_-26px_rgba(0,0,0,0.9)] backdrop-blur-xl outline-none transition-all duration-500 hover:-translate-y-1 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70]/70 sm:text-[20px]"
                >
                  <ZoomInIcon className="h-6 w-6 transition-transform duration-500 group-hover/zoom:scale-110" />
                  مشاهده بزرگ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnailها */}
        {images.length > 1 && (
          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-[20px] font-black text-[#766b60] sm:text-[20px]">
                <LayersIcon className="h-5 w-5 text-[#a97531]" />
                تصاویر دیگر محصول
              </p>

              <p className="text-[20px] font-bold text-[#9c9185] sm:text-[20px]">
                برای انتخاب کلیک کنید
              </p>
            </div>

            <div className="product-gallery-thumbnails relative">
              <span className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#fbfaf6] to-transparent sm:hidden" />

              <span className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#fbfaf6] to-transparent sm:hidden" />

              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0.5 pb-3 pt-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0 lg:grid-cols-6">
                {images.map((image, index) => {
                  const isActive = image.id === activeId;

                  return (
                    <button
                      key={image.id}
                      ref={(node) => {
                        thumbnailRefs.current[image.id] = node;
                      }}
                      type="button"
                      data-gallery-id={image.id}
                      onClick={() => selectImage(image.id)}
                      className={[
                        "product-gallery-thumbnail group/thumb relative aspect-square w-[94px] shrink-0 snap-center overflow-hidden rounded-[20px] border bg-white outline-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-[#c99a52]/70 sm:w-auto",
                        isActive
                          ? "-translate-y-1 border-[#c99a52] shadow-[0_20px_40px_-27px_rgba(124,79,20,0.65)] ring-4 ring-[#d2ad70]/15"
                          : "border-[#e2d8ca] shadow-[0_14px_32px_-27px_rgba(40,34,28,0.5)] hover:-translate-y-1 hover:border-[#c99a52]/70 hover:shadow-[0_20px_40px_-28px_rgba(124,79,20,0.55)]",
                      ].join(" ")}
                      aria-label={`نمایش تصویر ${(
                        index + 1
                      ).toLocaleString("fa-IR")} از ${product.title}`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {image.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.url}
                          alt={image.alt}
                          loading="lazy"
                          className={[
                            "h-full w-full object-cover transition-[transform,filter] duration-700 ease-out group-hover/thumb:scale-110",
                            isActive
                              ? "saturate-[1.08]"
                              : "saturate-[0.82] group-hover/thumb:saturate-100",
                          ].join(" ")}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-[#f5efe6] text-[#a16e2b]">
                          <PrintIcon className="h-8 w-8" />
                        </span>
                      )}

                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#201b17]/50 via-transparent to-white/5 opacity-60 transition-opacity duration-500 group-hover/thumb:opacity-35" />

                      <span
                        className={[
                          "absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full border px-1.5 text-[20px] font-black shadow-sm backdrop-blur-md transition-all duration-500",
                          isActive
                            ? "border-[#d2ad70] bg-[#d2ad70] text-[#292521]"
                            : "border-white/30 bg-[#292521]/70 text-white",
                        ].join(" ")}
                      >
                        {(index + 1).toLocaleString("fa-IR")}
                      </span>

                      {isActive && (
                        <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-[11px] bg-white text-[#90601f] shadow-[0_10px_22px_-13px_rgba(0,0,0,0.8)]">
                          <CheckIcon className="h-5 w-5" />
                        </span>
                      )}

                      <span
                        className={[
                          "absolute inset-x-2 bottom-0 h-1 origin-center rounded-full bg-[#d2ad70] transition-transform duration-500",
                          isActive ? "scale-x-100" : "scale-x-0",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* راهنمای گالری */}
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="product-gallery-help-card group flex min-h-[70px] items-center gap-3 rounded-[20px] border border-[#e5ddd1] bg-white px-4 transition-all duration-500 hover:-translate-y-1 hover:border-[#d2ad70]/55 hover:shadow-[0_18px_40px_-32px_rgba(93,61,22,0.55)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#f4ead9] text-[#946121] transition-transform duration-500 group-hover:rotate-[-5deg]">
              <ZoomInIcon className="h-6 w-6" />
            </span>

            <span>
              <span className="block text-[20px] font-black text-[#39342f]">
                مشاهده جزئیات
              </span>

              <span className="mt-0.5 block text-[20px] font-bold text-[#978c80]">
                روی تصویر کلیک کن
              </span>
            </span>
          </div>

          <div className="product-gallery-help-card group flex min-h-[70px] items-center gap-3 rounded-[20px] border border-[#e5ddd1] bg-white px-4 transition-all duration-500 hover:-translate-y-1 hover:border-[#d2ad70]/55 hover:shadow-[0_18px_40px_-32px_rgba(93,61,22,0.55)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#f4ead9] text-[#946121] transition-transform duration-500 group-hover:rotate-[-5deg]">
              <SwipeIcon className="h-6 w-6" />
            </span>

            <span>
              <span className="block text-[20px] font-black text-[#39342f]">
                حرکت بین تصاویر
              </span>

              <span className="mt-0.5 block text-[20px] font-bold text-[#978c80]">
                در موبایل ورق بزن
              </span>
            </span>
          </div>

          <div className="product-gallery-help-card group flex min-h-[70px] items-center gap-3 rounded-[20px] border border-[#e5ddd1] bg-white px-4 transition-all duration-500 hover:-translate-y-1 hover:border-[#d2ad70]/55 hover:shadow-[0_18px_40px_-32px_rgba(93,61,22,0.55)]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#f4ead9] text-[#946121] transition-transform duration-500 group-hover:rotate-[-5deg]">
              <MouseIcon className="h-6 w-6" />
            </span>

            <span>
              <span className="block text-[20px] font-black text-[#39342f]">
                زوم هوشمند
              </span>

              <span className="mt-0.5 block text-[20px] font-bold text-[#978c80]">
                ماوس را روی تصویر ببر
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* لایت‌باکس */}
      {isLightboxOpen && (
        <div
          className="product-gallery-lightbox fixed inset-0 z-[150] flex items-center justify-center bg-[#171411]/95 p-3 backdrop-blur-2xl sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute inset-0 cursor-default"
            aria-label="بستن نمایش بزرگ تصویر"
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`نمایش بزرگ تصاویر ${product.title}`}
            tabIndex={-1}
            className="product-gallery-dialog relative z-10 flex h-[min(94dvh,980px)] w-full max-w-[1500px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#211e1b] shadow-[0_45px_140px_-40px_rgba(0,0,0,1)] outline-none sm:rounded-[36px]"
          >
            {/* هدر لایت‌باکس */}
            <div className="relative flex min-h-[78px] items-center justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(210,173,112,0.18),transparent_38%)]" />

              <div className="relative flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[#d2ad70]/30 bg-[#d2ad70]/10 text-[#e2b973]">
                  <GalleryIcon className="h-6 w-6" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[20px] font-black text-white sm:text-[20px]">
                    {product.title}
                  </p>

                  <p className="mt-1 text-[20px] font-bold text-[#a99d91] sm:text-[20px]">
                    تصویر {(activeIndex + 1).toLocaleString("fa-IR")} از{" "}
                    {images.length.toLocaleString("fa-IR")}
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsContainMode((current) => !current)}
                  className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.06] text-[#d0c5ba] outline-none transition-all duration-500 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70]"
                  aria-label={
                    isContainMode
                      ? "پر کردن قاب با تصویر"
                      : "نمایش کامل تصویر"
                  }
                >
                  {isContainMode ? (
                    <MaximizeIcon className="h-6 w-6" />
                  ) : (
                    <MinimizeIcon className="h-6 w-6" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.06] text-white outline-none transition-all duration-500 hover:rotate-90 hover:border-red-300/30 hover:bg-red-500/15 hover:text-red-200 focus-visible:ring-2 focus-visible:ring-red-300/60"
                  aria-label="بستن"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* تصویر لایت‌باکس */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center overflow-hidden bg-[#171411]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(210,173,112,0.09),transparent_58%)]" />

              {activeImage?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`lightbox-${activeImage.id}-${isContainMode}`}
                  src={activeImage.url}
                  alt={activeImage.alt}
                  className={[
                    "product-gallery-lightbox-image relative z-10 h-full w-full",
                    isContainMode
                      ? "object-contain p-3 sm:p-8"
                      : "object-cover",
                  ].join(" ")}
                />
              ) : (
                <div className="product-gallery-placeholder relative flex h-48 w-48 items-center justify-center rounded-full border border-[#d2ad70]/40 bg-white/[0.06] text-[#e1b873]">
                  <PrintIcon className="h-20 w-20" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute right-3 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-[19px] border border-white/15 bg-[#292521]/80 text-white backdrop-blur-xl outline-none transition-all duration-500 hover:right-2 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70] sm:right-6 sm:h-16 sm:w-16"
                    aria-label="تصویر قبلی"
                  >
                    <ChevronRightIcon className="h-8 w-8" />
                  </button>

                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute left-3 top-1/2 z-20 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-[19px] border border-white/15 bg-[#292521]/80 text-white backdrop-blur-xl outline-none transition-all duration-500 hover:left-2 hover:border-[#d2ad70] hover:bg-[#d2ad70] hover:text-[#292521] focus-visible:ring-2 focus-visible:ring-[#d2ad70] sm:left-6 sm:h-16 sm:w-16"
                    aria-label="تصویر بعدی"
                  >
                    <ChevronLeftIcon className="h-8 w-8" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnailهای لایت‌باکس */}
            {images.length > 1 && (
              <div className="border-t border-white/10 bg-[#211e1b] p-3 sm:p-4">
                <div className="flex justify-start gap-3 overflow-x-auto pb-1">
                  {images.map((image, index) => {
                    const isActive = image.id === activeId;

                    return (
                      <button
                        key={`lightbox-thumbnail-${image.id}`}
                        type="button"
                        onClick={() => selectImage(image.id)}
                        className={[
                          "relative h-20 w-20 shrink-0 overflow-hidden rounded-[16px] border outline-none transition-all duration-500 sm:h-24 sm:w-24",
                          isActive
                            ? "-translate-y-1 border-[#d2ad70] ring-4 ring-[#d2ad70]/15"
                            : "border-white/10 opacity-60 hover:border-[#d2ad70]/60 hover:opacity-100",
                        ].join(" ")}
                        aria-label={`نمایش تصویر ${(
                          index + 1
                        ).toLocaleString("fa-IR")}`}
                      >
                        {image.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center bg-white/[0.06] text-[#d2ad70]">
                            <PrintIcon className="h-7 w-7" />
                          </span>
                        )}

                        <span className="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#211e1b]/80 px-1 text-[20px] font-black text-white backdrop-blur">
                          {(index + 1).toLocaleString("fa-IR")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .product-gallery-root {
          isolation: isolate;
        }

        .product-gallery-shell {
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .product-gallery-grid {
          background-image:
            linear-gradient(
              rgba(132, 93, 42, 0.25) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(132, 93, 42, 0.25) 1px,
              transparent 1px
            );
          background-size: 42px 42px;
          mask-image: radial-gradient(
            circle at center,
            black,
            transparent 75%
          );
        }

        .product-gallery-pointer-light {
          background: radial-gradient(
            390px circle at var(--gallery-pointer-x)
              var(--gallery-pointer-y),
            rgba(255, 255, 255, 0.26),
            transparent 68%
          );
        }

        .product-gallery-main-image {
          transform-origin:
            var(--gallery-pointer-x) var(--gallery-pointer-y);
          animation: product-gallery-image-enter 800ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        @media (hover: hover) and (pointer: fine) {
          .product-gallery-stage:hover
            .product-gallery-main-image {
            transform: scale(1.075);
            filter: saturate(1.035) contrast(1.02);
          }
        }

        .product-gallery-stage:hover
          .product-gallery-image-shine {
          animation: product-gallery-shine 1.15s ease-out;
        }

        .product-gallery-skeleton {
          background: linear-gradient(
            105deg,
            #e9e0d4 20%,
            #faf7f1 38%,
            #e9e0d4 56%
          );
          background-size: 240% 100%;
          animation: product-gallery-skeleton 1.6s linear infinite;
        }

        .product-gallery-floating-badge {
          animation: product-gallery-badge 4.5s ease-in-out infinite;
        }

        .product-gallery-title-icon {
          animation: product-gallery-title-icon 5s ease-in-out
            infinite;
        }

        .product-gallery-placeholder {
          animation: product-gallery-placeholder 5.5s ease-in-out
            infinite;
        }

        .product-gallery-navigation {
          opacity: 0.82;
        }

        .product-gallery-stage:hover
          .product-gallery-navigation {
          opacity: 1;
        }

        .product-gallery-thumbnail::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            120deg,
            transparent 25%,
            rgba(255, 255, 255, 0.18),
            transparent 70%
          );
          transform: translateX(130%);
          transition: transform 800ms ease;
        }

        .product-gallery-thumbnail:hover::after {
          transform: translateX(-130%);
        }

        .product-gallery-help-card {
          position: relative;
          overflow: hidden;
        }

        .product-gallery-help-card::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(210, 173, 112, 0.1),
            transparent 75%
          );
          transform: translateX(130%);
          transition: transform 900ms ease;
        }

        .product-gallery-help-card:hover::after {
          transform: translateX(-130%);
        }

        .product-gallery-lightbox {
          animation: product-gallery-lightbox-background 350ms
            ease-out;
        }

        .product-gallery-dialog {
          animation: product-gallery-dialog-enter 550ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .product-gallery-lightbox-image {
          animation: product-gallery-lightbox-image 650ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .product-gallery-thumbnails ::-webkit-scrollbar,
        .product-gallery-dialog ::-webkit-scrollbar {
          height: 5px;
        }

        .product-gallery-thumbnails
          ::-webkit-scrollbar-track,
        .product-gallery-dialog ::-webkit-scrollbar-track {
          background: transparent;
        }

        .product-gallery-thumbnails
          ::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(178, 137, 76, 0.35);
        }

        .product-gallery-dialog ::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(210, 173, 112, 0.35);
        }

        @keyframes product-gallery-image-enter {
          from {
            opacity: 0;
            transform: scale(0.97);
            filter: blur(5px);
          }

          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes product-gallery-shine {
          from {
            transform: translateX(0) skewX(-12deg);
          }

          to {
            transform: translateX(650%) skewX(-12deg);
          }
        }

        @keyframes product-gallery-skeleton {
          from {
            background-position: 220% 0;
          }

          to {
            background-position: -20% 0;
          }
        }

        @keyframes product-gallery-badge {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes product-gallery-title-icon {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }

          50% {
            transform: translateY(-4px) rotate(-4deg);
          }
        }

        @keyframes product-gallery-placeholder {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }

          50% {
            transform: translateY(-9px) rotate(-3deg);
          }
        }

        @keyframes product-gallery-lightbox-background {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes product-gallery-dialog-enter {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes product-gallery-lightbox-image {
          from {
            opacity: 0;
            transform: scale(0.97);
            filter: blur(6px);
          }

          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @media (max-width: 639px) {
          .product-gallery-navigation {
            opacity: 0.92;
          }

          .product-gallery-pointer-light {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .product-gallery-root *,
          .product-gallery-root *::before,
          .product-gallery-root *::after,
          .product-gallery-lightbox *,
          .product-gallery-lightbox *::before,
          .product-gallery-lightbox *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .product-gallery-stage:hover
            .product-gallery-main-image {
            transform: none !important;
          }

          .product-gallery-floating-badge,
          .product-gallery-title-icon,
          .product-gallery-placeholder {
            transform: none !important;
          }
        }
      `}</style>
    </>
  );
}

function GalleryIcon(props: IconProps) {
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

function ImageIcon(props: IconProps) {
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
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4-4L5 21" />
    </svg>
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

function PrintIcon(props: IconProps) {
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
      <path d="M7 8V3h10v5" />
      <path d="M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
      <path d="M18 11h.01" />
    </svg>
  );
}

function ZoomInIcon(props: IconProps) {
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
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5M8 10.5h5M10.5 8v5" />
    </svg>
  );
}

function SwipeIcon(props: IconProps) {
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
      <path d="M9 11V7a2 2 0 0 1 4 0v4" />
      <path d="M13 10V6a2 2 0 0 1 4 0v6" />
      <path d="M17 10a2 2 0 0 1 4 0v4c0 4-3 7-7 7h-1a7 7 0 0 1-5.5-2.7L4 14a2 2 0 0 1 3-2.6L9 14V9a2 2 0 0 1 4 0" />
      <path d="M3 5h4M5 3 3 5l2 2" />
    </svg>
  );
}

function MouseIcon(props: IconProps) {
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
      <rect x="6" y="2" width="12" height="20" rx="6" />
      <path d="M12 2v6M9 8h6" />
    </svg>
  );
}

function LayersIcon(props: IconProps) {
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
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </svg>
  );
}

function MaximizeIcon(props: IconProps) {
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
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
    </svg>
  );
}

function MinimizeIcon(props: IconProps) {
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
      <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" />
    </svg>
  );
}

function ChevronLeftIcon(props: IconProps) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon(props: IconProps) {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function CloseIcon(props: IconProps) {
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
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
