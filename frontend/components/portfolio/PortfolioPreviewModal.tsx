"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
  type SVGProps,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import {
  getPortfolioItem,
  type PortfolioDetail,
  type PortfolioItem,
} from "@/lib/portfolio-api";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = ComponentType<IconProps>;

type PreviewImage = {
  id: string;
  imageUrl: string;
  altText: string;
};

type CopyStatus = "idle" | "copied" | "failed";
type ImageFit = "contain" | "cover";

type PortfolioPreviewModalProps = {
  item: PortfolioItem | null;
  onClose: () => void;

  /*
   * اختیاری تعریف شده تا اگر در PortfolioClient ارسال نشده باشد،
   * برنامه با خطای onPreview is not defined متوقف نشود.
   */
  onPreview?: (item: PortfolioItem) => void;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

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
    month: "long",
    day: "numeric",
  });
}

function getPortfolioDescription(
  item: PortfolioItem,
  detail: PortfolioDetail | null,
) {
  const detailDescription = detail?.description;
  const detailShortDescription = detail?.short_description;

  const itemDescription =
    "description" in item ? item.description : undefined;

  return (
    detailDescription ||
    detailShortDescription ||
    itemDescription ||
    item.short_description ||
    "جزئیات کامل این نمونه‌کار به‌زودی در این قسمت قرار خواهد گرفت."
  );
}

function buildGalleryImages(
  item: PortfolioItem,
  detail: PortfolioDetail | null,
): PreviewImage[] {
  const result: PreviewImage[] = [];
  const registeredUrls = new Set<string>();

  const title = detail?.title || item.title;

  function registerImage(
    id: string,
    imageUrl?: string | null,
    altText?: string | null,
  ) {
    if (!imageUrl || registeredUrls.has(imageUrl)) {
      return;
    }

    registeredUrls.add(imageUrl);

    result.push({
      id,
      imageUrl,
      altText: altText || title,
    });
  }

  registerImage(
    "cover",
    detail?.cover_image_url || item.cover_image_url,
    title,
  );

  for (const image of detail?.images ?? []) {
    registerImage(
      String(image.id),
      image.image_url,
      image.alt_text || title,
    );
  }

  return result;
}

export default function PortfolioPreviewModal({
  item,
  onClose,
  onPreview,
}: PortfolioPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const previousFocusedElementRef = useRef<HTMLElement | null>(
    null,
  );

  const touchStartXRef = useRef<number | null>(null);
  const touchCurrentXRef = useRef<number | null>(null);

  const copyTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [detail, setDetail] =
    useState<PortfolioDetail | null>(null);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [loadedImageUrl, setLoadedImageUrl] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [imageFit, setImageFit] =
    useState<ImageFit>("contain");

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [copyStatus, setCopyStatus] =
    useState<CopyStatus>("idle");

  const galleryImages = useMemo(() => {
    if (!item) {
      return [];
    }

    return buildGalleryImages(item, detail);
  }, [item, detail]);

  const resolvedActiveImageIndex =
    activeImageIndex < galleryImages.length ? activeImageIndex : 0;

  const activeImage =
    galleryImages[resolvedActiveImageIndex] ||
    galleryImages[0] ||
    null;
  const isImageLoading = Boolean(
    activeImage && loadedImageUrl !== activeImage.imageUrl,
  );

  const current = detail || item;

  const completedDate = formatPortfolioDate(
    current?.completed_at,
  );

  const description = item
    ? getPortfolioDescription(item, detail)
    : "";

  const relatedItems = detail?.related_items ?? [];

  const resetImageView = useCallback(() => {
    setZoom(1);
    setImageFit("contain");
  }, []);

  const selectImage = useCallback(
    (index: number) => {
      if (
        index < 0 ||
        index >= galleryImages.length ||
        index === resolvedActiveImageIndex
      ) {
        return;
      }

      setActiveImageIndex(index);
      resetImageView();
    },
    [
      resolvedActiveImageIndex,
      galleryImages.length,
      resetImageView,
    ],
  );

  const showPreviousImage = useCallback(() => {
    if (galleryImages.length <= 1) {
      return;
    }

    const previousIndex =
      resolvedActiveImageIndex === 0
        ? galleryImages.length - 1
        : resolvedActiveImageIndex - 1;

    selectImage(previousIndex);
  }, [
    resolvedActiveImageIndex,
    galleryImages.length,
    selectImage,
  ]);

  const showNextImage = useCallback(() => {
    if (galleryImages.length <= 1) {
      return;
    }

    const nextIndex =
      resolvedActiveImageIndex === galleryImages.length - 1
        ? 0
        : resolvedActiveImageIndex + 1;

    selectImage(nextIndex);
  }, [
    resolvedActiveImageIndex,
    galleryImages.length,
    selectImage,
  ]);

  const increaseZoom = useCallback(() => {
    setZoom((currentZoom) =>
      Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP),
    );
  }, []);

  const decreaseZoom = useCallback(() => {
    setZoom((currentZoom) =>
      Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP),
    );
  }, []);

  const handleClose = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen().finally(() => {
        onClose();
      });

      return;
    }

    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!item) {
      return;
    }

    const selectedItem = item;
    let isMounted = true;

    async function loadDetail() {
      setIsLoading(true);
      setError("");
      setDetail(null);
      setActiveImageIndex(0);
      resetImageView();

      try {
        const data = await getPortfolioItem(selectedItem.slug);

        if (!isMounted) {
          return;
        }

        setDetail(data);

      } catch {
        if (!isMounted) {
          return;
        }

        setError(
          "دریافت اطلاعات کامل نمونه‌کار با مشکل مواجه شد. اطلاعات اولیه همچنان در دسترس است.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDetail();

    return () => {
      isMounted = false;
    };
  }, [item, resetImageView, retryKey]);

  useEffect(() => {
    if (!item) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement as HTMLElement | null;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 60);

    return () => {
      window.clearTimeout(focusTimer);

      document.body.style.overflow = previousOverflow;

      previousFocusedElementRef.current?.focus?.();
    };
  }, [item]);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(
        Boolean(document.fullscreenElement),
      );
    }

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange,
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!item) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target =
        event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;

      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
        return;
      }

      if (isTyping) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showNextImage();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        showPreviousImage();
      }

      if (
        event.key === "+" ||
        event.key === "="
      ) {
        event.preventDefault();
        increaseZoom();
      }

      if (event.key === "-") {
        event.preventDefault();
        decreaseZoom();
      }

      if (event.key === "0") {
        event.preventDefault();
        resetImageView();
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;

        if (!dialog) {
          return;
        }

        const focusableElements = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            [
              "a[href]",
              "button:not([disabled])",
              "input:not([disabled])",
              "select:not([disabled])",
              "textarea:not([disabled])",
              '[tabindex]:not([tabindex="-1"])',
            ].join(","),
          ),
        ).filter(
          (element) =>
            element.offsetParent !== null &&
            !element.hasAttribute("aria-hidden"),
        );

        if (focusableElements.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const firstElement = focusableElements[0];

        const lastElement =
          focusableElements[
            focusableElements.length - 1
          ];

        if (
          event.shiftKey &&
          document.activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    item,
    decreaseZoom,
    handleClose,
    increaseZoom,
    resetImageView,
    showNextImage,
    showPreviousImage,
  ]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  function handleTouchStart(
    event: ReactTouchEvent<HTMLDivElement>,
  ) {
    if (zoom > 1) {
      return;
    }

    const firstTouch = event.touches[0];

    if (!firstTouch) {
      return;
    }

    touchStartXRef.current = firstTouch.clientX;
    touchCurrentXRef.current = firstTouch.clientX;
  }

  function handleTouchMove(
    event: ReactTouchEvent<HTMLDivElement>,
  ) {
    if (zoom > 1) {
      return;
    }

    const firstTouch = event.touches[0];

    if (!firstTouch) {
      return;
    }

    touchCurrentXRef.current = firstTouch.clientX;
  }

  function handleTouchEnd() {
    if (zoom > 1) {
      return;
    }

    const startX = touchStartXRef.current;
    const endX = touchCurrentXRef.current;

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;

    if (startX === null || endX === null) {
      return;
    }

    const difference = startX - endX;

    if (Math.abs(difference) < 55) {
      return;
    }

    if (difference > 0) {
      showNextImage();
      return;
    }

    showPreviousImage();
  }

  function handleImageWheel(
    event: ReactWheelEvent<HTMLDivElement>,
  ) {
    if (!activeImage || !event.ctrlKey) {
      return;
    }

    event.preventDefault();

    if (event.deltaY < 0) {
      increaseZoom();
      return;
    }

    decreaseZoom();
  }

  function handleImageDoubleClick() {
    if (!activeImage) {
      return;
    }

    if (zoom > 1) {
      resetImageView();
      return;
    }

    setZoom(2);
  }

  async function handleToggleFullscreen() {
    const modal = modalRef.current;

    if (!modal) {
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await modal.requestFullscreen();
      }
    } catch {
      setIsFullscreen(false);
    }
  }

  async function handleShare() {
    if (!item) {
      return;
    }

    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/portfolio#${item.slug}`
        : "";

    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text:
            item.short_description ||
            "مشاهده این نمونه‌کار در چاپی چاپ",
          url: shareUrl,
        });

        return;
      }

      if (!navigator.clipboard) {
        throw new Error("Clipboard is unavailable");
      }

      await navigator.clipboard.writeText(shareUrl);

      setCopyStatus("copied");
    } catch {
      try {
        if (!navigator.clipboard) {
          throw new Error("Clipboard is unavailable");
        }

        await navigator.clipboard.writeText(shareUrl);

        setCopyStatus("copied");
      } catch {
        setCopyStatus("failed");
      }
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyStatus("idle");
    }, 2200);
  }

  function handleDialogKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) {
    if (
      event.key === "Enter" &&
      event.target === dialogRef.current
    ) {
      dialogRef.current.focus();
    }
  }

  if (!item || !current) {
    return null;
  }

  const orderHref = `/design-request?portfolio=${encodeURIComponent(
    item.slug,
  )}`;

  return (
    <div
      ref={modalRef}
      className="portfolio-preview-overlay fixed inset-0 z-[120] overflow-y-auto bg-[#171411]/80 px-3 py-4 backdrop-blur-md sm:px-6 sm:py-7"
      role="presentation"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        onClick={handleClose}
        aria-label="بستن پیش‌نمایش نمونه‌کار"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-preview-title"
        aria-describedby="portfolio-preview-description"
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className={[
          "portfolio-preview-dialog relative mx-auto flex min-h-[min(94dvh,1040px)] w-full max-w-[1680px] flex-col overflow-hidden border border-[#ded4c6] bg-white shadow-[0_50px_150px_-35px_rgba(0,0,0,0.85)] outline-none",
          isFullscreen
            ? "h-screen max-h-none max-w-none rounded-none"
            : "rounded-[30px] sm:rounded-[38px]",
        ].join(" ")}
      >
        {/* Header */}
        <header className="relative flex flex-wrap items-center justify-between gap-5 border-b border-[#e8e1d7] bg-[#fffdf9] px-5 py-5 sm:px-7 lg:px-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(210,173,112,0.14),transparent_40%)]" />

          <div className="relative flex min-w-0 items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] border border-[#dfc79f] bg-[#f8efe0] text-[#9c6827]">
              <GalleryIcon className="h-8 w-8" />
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[21px] font-black text-[#a46f2d]">
                  {current.work_type_label}
                </span>

                {current.is_featured && (
                  <span className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#dec18d] bg-[#faf2e3] px-4 text-[20px] font-black text-[#946322]">
                    <StarIcon className="h-6 w-6" />
                    نمونه‌کار منتخب
                  </span>
                )}
              </div>

              <h2
                id="portfolio-preview-title"
                className="mt-2 line-clamp-2 text-[32px] font-black leading-[1.55] text-[#302b27] sm:text-[38px] lg:text-[44px]"
              >
                {current.title}
              </h2>
            </div>
          </div>

          <div className="relative flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex min-h-[60px] items-center justify-center gap-3 rounded-[17px] border border-[#e2dad0] bg-white px-5 text-[20px] font-black text-[#5e5750] transition duration-300 hover:border-[#c99d58] hover:bg-[#f8f1e7] hover:text-[#80551f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d58]/50"
              aria-label="اشتراک‌گذاری نمونه‌کار"
            >
              {copyStatus === "copied" ? (
                <CheckIcon className="h-7 w-7 text-emerald-600" />
              ) : (
                <ShareIcon className="h-7 w-7" />
              )}

              <span className="hidden sm:inline">
                {copyStatus === "copied"
                  ? "لینک کپی شد"
                  : copyStatus === "failed"
                    ? "کپی انجام نشد"
                    : "اشتراک‌گذاری"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="flex h-[60px] w-[60px] items-center justify-center rounded-[17px] border border-[#e2dad0] bg-white text-[#5e5750] transition duration-300 hover:border-[#c99d58] hover:bg-[#f8f1e7] hover:text-[#80551f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d58]/50"
              aria-label={
                isFullscreen
                  ? "خروج از تمام‌صفحه"
                  : "نمایش تمام‌صفحه"
              }
            >
              {isFullscreen ? (
                <MinimizeIcon className="h-8 w-8" />
              ) : (
                <MaximizeIcon className="h-8 w-8" />
              )}
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-[60px] w-[60px] items-center justify-center rounded-[17px] border border-[#e2dad0] bg-white text-[#625a53] transition duration-300 hover:rotate-90 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/60"
              aria-label="بستن"
            >
              <CloseIcon className="h-8 w-8" />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(480px,0.85fr)]">
          {/* Gallery */}
          <section className="flex min-h-0 flex-col border-b border-[#e8e1d7] bg-[#f3eee6] lg:border-b-0 lg:border-l">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e3d9cb] px-5 py-4 sm:px-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex min-h-[54px] items-center gap-3 rounded-full border border-[#dfd4c5] bg-white px-5 text-[20px] font-black text-[#6d645b]">
                  <ImageIcon className="h-7 w-7 text-[#a16e2c]" />

                  {galleryImages.length > 0
                    ? `تصویر ${(
                        resolvedActiveImageIndex + 1
                      ).toLocaleString(
                        "fa-IR",
                      )} از ${galleryImages.length.toLocaleString(
                        "fa-IR",
                      )}`
                    : "بدون تصویر"}
                </span>

                {zoom > 1 && (
                  <span className="inline-flex min-h-[54px] items-center rounded-full border border-[#ddc79f] bg-[#faf3e8] px-5 text-[20px] font-black text-[#8c5e26]">
                    زوم{" "}
                    {Math.round(
                      zoom * 100,
                    ).toLocaleString("fa-IR")}
                    ٪
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 rounded-[18px] border border-[#ded5ca] bg-white p-2">
                <button
                  type="button"
                  onClick={decreaseZoom}
                  disabled={
                    zoom <= MIN_ZOOM || !activeImage
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-[13px] text-[#625a52] transition hover:bg-[#f4eee5] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="کوچک‌نمایی تصویر"
                >
                  <MinusIcon className="h-7 w-7" />
                </button>

                <button
                  type="button"
                  onClick={resetImageView}
                  disabled={!activeImage}
                  className="flex h-12 min-w-[86px] items-center justify-center rounded-[13px] px-3 text-[20px] font-black text-[#6b6259] transition hover:bg-[#f4eee5] disabled:opacity-35"
                  aria-label="بازنشانی بزرگ‌نمایی"
                >
                  ۱۰۰٪
                </button>

                <button
                  type="button"
                  onClick={increaseZoom}
                  disabled={
                    zoom >= MAX_ZOOM || !activeImage
                  }
                  className="flex h-12 w-12 items-center justify-center rounded-[13px] text-[#625a52] transition hover:bg-[#f4eee5] disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="بزرگ‌نمایی تصویر"
                >
                  <PlusIcon className="h-7 w-7" />
                </button>

                <span className="mx-1 h-8 w-px bg-[#e5ddd2]" />

                <button
                  type="button"
                  onClick={() =>
                    setImageFit((currentFit) =>
                      currentFit === "contain"
                        ? "cover"
                        : "contain",
                    )
                  }
                  disabled={!activeImage}
                  className="flex h-12 w-12 items-center justify-center rounded-[13px] text-[#625a52] transition hover:bg-[#f4eee5] disabled:opacity-35"
                  aria-label={
                    imageFit === "contain"
                      ? "پرکردن قاب با تصویر"
                      : "نمایش کامل تصویر"
                  }
                >
                  {imageFit === "contain" ? (
                    <CropIcon className="h-7 w-7" />
                  ) : (
                    <FitIcon className="h-7 w-7" />
                  )}
                </button>
              </div>
            </div>

            <div
              className="relative flex min-h-[500px] flex-1 touch-pan-y items-center justify-center overflow-hidden p-4 sm:min-h-[650px] sm:p-7"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onWheel={handleImageWheel}
              onDoubleClick={handleImageDoubleClick}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.95),rgba(239,232,222,0.68)_65%,rgba(224,209,187,0.34))]" />

              {isImageLoading && activeImage && (
                <div className="absolute inset-4 z-10 overflow-hidden rounded-[26px] bg-[#e8e0d5] sm:inset-7">
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-[#e5ddd2] via-[#f5f1eb] to-[#e5ddd2]" />
                </div>
              )}

              {activeImage ? (
                <div className="relative flex h-full min-h-[460px] w-full items-center justify-center overflow-auto rounded-[26px] border border-white/80 bg-white/50 shadow-[0_25px_70px_-44px_rgba(49,41,33,0.52)] sm:min-h-[600px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={activeImage.id}
                    src={activeImage.imageUrl}
                    alt={activeImage.altText}
                    onLoad={() =>
                      setLoadedImageUrl(activeImage.imageUrl)
                    }
                    onError={() =>
                      setLoadedImageUrl(activeImage.imageUrl)
                    }
                    draggable={false}
                    className={[
                      "h-full w-full select-none transition-transform duration-300 ease-out",
                      imageFit === "contain"
                        ? "object-contain"
                        : "object-cover",
                    ].join(" ")}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: "center",
                    }}
                  />
                </div>
              ) : (
                <div className="relative flex min-h-[460px] w-full items-center justify-center rounded-[26px] border border-dashed border-[#d7bd8f] bg-white/60 sm:min-h-[600px]">
                  <div className="px-6 text-center">
                    <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#ddc49a] bg-white text-[#9f6c2c] shadow-[0_18px_38px_-27px_rgba(68,47,24,0.45)]">
                      <ImageIcon className="h-14 w-14" />
                    </span>

                    <p className="mt-6 text-[26px] font-black leading-10 text-[#4d4640]">
                      تصویری برای این نمونه‌کار ثبت نشده است
                    </p>

                    <p className="mt-3 text-[21px] font-bold leading-10 text-[#8b8177]">
                      پس از بارگذاری تصویر، در این قسمت نمایش داده می‌شود.
                    </p>
                  </div>
                </div>
              )}

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPreviousImage}
                    className="absolute right-5 top-1/2 z-20 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-[20px] border border-white/75 bg-white/92 text-[#4e4842] shadow-[0_16px_38px_-22px_rgba(0,0,0,0.48)] backdrop-blur transition duration-300 hover:border-[#caa05d] hover:bg-[#302b27] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#caa05d]/60"
                    aria-label="تصویر قبلی"
                  >
                    <ChevronRightIcon className="h-9 w-9" />
                  </button>

                  <button
                    type="button"
                    onClick={showNextImage}
                    className="absolute left-5 top-1/2 z-20 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-[20px] border border-white/75 bg-white/92 text-[#4e4842] shadow-[0_16px_38px_-22px_rgba(0,0,0,0.48)] backdrop-blur transition duration-300 hover:border-[#caa05d] hover:bg-[#302b27] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#caa05d]/60"
                    aria-label="تصویر بعدی"
                  >
                    <ChevronLeftIcon className="h-9 w-9" />
                  </button>
                </>
              )}
            </div>

            {galleryImages.length > 0 && (
              <div className="border-t border-[#ded4c5] bg-[#eee7dd] px-5 py-5 sm:px-7">
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {galleryImages.map(
                    (image, index) => {
                      const isActive =
                        index === resolvedActiveImageIndex;

                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() =>
                            selectImage(index)
                          }
                          className={[
                            "relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-[19px] border bg-white outline-none transition duration-300 sm:h-[116px] sm:w-[116px]",
                            isActive
                              ? "-translate-y-1 border-[#c99b53] shadow-[0_18px_34px_-20px_rgba(103,69,26,0.58)] ring-4 ring-[#d2ad70]/20"
                              : "border-white/80 opacity-70 hover:border-[#c99b53]/70 hover:opacity-100",
                          ].join(" ")}
                          aria-label={`نمایش تصویر ${(
                            index + 1
                          ).toLocaleString(
                            "fa-IR",
                          )}`}
                          aria-current={
                            isActive
                              ? "true"
                              : undefined
                          }
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.imageUrl}
                            alt={image.altText}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute right-2 top-2 flex h-9 min-w-9 items-center justify-center rounded-full bg-[#2e2925]/82 px-2 text-[20px] font-black text-white">
                            {(index + 1).toLocaleString(
                              "fa-IR",
                            )}
                          </span>
                        </button>
                      );
                    },
                  )}

                  {activeImage && (
                    <a
                      href={activeImage.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      download={`${item.slug}-${resolvedActiveImageIndex + 1}`}
                      className="mr-auto inline-flex min-h-[60px] shrink-0 items-center gap-3 rounded-[17px] border border-[#d5cabd] bg-white px-5 text-[20px] font-black text-[#5f574f] transition duration-300 hover:border-[#c99b53] hover:bg-[#f8f1e6] hover:text-[#7e531e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99b53]/55"
                    >
                      <DownloadIcon className="h-7 w-7" />
                      دریافت تصویر
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Details */}
          <aside className="min-h-0 overflow-y-auto bg-white px-6 py-7 sm:px-8 lg:px-10 lg:py-10">
            {isLoading ? (
              <PreviewDetailsSkeleton />
            ) : (
              <>
                {error && (
                  <div className="mb-7 rounded-[22px] border border-amber-200 bg-amber-50 p-6">
                    <div className="flex items-start gap-4">
                      <AlertIcon className="mt-1 h-8 w-8 shrink-0 text-amber-700" />

                      <div>
                        <p className="text-[24px] font-black leading-10 text-amber-900">
                          جزئیات کامل دریافت نشد
                        </p>

                        <p className="mt-2 text-[21px] font-bold leading-10 text-amber-800">
                          {error}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setRetryKey(
                              (currentKey) =>
                                currentKey + 1,
                            )
                          }
                          className="mt-4 inline-flex min-h-[58px] items-center gap-3 rounded-[16px] border border-amber-300 bg-white px-5 text-[20px] font-black text-amber-800 transition hover:bg-amber-100"
                        >
                          <RefreshIcon className="h-7 w-7" />
                          تلاش مجدد
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex min-h-[56px] items-center gap-3 rounded-[17px] border border-[#e3d5bf] bg-[#faf4ea] px-5 text-[20px] font-black text-[#8b5d25]">
                    <WorkIcon className="h-7 w-7" />
                    {current.work_type_label}
                  </span>

                  {completedDate && (
                    <span className="inline-flex min-h-[56px] items-center gap-3 rounded-[17px] border border-[#e7e0d7] bg-[#fbfaf7] px-5 text-[20px] font-black text-[#665f58]">
                      <CalendarIcon className="h-7 w-7 text-[#9f6b2c]" />
                      {completedDate}
                    </span>
                  )}
                </div>

                <div className="mt-8">
                  <p className="text-[21px] font-black text-[#a06c2b]">
                    معرفی و توضیحات پروژه
                  </p>

                  <h3 className="mt-3 text-[34px] font-black leading-[1.65] text-[#2e2a26] sm:text-[38px]">
                    {current.title}
                  </h3>

                  <div
                    className="my-7 flex items-center gap-4"
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-[#ebe4db]" />

                    <span className="h-4 w-4 rotate-45 rounded-[2px] bg-[#c99b53]" />

                    <span className="h-px flex-1 bg-[#ebe4db]" />
                  </div>

                  {/* متن اصلی مانند توضیح پک نوروزی */}
                  <p
                    id="portfolio-preview-description"
                    className="portfolio-main-description whitespace-pre-line text-[24px] font-medium leading-[2.15] text-[#625c56] sm:text-[25px]"
                  >
                    {description}
                  </p>
                </div>

                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  <DetailCard
                    icon={WorkIcon}
                    label="نوع کار"
                    value={current.work_type_label}
                  />

                  <DetailCard
                    icon={UsersIcon}
                    label="نوع سفارش"
                    value={
                      current.client_name ||
                      "سفارش اختصاصی"
                    }
                  />

                  <DetailCard
                    icon={ImageIcon}
                    label="تعداد تصاویر"
                    value={`${galleryImages.length.toLocaleString(
                      "fa-IR",
                    )} تصویر`}
                  />

                  <DetailCard
                    icon={CalendarIcon}
                    label="تاریخ اجرا"
                    value={
                      completedDate || "ثبت نشده"
                    }
                  />
                </div>

                <div className="mt-9 rounded-[26px] border border-[#e4d8c6] bg-[#fbf7f0] p-6">
                  <div className="flex items-start gap-5">
                    <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-[22px] bg-[#d2ad70] text-[#302a24]">
                      <PaletteIcon className="h-9 w-9" />
                    </span>

                    <div>
                      <p className="text-[27px] font-black leading-10 text-[#302b27]">
                        اجرای سفارشی مشابه این پروژه
                      </p>

                      <p className="mt-3 text-[21px] font-medium leading-10 text-[#746c64]">
                        رنگ، نوشته، تصاویر، بسته‌بندی و
                        جزئیات اجرا می‌تواند متناسب با
                        سفارش شما تغییر کند.
                      </p>
                    </div>
                  </div>

                  <Link
                    href={orderHref}
                    className="mt-7 flex min-h-[72px] items-center justify-center gap-3 rounded-[21px] bg-[#d2ad70] px-6 text-[23px] font-black text-[#302a24] shadow-[0_18px_36px_-22px_rgba(137,91,30,0.68)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#302b27] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99b53]/60"
                  >
                    <PaletteIcon className="h-8 w-8" />
                    ثبت سفارش مشابه
                    <ArrowLeftIcon className="h-7 w-7" />
                  </Link>
                </div>

                {relatedItems.length > 0 && (
                  <section className="mt-10 border-t border-[#e9e2d9] pt-8">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[21px] font-black text-[#a16d2d]">
                          پیشنهادهای مرتبط
                        </p>

                        <h3 className="mt-2 text-[30px] font-black leading-10 text-[#302b27]">
                          نمونه‌کارهای مشابه
                        </h3>
                      </div>

                      <span className="rounded-full border border-[#e3d8ca] bg-[#faf7f2] px-4 py-2 text-[20px] font-black text-[#746a61]">
                        {relatedItems.length.toLocaleString(
                          "fa-IR",
                        )}{" "}
                        مورد
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4">
                      {relatedItems.map((related) => (
                        <button
                          key={related.id}
                          type="button"
                          onClick={() => {
                            onPreview?.(related);
                          }}
                          disabled={!onPreview}
                          className="group flex min-h-[108px] items-center gap-4 rounded-[22px] border border-[#e8e1d8] bg-[#fcfbf8] p-5 text-right transition duration-300 enabled:hover:-translate-y-0.5 enabled:hover:border-[#cda461] enabled:hover:bg-[#faf4ea] disabled:cursor-default"
                        >
                          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[19px] border border-[#e2d2b9] bg-white text-[#9c6828]">
                            <GalleryIcon className="h-8 w-8" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="line-clamp-2 block text-[23px] font-black leading-10 text-[#3a3530] group-enabled:group-hover:text-[#7c521f]">
                              {related.title}
                            </span>

                            <span className="mt-1 block text-[20px] font-bold leading-9 text-[#8b8177]">
                              {related.work_type_label}
                            </span>
                          </span>

                          {onPreview && (
                            <ArrowLeftIcon className="h-7 w-7 shrink-0 text-[#9c8f81] transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-[#9c6828]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                <div className="mt-9 rounded-[22px] border border-dashed border-[#ddc49c] bg-[#fdfaf5] p-6">
                  <p className="flex items-center gap-3 text-[24px] font-black text-[#8d632d]">
                    <KeyboardIcon className="h-8 w-8" />
                    راهنمای استفاده
                  </p>

                  <p className="mt-3 text-[20px] font-bold leading-10 text-[#81776d]">
                    با کلیدهای جهت‌دار تصاویر را تغییر
                    بده، با کلیدهای مثبت و منفی تصویر
                    را بزرگ یا کوچک کن و با کلید Escape
                    پنجره را ببند.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .portfolio-preview-overlay {
          animation: portfolio-overlay-enter 260ms ease-out;
        }

        .portfolio-preview-dialog {
          animation: portfolio-dialog-enter 420ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        /*
         * محافظ تایپوگرافی:
         * حتی اگر بعداً یک کلاس text-xs یا text-sm به فایل اضافه شود،
         * متن‌های مودال کوچک‌تر از ۲۰ پیکسل نمایش داده نمی‌شوند.
         */
        .portfolio-preview-dialog p,
        .portfolio-preview-dialog button,
        .portfolio-preview-dialog a,
        .portfolio-preview-dialog label,
        .portfolio-preview-dialog li {
          font-size: max(20px, 1em);
        }

        .portfolio-preview-dialog
          .portfolio-main-description {
          font-size: 25px !important;
          line-height: 2.15 !important;
        }

        .portfolio-preview-dialog
          #portfolio-preview-title {
          font-size: clamp(
            32px,
            2.6vw,
            44px
          ) !important;
        }

        .portfolio-preview-dialog,
        .portfolio-preview-dialog button,
        .portfolio-preview-dialog a,
        .portfolio-preview-dialog p,
        .portfolio-preview-dialog span {
          font-family: inherit;
        }

        .portfolio-preview-dialog ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .portfolio-preview-dialog
          ::-webkit-scrollbar-track {
          background: #f1ece5;
        }

        .portfolio-preview-dialog
          ::-webkit-scrollbar-thumb {
          border: 2px solid #f1ece5;
          border-radius: 999px;
          background: #c8a36a;
        }

        @keyframes portfolio-overlay-enter {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes portfolio-dialog-enter {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (max-width: 640px) {
          .portfolio-preview-dialog
            .portfolio-main-description {
            font-size: 23px !important;
            line-height: 2.05 !important;
          }

          .portfolio-preview-dialog
            #portfolio-preview-title {
            font-size: 32px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .portfolio-preview-overlay,
          .portfolio-preview-dialog,
          .portfolio-preview-dialog *,
          .portfolio-preview-dialog *::before,
          .portfolio-preview-dialog *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#e9e2d9] bg-[#fcfbf8] p-5">
      <div className="flex items-start gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[19px] bg-[#f5ecde] text-[#9c6828]">
          <Icon className="h-8 w-8" />
        </span>

        <div className="min-w-0">
          <p className="text-[20px] font-bold leading-9 text-[#8c8278]">
            {label}
          </p>

          <p className="mt-2 line-clamp-2 text-[23px] font-black leading-10 text-[#38332e]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewDetailsSkeleton() {
  return (
    <div className="space-y-7">
      <div className="flex gap-3">
        <div className="h-14 w-40 animate-pulse rounded-[16px] bg-[#e8e1d7]" />
        <div className="h-14 w-48 animate-pulse rounded-[16px] bg-[#e8e1d7]" />
      </div>

      <div className="h-14 w-4/5 animate-pulse rounded-xl bg-[#e8e1d7]" />

      <div className="space-y-4">
        <div className="h-7 animate-pulse rounded bg-[#eee8df]" />
        <div className="h-7 animate-pulse rounded bg-[#eee8df]" />
        <div className="h-7 w-3/4 animate-pulse rounded bg-[#eee8df]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-[22px] bg-[#eee8df]"
            />
          ),
        )}
      </div>

      <div className="h-56 animate-pulse rounded-[26px] bg-[#eee8df]" />
    </div>
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
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />
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
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
      />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-4-4L5 21" />
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
      <path d="M4 6h16v13H4z" />
      <path d="M8 6V3h8v3M4 11h16" />
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
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M7 3v4M17 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

function PaletteIcon(props: IconProps) {
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
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle
        cx="7.5"
        cy="10"
        r=".7"
        fill="currentColor"
        stroke="none"
      />
      <circle
        cx="10"
        cy="6.8"
        r=".7"
        fill="currentColor"
        stroke="none"
      />
      <circle
        cx="14"
        cy="6.5"
        r=".7"
        fill="currentColor"
        stroke="none"
      />
      <circle
        cx="17"
        cy="9"
        r=".7"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function StarIcon(props: IconProps) {
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
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function ShareIcon(props: IconProps) {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
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

function DownloadIcon(props: IconProps) {
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
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
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

function PlusIcon(props: IconProps) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinusIcon(props: IconProps) {
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
      <path d="M5 12h14" />
    </svg>
  );
}

function FitIcon(props: IconProps) {
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

function CropIcon(props: IconProps) {
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
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M2 6h14a2 2 0 0 1 2 2v14" />
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

function AlertIcon(props: IconProps) {
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
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
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
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18.5 9A7 7 0 0 0 6.7 6.7L4 9M5.5 15A7 7 0 0 0 17.3 17.3L20 15" />
    </svg>
  );
}

function KeyboardIcon(props: IconProps) {
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
      <rect
        x="2"
        y="5"
        width="20"
        height="14"
        rx="2"
      />
      <path d="M6 9h.01M10 9h.01M14 9h.01M18 9h.01M6 13h.01M10 13h.01M14 13h.01M18 13h.01M7 16h10" />
    </svg>
  );
}
