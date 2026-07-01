import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

type AlertProps = {
  children: ReactNode;
  variant?: AlertVariant;
  className?: string;
};

const variants: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-green-200 bg-green-50 text-green-700",
  info: "border-[#D2AD70]/40 bg-[#F6F1E8] text-[#333230]",
};

export default function Alert({
  children,
  variant = "info",
  className,
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-bold leading-7",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}
