import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSectionProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

export default function PageSection({
  children,
  className,
  innerClassName,
}: PageSectionProps) {
  return (
    <section className={cn("py-14 sm:py-16 lg:py-24", className)}>
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", innerClassName)}>
        {children}
      </div>
    </section>
  );
}
