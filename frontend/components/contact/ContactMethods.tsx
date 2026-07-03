import { siteInfo } from "@/lib/site-info";

import ContactMethodCard from "./ContactMethodCard";

export default function ContactMethods() {
  return (
    <section className="border-b border-[#E8E1D8] bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-12 rounded-full bg-[#C99A52]" />
            <p className="text-[20px] font-black text-[#A16E2D]">
              راه‌های ارتباطی
            </p>
          </div>

          <h2 className="mt-4 text-[34px] font-black leading-[1.55] text-[#302B27] sm:text-[42px] lg:text-[48px]">
            سریع‌ترین مسیر ارتباط با ما
          </h2>

          <p className="mt-5 text-[20px] font-medium leading-[2] text-[#746D65] sm:text-[22px]">
            شماره تماس، اینستاگرام و آدرس دفتر از اطلاعات مرکزی سایت خوانده
            می‌شوند تا همیشه یک‌دست و قابل تغییر باشند.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <ContactMethodCard
            index={0}
            icon={<span className="text-[22px] font-black">تل</span>}
            title="تماس با چاپی چاپ"
            value={siteInfo.phoneDisplay}
            href={`tel:${siteInfo.phone}`}
            helper="برای هماهنگی سفارش و دریافت راهنمایی با ما تماس بگیرید."
          />

          <ContactMethodCard
            index={1}
            icon={<span className="text-[22px] font-black">این</span>}
            title="اینستاگرام چاپی چاپ"
            value={siteInfo.instagramDisplay}
            href={siteInfo.instagramUrl}
            external
            helper="نمونه‌کارها، محصولات جدید و فعالیت‌های چاپی چاپ را دنبال کنید."
          />

          <ContactMethodCard
            index={2}
            icon={<span className="text-[22px] font-black">دف</span>}
            title="دفتر چاپی چاپ"
            value={siteInfo.officeAddress}
            href={siteInfo.mapExternalUrl}
            external
            helper={siteInfo.officeVisitNote}
          />
        </div>
      </div>
    </section>
  );
}