import IconCard from "@/components/shared/IconCard";
import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";

const values = [
  {
    icon: "خ",
    title: "خلاقیت",
    description: "تلاش می‌کنیم هر سفارش متناسب با شخصیت و هدف مشتری باشد.",
  },
  {
    icon: "ک",
    title: "کیفیت",
    description: "فایل، چاپ و محصول نهایی باید پیش از تحویل بررسی شوند.",
  },
  {
    icon: "ص",
    title: "صداقت",
    description: "زمان آماده‌سازی، محدودیت چاپ و نتیجه قابل اجرا شفاف اعلام می‌شود.",
  },
  {
    icon: "ه",
    title: "همراهی",
    description: "از انتخاب طرح تا آماده‌شدن محصول، ارتباط با تیم ساده می‌ماند.",
  },
];

export default function BrandValues() {
  return (
    <PageSection className="bg-[#FAFAF8]">
      <SectionHeading
        eyebrow="ارزش‌های تیم"
        title="چیزی که برای ما مهم است"
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((item) => (
          <IconCard key={item.title} {...item} />
        ))}
      </div>
    </PageSection>
  );
}
