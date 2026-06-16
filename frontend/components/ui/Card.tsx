import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
};

export default function Card({
  className,
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-gray-200 bg-white shadow-sm",
        hover && "transition hover:-translate-y-1 hover:border-[var(--primary)] hover:shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}