"use client";

import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export default function RatingStars({
  value,
  onChange,
  readonly = !onChange,
  size = "md",
  label = "امتیاز",
}: RatingStarsProps) {
  const safeValue = Math.max(0, Math.min(5, Number(value) || 0));

  return (
    <div
      className="inline-flex items-center gap-0.5"
      dir="rtl"
      role={readonly ? "img" : "radiogroup"}
      aria-label={`${label}: ${safeValue.toLocaleString("fa-IR")} از ۵`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = safeValue >= star - 0.25;
        if (readonly) {
          return (
            <span
              key={star}
              aria-hidden="true"
              className={cn(sizeClasses[size], active ? "text-[#D2AD70]" : "text-[#DDD6CB]")}
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={safeValue === star}
            aria-label={`${star.toLocaleString("fa-IR")} ستاره`}
            onClick={() => onChange?.(star)}
            className={cn(
              "rounded px-0.5 leading-none transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D2AD70]/45",
              sizeClasses[size],
              active ? "text-[#D2AD70]" : "text-[#DDD6CB]"
            )}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
