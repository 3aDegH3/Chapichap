import { siteInfo } from "@/lib/site-info";

export default function ContactMap() {
  return (
    <div className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] sm:p-6">
      <p className="text-sm font-black text-[#B2894C]">موقعیت دفتر چاپی چاپ</p>
      <h2 className="mt-2 text-2xl font-black text-[#333230]">
        {siteInfo.officeAddress}
      </h2>
      <p className="mt-3 text-sm font-medium leading-7 text-[#77736D]">
        {siteInfo.officeVisitNote}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#E3DED5] bg-[#F2EEE6]">
        <iframe
          title="موقعیت دفتر چاپی چاپ در میدان آزادی اصفهان"
          src={siteInfo.mapEmbedUrl}
          className="h-[320px] w-full border-0 lg:h-[420px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a
        href={siteInfo.mapExternalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex h-11 items-center justify-center rounded-xl border border-[#D2AD70]/45 bg-[#F6F1E8] px-5 text-sm font-black text-[#333230] transition duration-300 hover:border-[#D2AD70] hover:bg-white"
      >
        مشاهده در گوگل مپ
      </a>
    </div>
  );
}
