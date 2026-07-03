type AboutSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "right" | "center";
  dark?: boolean;
};

export default function AboutSectionHeading({
  eyebrow,
  title,
  description,
  align = "right",
  dark = false,
}: AboutSectionHeadingProps) {
  const isCentered = align === "center";

  return (
    <div className={isCentered ? "mx-auto max-w-4xl text-center" : "max-w-4xl"}>
      <div className={["flex items-center gap-3", isCentered ? "justify-center" : ""].join(" ")}>
        <span className="h-1.5 w-12 rounded-full bg-[#c99a52]" />
        <p className={`text-[20px] font-black ${dark ? "text-[#e1b976]" : "text-[#a16e2d]"}`}>
          {eyebrow}
        </p>
      </div>
      <h2 className={`mt-4 text-[34px] font-black leading-[1.55] sm:text-[42px] lg:text-[48px] ${dark ? "text-white" : "text-[#302b27]"}`}>
        {title}
      </h2>
      <p className={`mt-5 text-[20px] font-medium leading-[2] sm:text-[22px] ${dark ? "text-[#c8bdb2]" : "text-[#746d65]"}`}>
        {description}
      </p>
    </div>
  );
}
