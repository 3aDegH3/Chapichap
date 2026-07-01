import IconCard from "@/components/shared/IconCard";
import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";

const missions = [
  {
    icon: "01",
    title: "طراحی شخصی و متفاوت",
    description:
      "هر سفارش باید متناسب با سلیقه و نیاز همان مشتری طراحی یا آماده‌سازی شود.",
  },
  {
    icon: "02",
    title: "اجرای دقیق و باکیفیت",
    description:
      "کیفیت فایل، جانمایی طرح، رنگ و نتیجه نهایی پیش از اجرا بررسی می‌شود.",
  },
  {
    icon: "03",
    title: "ارتباط ساده و شفاف",
    description:
      "مشتری باید بتواند بدون پیچیدگی سؤال بپرسد، طرح ارسال کند و سفارش را دنبال کند.",
  },
];

export default function BrandMission() {
  return (
    <PageSection className="bg-[#FAFAF8]">
      <SectionHeading
        eyebrow="مأموریت برند"
        title="مأموریت ما چیست؟"
        description="مأموریت ما ساده‌کردن سفارش محصولات چاپی و هدایای اختصاصی است؛ از لحظه‌ای که مشتری یک ایده دارد تا زمانی که محصول نهایی را دریافت می‌کند."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {missions.map((item) => (
          <IconCard key={item.title} {...item} />
        ))}
      </div>
    </PageSection>
  );
}
