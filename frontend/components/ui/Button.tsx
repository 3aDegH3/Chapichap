import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "accent" | "dark" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--secondary)] text-[var(--dark)] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] hover:bg-[var(--primary)]",
  secondary:
    "bg-[var(--dark)] text-white shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] hover:bg-[#1f1e1d]",
  accent:
    "bg-[var(--accent)] text-[var(--dark)] shadow-[0_12px_26px_-22px_rgba(51,50,48,0.7)] hover:bg-[#f6f1e8]",
  dark:
    "bg-[var(--dark)] text-white shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] hover:bg-[#1f1e1d]",
  outline:
    "border border-[#E3DED5] bg-white text-[var(--dark)] hover:border-[var(--secondary)] hover:bg-[#F6F1E8]",
  ghost:
    "bg-transparent text-[var(--dark)] hover:bg-[#F2EEE6]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-7 text-base",
};

export default function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-black transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "در حال پردازش..." : children}
    </button>
  );
}
