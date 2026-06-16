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
  info: "border-sky-200 bg-sky-50 text-sky-700",
};

export default function Alert({
  children,
  variant = "info",
  className,
}: AlertProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm font-bold leading-7",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}