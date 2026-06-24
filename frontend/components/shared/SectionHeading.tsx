import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "right" | "center";
  className?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "right",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-black text-[#B2894C]">{eyebrow}</p>
      )}
      <h2 className="mt-3 text-2xl font-black leading-snug text-[#333230] sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm font-medium leading-8 text-[#77736D] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
