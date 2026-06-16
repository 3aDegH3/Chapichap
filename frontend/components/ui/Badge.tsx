import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "secondary" | "accent" | "dark" | "soft";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  primary: "bg-[var(--primary)] text-white",
  secondary: "bg-[var(--secondary)] text-white",
  accent: "bg-[var(--accent)] text-[var(--dark)]",
  dark: "bg-[var(--dark)] text-white",
  soft: "bg-pink-50 text-[var(--primary)]",
};

export default function Badge({
  variant = "soft",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-black",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}