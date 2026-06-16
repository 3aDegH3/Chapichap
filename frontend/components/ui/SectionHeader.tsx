import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "right" | "center";
  className?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "right",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        align === "center" && "mx-auto max-w-2xl text-center",
        align === "right" && "max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <p className="text-sm font-black text-[var(--primary)]">{eyebrow}</p>
      )}

      <h2 className="mt-3 text-3xl font-black leading-snug text-[var(--dark)]">
        {title}
      </h2>

      {description && (
        <p className="mt-4 leading-8 text-gray-600">{description}</p>
      )}
    </div>
  );
}