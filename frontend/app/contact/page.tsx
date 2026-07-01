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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      <ContactHero />
      <ContactMethods />

      <PageSection className="bg-[#FAFAF8]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.82fr)] lg:items-start">
          <ContactForm />
          <ContactMap />
        </div>
      </PageSection>

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
