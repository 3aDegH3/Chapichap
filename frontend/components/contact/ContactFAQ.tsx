import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";

const faqs = [
  {
    question: "برای شروع سفارش باید فایل نهایی داشته باشم؟",
    answer:
      "نه. اگر فقط ایده، عکس یا توضیح اولیه دارید، می‌توانید درخواست طراحی ثبت کنید تا مسیر آماده‌سازی طرح مشخص شود.",
  },
  {
    question: "مراجعه حضوری بدون هماهنگی ممکن است؟",
    answer:
      "برای اینکه زمان بررسی سفارش دقیق‌تر باشد، مراجعه حضوری فقط با هماهنگی قبلی انجام می‌شود.",
  },
  {
    question: "برای پیگیری سفارش از کجا اقدام کنم؟",
    answer:
      "می‌توانید از فرم تماس، تماس تلفنی یا بخش سفارش‌ها در حساب کاربری وضعیت سفارش را پیگیری کنید.",
  },
];

export default function ContactFAQ() {
  return (
    <PageSection className="bg-white">
      <SectionHeading
        eyebrow="سؤال‌های کوتاه"
        title="قبل از تماس شاید این‌ها کمک کند"
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {faqs.map((item) => (
          <div
            key={item.question}
            className="rounded-2xl border border-[#E3DED5] bg-[#FAFAF8] p-5"
          >
            <h2 className="text-base font-black leading-7 text-[#333230]">
              {item.question}
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-[#77736D]">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </PageSection>
  );
}
