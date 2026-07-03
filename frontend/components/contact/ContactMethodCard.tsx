import type { ReactNode } from "react";

type ContactMethodCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  helper: string;
  href?: string;
  external?: boolean;
  index?: number;
};

export default function ContactMethodCard({
  icon,
  title,
  value,
  helper,
  href,
  external = false,
  index = 0,
}: ContactMethodCardProps) {
  const content = (
    <>
      <span className="absolute left-5 top-5 text-[20px] font-black text-[#C7B8A5]">
        {(index + 1).toLocaleString("fa-IR", {
          minimumIntegerDigits: 2,
        })}
      </span>

      <span className="flex h-[70px] w-[70px] items-center justify-center rounded-[22px] border border-[#E2D3BD] bg-[#F6EDDF] text-[#98672B] transition-all duration-500 group-hover:rotate-[-6deg] group-hover:border-[#302C28] group-hover:bg-[#302C28] group-hover:text-[#E5BC76]">
        {icon}
      </span>

      <h2 className="mt-6 text-[27px] font-black leading-[1.6] text-[#302B27]">
        {title}
      </h2>

      <p className="mt-2 break-words text-[23px] font-black leading-[1.7] text-[#9B692B]">
        {value}
      </p>

      <p className="mt-3 text-[20px] font-medium leading-[2] text-[#766F67]">
        {helper}
      </p>

      <span className="mt-6 inline-flex items-center gap-3 text-[20px] font-black text-[#9B692B]">
        مشاهده و ارتباط
        <span className="transition-transform duration-500 group-hover:-translate-x-2">
          ←
        </span>
      </span>
    </>
  );

  const className =
    "group relative block h-full overflow-hidden rounded-[28px] border border-[#E3DBD0] bg-white p-6 shadow-[0_22px_55px_-46px_rgba(49,41,34,0.48)] transition-all duration-500 hover:-translate-y-2 hover:border-[#CFA766] hover:shadow-[0_32px_70px_-48px_rgba(106,72,31,0.42)]";

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