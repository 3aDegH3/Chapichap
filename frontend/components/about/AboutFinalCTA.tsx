import FinalCTA from "@/components/shared/FinalCTA";
import PageSection from "@/components/shared/PageSection";

export default function AboutFinalCTA() {
  return (
    <PageSection className="bg-[#FAFAF8]">
      <FinalCTA
        title="ایده‌ای برای یک هدیه یا چاپ اختصاصی دارید؟"
        description="برای شروع لازم نیست طرح نهایی آماده داشته باشید. ایده خود را برای ما بفرستید تا برای انتخاب محصول و آماده‌سازی طرح راهنمایی‌تان کنیم."
        primaryLabel="ثبت درخواست طراحی"
        primaryHref="/design-request"
        secondaryLabel="تماس با ما"
        secondaryHref="/contact"
      />
    </PageSection>
  );
}
