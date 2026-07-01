import type { ReactNode } from "react";

type ContactMethodCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  helper: string;
  href?: string;
  external?: boolean;
};

export default function ContactMethodCard({
  icon,
  title,
  value,
  helper,
  href,
  external = false,
}: ContactMethodCardProps) {
  const content = (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F6F1E8] text-base font-black text-[#B2894C]">
        {icon}
      </span>
      <h2 className="mt-5 text-base font-black text-[#333230]">{title}</h2>
      <p className="mt-2 text-lg font-black text-[#B2894C]">{value}</p>
      <p className="mt-3 text-sm font-medium leading-7 text-[#77736D]">
        {helper}
      </p>
    </>
  );

  const className =
    "block rounded-2xl border border-[#E3DED5] bg-white p-5 transition duration-300 hover:border-[#D2AD70] hover:bg-[#FAFAF8]";

  if (href) {
    return (
      <a
        href={href}
        className={className}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
