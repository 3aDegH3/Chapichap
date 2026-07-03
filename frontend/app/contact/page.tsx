import type { Metadata } from "next";

import ContactFAQ from "@/components/contact/ContactFAQ";
import ContactForm from "@/components/contact/ContactForm";
import ContactHero from "@/components/contact/ContactHero";
import ContactMap from "@/components/contact/ContactMap";
import ContactMethods from "@/components/contact/ContactMethods";
import FinalCTA from "@/components/shared/FinalCTA";
import PageSection from "@/components/shared/PageSection";
import { siteInfo } from "@/lib/site-info";

export const metadata: Metadata = {
  title: "تماس با چاپی چاپ | سفارش چاپ و هدیه اختصاصی در اصفهان",
  description:
    "برای سفارش چاپ، طراحی اختصاصی و دریافت راهنمایی با چاپی چاپ در اصفهان تماس بگیرید یا پیام خود را برای ما ارسال کنید.",
  alternates: {
    canonical: "/contact",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: siteInfo.brandName,
  alternateName: siteInfo.brandEnglishName,
  telephone: siteInfo.phone,
  address: {
    "@type": "PostalAddress",
    addressLocality: "اصفهان",
    streetAddress: siteInfo.officeAddress,
  },
  sameAs: [siteInfo.instagramUrl],
};

export default function ContactPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessJsonLd),
        }}
      />

      <ContactHero />
      <ContactMethods />

      <section className="border-b border-[#E8E1D8] bg-[#F3EEE7] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1760px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-12 rounded-full bg-[#C99A52]" />
              <p className="text-[20px] font-black text-[#A16E2D]">
                ارسال پیام
              </p>
            </div>

            <h2 className="mt-4 text-[34px] font-black leading-[1.55] text-[#302B27] sm:text-[42px] lg:text-[48px]">
              درخواستت را مستقیم برای ما بنویس
            </h2>

            <p className="mt-5 text-[20px] font-medium leading-[2] text-[#746D65] sm:text-[22px]">
              موضوع پیام را انتخاب کن و توضیحات لازم را بنویس. فرم تماس به
              همان API فعلی پروژه متصل است و نیازی به تغییر بک‌اند ندارد.
            </p>
          </div>

          <div className="mt-10 grid gap-7 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] xl:items-start">
            <ContactForm />

            <div className="grid gap-7">
              <ContactMap />


            </div>
          </div>
        </div>
      </section>

      <ContactFAQ />

      <PageSection className="bg-[#FAFAF8]">
        <FinalCTA
          title="آماده‌اید سفارش چاپ یا هدیه اختصاصی را شروع کنید؟"
          description="اگر مسیر دقیق را نمی‌دانید، پیام بفرستید یا درخواست طراحی ثبت کنید تا برای انتخاب محصول و آماده‌سازی طرح راهنمایی‌تان کنیم."
          primaryLabel="ثبت درخواست طراحی"
          primaryHref="/design-request"
          secondaryLabel="تماس تلفنی"
          secondaryHref={`tel:${siteInfo.phone}`}
        />
      </PageSection>
    </main>
  );
}