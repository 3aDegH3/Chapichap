import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type IconCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  className?: string;
};

export default function IconCard({
  icon,
  title,
  description,
  href,
  className,
}: IconCardProps) {
  const content = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6F1E8] text-lg font-black text-[#B2894C]">
        {icon}
      </span>
      <h3 className="mt-5 text-base font-black text-[#333230]">{title}</h3>
      <p className="mt-3 text-sm font-medium leading-7 text-[#77736D]">
        {description}
      </p>
    </>
  );

  const classes = cn(
    "block rounded-2xl border border-[#E3DED5] bg-white p-5 transition duration-300 hover:border-[#D2AD70] hover:bg-[#FAFAF8]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
