import Image from "next/image";

type AboutImageFrameProps = {
  src: string | null;
  alt: string;
  title: string;
  description: string;
  className?: string;
  priority?: boolean;
};

export default function AboutImageFrame({
  src,
  alt,
  title,
  description,
  className = "",
  priority = false,
}: AboutImageFrameProps) {
  return (
    <div className={`relative overflow-hidden rounded-[36px] border border-white/80 bg-[#eee5d8] p-3 shadow-[0_38px_90px_-55px_rgba(48,40,32,0.65)] ${className}`}>
      <div className="absolute inset-3 overflow-hidden rounded-[28px]">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full min-h-[inherit] items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#fff,#eee3d4_72%)] p-8 text-center">
            <div className="max-w-md">
              <p className="text-[24px] font-black text-[#8e6028]">{title}</p>
              <p className="mt-3 text-[20px] font-medium leading-[1.9] text-[#756d64]">{description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
