import IconCard from "@/components/shared/IconCard";
import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";

const services = [
  {
    icon: "تی",
    title: "چاپ روی تیشرت و پارچه",
    description: "برای هدیه، رویداد یا سفارش‌های شخصی با طرح دلخواه.",
    href: "/products",
  },
  {
    icon: "ما",
    title: "چاپ روی ماگ",
    description: "ماگ اختصاصی با عکس، متن یا طراحی مناسب مناسبت‌ها.",
    href: "/products",
  },
  {
    icon: "هد",
    title: "هدایای اختصاصی",
    description: "محصولاتی که با جزئیات شخصی برای هدیه آماده می‌شوند.",
    href: "/design-request?type=gift",
  },
  {
    icon: "تب",
    title: "چاپ اقلام تبلیغاتی",
    description: "برای برندها، رویدادها و سفارش‌های سازمانی سبک و کاربردی.",
    href: "/products",
  },
  {
    icon: "کا",
    title: "طراحی کاریکاتور",
    description: "ایده‌ای متفاوت برای هدیه‌های تصویری و شخصی‌سازی‌شده.",
    href: "/design-request?type=caricature",
  },
  {
    icon: "شخ",
    title: "طراحی و شخصی‌سازی سفارش",
    description: "آماده‌سازی فایل و هماهنگ‌کردن طرح با محصول انتخابی.",
    href: "/design-request?type=custom_print",
  },
];

export default function ServicesGrid() {
  return (
    <PageSection className="bg-white">
      <SectionHeading
        eyebrow="خدمات"
        title="چه چیزهایی در چاپی چاپ ساخته می‌شود؟"
        description="مسیرها به بخش‌های واقعی سایت وصل شده‌اند تا کاربر از آشنایی با خدمت، مستقیم وارد انتخاب محصول یا ثبت درخواست شود."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((item) => (
          <IconCard key={item.title} {...item} />
        ))}
      </div>
    </PageSection>
  );
}
