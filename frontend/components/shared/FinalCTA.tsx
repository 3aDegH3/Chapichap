import Link from "next/link";

type FinalCTAProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export default function FinalCTA({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: FinalCTAProps) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-[#D8CFC0] bg-[#333230] p-6 text-white shadow-[0_28px_80px_-58px_rgba(51,50,48,0.85)] sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <p className="text-sm font-black text-[#D2AD70]">شروع همکاری</p>
        <h2 className="mt-3 text-2xl font-black leading-snug sm:text-3xl">
          {title}
        </h2>
        <p className="mt-4 text-sm font-medium leading-8 text-white/68 sm:text-base">
          {description}
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href={primaryHref}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E1BF83]"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/18 bg-white/[0.06] px-6 text-sm font-black text-white transition duration-300 hover:-translate-y-0.5 hover:border-[#D2AD70]/55 hover:bg-white/[0.1]"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
