import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "primary" | "secondary" | "accent" | "dark" | "soft";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variants: Record<BadgeVariant, string> = {
  primary: "bg-[var(--secondary)] text-[var(--dark)]",
  secondary: "bg-[var(--dark)] text-white",
  accent: "bg-[var(--accent)] text-[var(--dark)]",
  dark: "bg-[var(--dark)] text-white",
  soft: "border border-[#E3DED5] bg-[#F6F1E8] text-[#B2894C]",
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
        "inline-flex rounded-lg px-3 py-1 text-xs font-black",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
