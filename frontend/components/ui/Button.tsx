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
    "bg-[var(--primary)] text-white shadow-lg shadow-pink-900/20 hover:opacity-90",
  secondary:
    "bg-[var(--secondary)] text-white shadow-lg shadow-sky-900/20 hover:opacity-90",
  accent:
    "bg-[var(--accent)] text-[var(--dark)] shadow-lg shadow-yellow-900/10 hover:opacity-90",
  dark:
    "bg-[var(--dark)] text-white shadow-lg shadow-black/20 hover:opacity-90",
  outline:
    "border border-gray-200 bg-white text-[var(--dark)] hover:border-[var(--primary)] hover:bg-pink-50 hover:text-[var(--primary)]",
  ghost:
    "bg-transparent text-[var(--dark)] hover:bg-gray-100",
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
        "inline-flex items-center justify-center rounded-2xl font-black transition duration-200 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
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