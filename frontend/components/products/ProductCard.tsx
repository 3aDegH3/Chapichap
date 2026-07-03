"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type SVGProps,
} from "react";

import { useCart } from "@/contexts/CartContext";
import {
  getProductStockLimit,
  isProductAvailable,
  type Product,
} from "@/lib/products-api";

type IconProps = SVGProps<SVGSVGElement>;

function formatPrice(price?: string | null) {
  const numericPrice = Number(price ?? 0);

  if (!Number.isFinite(numericPrice)) {
    return "۰";
  }

  return new Intl.NumberFormat("fa-IR").format(numericPrice);
}

function getDiscountPercentage(product: Product) {
  if (!product.has_active_discount) {
    return 0;
  }

  const originalPrice = Number(product.price);
  const finalPrice = Number(
    product.effective_price || product.price,
  );

  if (
    !Number.isFinite(originalPrice) ||
    !Number.isFinite(finalPrice) ||
    originalPrice <= 0 ||
    finalPrice >= originalPrice
  ) {
    return 0;
  }

  return Math.round(
    ((originalPrice - finalPrice) / originalPrice) * 100,
  );
}

function getProductDescription(product: Product) {
  return (
    product.short_description ||
    product.description ||
    "محصولی اختصاصی برای هدیه، مناسبت‌های خاص و سفارش‌های شخصی‌سازی‌شده."
  );
}

export default function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addItem } = useCart();

  const feedbackTimeoutRef = useRef<
    ReturnType<typeof setTimeout> | null
  >(null);

  const [isAdded, setIsAdded] = useState(false);

  const isAvailable = isProductAvailable(product);
  const stockLimit = getProductStockLimit(product);

  const effectivePrice =
    product.effective_price || product.price;

  const discountPercentage =
    getDiscountPercentage(product);

  const productDescription =
    getProductDescription(product);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = () => {
    if (!isAvailable) return;

    addItem(product);
    setIsAdded(true);

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setIsAdded(false);
    }, 1600);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-[#e4ddd3] bg-[#f5f0e8] shadow-[0_22px_55px_-38px_rgba(56,47,37,0.32)] transition-[border-color,box-shadow] duration-300 hover:border-[#cfa766] hover:shadow-[0_28px_65px_-38px_rgba(75,56,31,0.36)]">
      {/* تصویر محصول */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#bd8b43]/60"
        aria-label={`مشاهده محصول ${product.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eee8de]">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#f4eee4,#ebe3d7)]">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#d4b782] bg-white text-[#a27331] shadow-[0_18px_40px_-28px_rgba(92,61,22,0.42)]">
                <PrintIcon className="h-12 w-12" />
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/[0.05] via-transparent to-black/[0.18]" />

          {/* دسته‌بندی */}
          {product.category && (
            <span className="absolute right-4 top-4 inline-flex min-h-[52px] items-center gap-2 rounded-[14px] border border-white/75 bg-white/92 px-4 text-[20px] font-black text-[#6f4c20] shadow-[0_10px_25px_-18px_rgba(0,0,0,0.65)] backdrop-blur-md">
              <CategoryIcon className="h-5 w-5 text-[#a97835]" />
              {product.category.title}
            </span>
          )}

          {/* تخفیف */}
          {discountPercentage > 0 && (
            <span className="absolute left-4 top-4 inline-flex min-h-[52px] items-center rounded-[14px] bg-[#9d4538] px-4 text-[20px] font-black text-white shadow-[0_10px_25px_-18px_rgba(112,35,24,0.7)]">
              {discountPercentage.toLocaleString("fa-IR")}٪ تخفیف
            </span>
          )}

          {/* موجودی */}
          <span
            className={[
              "absolute bottom-11 right-4 inline-flex min-h-[52px] items-center gap-2.5 rounded-[14px] border bg-white/92 px-4 text-[20px] font-black shadow-[0_10px_25px_-18px_rgba(0,0,0,0.65)] backdrop-blur-md",
              isAvailable
                ? "border-emerald-200 text-emerald-700"
                : "border-red-200 text-red-600",
            ].join(" ")}
          >
            <span
              className={[
                "h-3 w-3 rounded-full",
                isAvailable
                  ? "bg-emerald-500"
                  : "bg-red-500",
              ].join(" ")}
            />

            {isAvailable
              ? stockLimit === null
                ? "موجود"
                : `${stockLimit.toLocaleString("fa-IR")} عدد`
              : "ناموجود"}
          </span>
        </div>
      </Link>

      {/* پنل سفید اصلی */}
      <div className="relative -mt-7 flex flex-1 flex-col rounded-t-[32px] bg-white px-5 pb-5 pt-7 shadow-[0_-8px_25px_-22px_rgba(45,38,30,0.28)] sm:px-6 sm:pb-6">
        {/* برچسب‌ها */}
        {(product.product_type_label ||
          product.gift_usage_label) && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {product.product_type_label && (
              <span className="inline-flex min-h-[52px] items-center gap-2 rounded-[13px] border border-[#e5d8c3] bg-[#faf5ed] px-4 text-[20px] font-black text-[#6f4d24]">
                <BoxIcon className="h-5 w-5 text-[#a87835]" />
                {product.product_type_label}
              </span>
            )}

            {product.gift_usage_label && (
              <span className="inline-flex min-h-[52px] items-center gap-2 rounded-[13px] border border-[#e7e0d7] bg-white px-4 text-[20px] font-bold text-[#5f5851]">
                <GiftIcon className="h-5 w-5 text-[#ac7a36]" />
                {product.gift_usage_label}
              </span>
            )}
          </div>
        )}

        {/* عنوان */}
        <Link
          href={`/products/${product.slug}`}
          className="mt-5 rounded-lg text-center outline-none focus-visible:ring-2 focus-visible:ring-[#bc8a43]/50"
        >
          <h2 className="line-clamp-2 text-[25px] font-black leading-[1.6] text-[#2d2925] transition-colors duration-300 group-hover:text-[#83571f] sm:text-[27px]">
            {product.title}
          </h2>
        </Link>

        {/* جداکننده تزئینی */}
        <div
          className="my-4 flex items-center justify-center gap-2.5"
          aria-hidden="true"
        >
          <span className="h-px w-12 bg-gradient-to-l from-[#cba35f] to-transparent" />

          <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#cba35f]" />

          <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-[#dfc18e]" />

          <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-[#cba35f]" />

          <span className="h-px w-12 bg-gradient-to-r from-[#cba35f] to-transparent" />
        </div>

        {/* توضیحات */}
        <p className="mx-auto line-clamp-2 min-h-[64px] max-w-[92%] text-center text-[20px] font-medium leading-[1.9] text-[#7b746d]">
          {productDescription}
        </p>

        <div className="my-5 h-px bg-[#ebe5dd]" />

        {/* قیمت و آماده‌سازی */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(120px,0.8fr)] items-stretch gap-4">
          {/* قیمت */}
          <div className="flex min-w-0 flex-col justify-center border-l border-dashed border-[#e5ddd3] pl-4">
            <p className="flex items-center gap-2 text-[20px] font-bold text-[#91877d]">
              <WalletIcon className="h-5 w-5 text-[#a77532]" />
              قیمت محصول
            </p>

            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <strong className="text-[27px] font-black tracking-tight text-[#2c2824] sm:text-[30px]">
                {formatPrice(effectivePrice)}
              </strong>

              <span className="text-[20px] font-black text-[#766e66]">
                تومان
              </span>
            </div>

            {product.has_active_discount && (
              <p className="mt-1 text-[20px] font-bold text-[#aaa199] line-through decoration-[#a74739]/60 decoration-2">
                {formatPrice(product.price)} تومان
              </p>
            )}
          </div>

          {/* آماده‌سازی */}
          <div className="flex min-h-[108px] items-center gap-3 rounded-[18px] border border-[#e7dfd5] bg-[#fbf9f5] px-4 py-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[#eadfce] bg-white text-[#9a682b] shadow-[0_8px_18px_-15px_rgba(64,46,24,0.5)]">
              <ClockIcon className="h-6 w-6" />
            </span>

            <div className="min-w-0">
              <span className="block text-[20px] font-bold text-[#91877d]">
                آماده‌سازی
              </span>

              <span className="mt-1 block text-[20px] font-black leading-8 text-[#38332f]">
                {product.preparation_time || "طبق هماهنگی"}
              </span>
            </div>
          </div>
        </div>

        {/* اکشن اصلی */}
        <div className="mt-5 flex items-stretch gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={[
              "flex min-h-[64px] flex-1 items-center justify-center gap-3 rounded-[18px] border px-5 text-[20px] font-black outline-none transition-[background-color,border-color,color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-[#bd8b43]/60",
              isAvailable
                ? isAdded
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-[#cda45f] bg-[#d7ad66] text-[#33291e] shadow-[0_14px_28px_-20px_rgba(133,87,28,0.58)] hover:border-[#2e2a26] hover:bg-[#2e2a26] hover:text-white"
                : "cursor-not-allowed border-[#e2ddd6] bg-[#ebe7e1] text-[#99928a]",
            ].join(" ")}
          >
            {isAvailable ? (
              isAdded ? (
                <>
                  <CheckCircleIcon className="h-6 w-6" />
                  به سبد اضافه شد
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="h-6 w-6" />
                  افزودن به سبد
                </>
              )
            ) : (
              <>
                <UnavailableIcon className="h-6 w-6" />
                محصول ناموجود
              </>
            )}
          </button>

          <Link
            href={`/products/${product.slug}`}
            className="flex w-[64px] shrink-0 items-center justify-center rounded-[18px] border border-[#ddd5cb] bg-white text-[#4e4740] outline-none transition-[background-color,border-color,color] duration-300 hover:border-[#2e2a26] hover:bg-[#2e2a26] hover:text-white focus-visible:ring-2 focus-visible:ring-[#bd8b43]/55"
            aria-label={`مشاهده جزئیات ${product.title}`}
          >
            <ArrowLeftIcon className="h-7 w-7" />
          </Link>
        </div>

        {/* طراحی اختصاصی */}
        <div className="mt-5 border-t border-[#ebe5dd] pt-4">
          <Link
            href={`/design-request?product=${product.slug}`}
            className="flex min-h-[56px] items-center justify-center gap-2.5 rounded-[13px] text-[20px] font-black text-[#a16d2d] transition-colors duration-300 hover:bg-[#faf5ec] hover:text-[#6f4b21]"
          >
            <PaletteIcon className="h-6 w-6" />
            سفارش طراحی اختصاصی برای این محصول
          </Link>
        </div>

        <span className="sr-only" aria-live="polite">
          {isAdded
            ? `${product.title} به سبد خرید اضافه شد`
            : ""}
        </span>
      </div>
    </article>
  );
}

function CategoryIcon(props: IconProps) {
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
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function BoxIcon(props: IconProps) {
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
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" />
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

function GiftIcon(props: IconProps) {
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
      <path d="M3 9h18v4H3z" />
      <path d="M5 13h14v8H5z" />
      <path d="M12 9v12" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9Z" />
      <path d="M12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </svg>
  );
}

function WalletIcon(props: IconProps) {
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
      <path d="M4 6h14a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" />
      <path d="M16 11h5v4h-5a2 2 0 0 1 0-4Z" />
    </svg>
  );
}

function ClockIcon(props: IconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ShoppingBagIcon(props: IconProps) {
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
      <path d="M6 8h12l1 12H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
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
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9" r=".7" fill="currentColor" stroke="none" />
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

function CheckCircleIcon(props: IconProps) {
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
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16.5 9" />
    </svg>
  );
}

function UnavailableIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m7 7 10 10" />
    </svg>
  );
}