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
        "rounded-2xl border border-[#E3DED5] bg-white shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]",
        hover && "transition hover:-translate-y-1 hover:border-[#D2AD70] hover:shadow-[0_22px_55px_-36px_rgba(51,50,48,0.75)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
