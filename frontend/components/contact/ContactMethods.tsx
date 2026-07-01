import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";
import { siteInfo } from "@/lib/site-info";

import ContactMethodCard from "./ContactMethodCard";

export default function ContactMethods() {
  return (
    <PageSection className="bg-white">
      <SectionHeading
        eyebrow="راه‌های ارتباطی"
        title="سریع‌ترین مسیر ارتباط با ما"
        description="شماره تماس، اینستاگرام و آدرس دفتر از اطلاعات مرکزی سایت خوانده می‌شوند تا همیشه یک‌دست و قابل تغییر باشند."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <ContactMethodCard
          icon="تل"
          title="تماس با چاپی چاپ"
          value={siteInfo.phoneDisplay}
          href={`tel:${siteInfo.phone}`}
          helper="برای هماهنگی سفارش و دریافت راهنمایی با ما تماس بگیرید."
        />
        <ContactMethodCard
          icon="این"
          title="اینستاگرام چاپی چاپ"
          value={siteInfo.instagramDisplay}
          href={siteInfo.instagramUrl}
          external
          helper="نمونه‌کارها، محصولات جدید و فعالیت‌های چاپی چاپ را دنبال کنید."
        />
        <ContactMethodCard
          icon="دف"
          title="دفتر چاپی چاپ"
          value={siteInfo.officeAddress}
          helper={siteInfo.officeVisitNote}
        />
      </div>
    </PageSection>
  );
}
