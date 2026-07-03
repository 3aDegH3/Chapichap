import { siteInfo } from "@/lib/site-info";

export default function ContactMap() {
  return (
    <div className="overflow-hidden rounded-[30px] border border-[#DED5CA] bg-white p-5 shadow-[0_28px_70px_-50px_rgba(48,40,32,0.55)] sm:p-6">
      <div>
        <p className="text-[20px] font-black text-[#A16E2D]">
          موقعیت دفتر چاپی چاپ
        </p>

        <h2 className="mt-2 text-[28px] font-black leading-[1.6] text-[#302B27]">
          {siteInfo.officeAddress}
        </h2>

        <p className="mt-2 text-[20px] font-medium leading-[1.9] text-[#766F67]">
          {siteInfo.officeVisitNote}
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-[#E3DBD0] bg-[#F2EEE6]">
        <iframe
          title="موقعیت دفتر چاپی چاپ در اصفهان"
          src={siteInfo.mapEmbedUrl}
          className="h-[340px] w-full border-0 lg:h-[430px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <a
        href={siteInfo.mapExternalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-[56px] items-center justify-center rounded-[17px] border border-[#D2AD70]/45 bg-[#F6F1E8] px-6 text-[20px] font-black text-[#302B27] transition-all duration-500 hover:-translate-y-1 hover:border-[#D2AD70] hover:bg-white"
      >
        مشاهده در نقشه
      </a>
    </div>
  );
}