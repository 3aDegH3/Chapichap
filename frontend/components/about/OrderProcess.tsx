import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";

const steps = [
  "انتخاب محصول یا ثبت ایده",
  "ارسال طرح، تصویر یا توضیحات",
  "بررسی و هماهنگی با تیم",
  "تأیید نهایی طرح",
  "چاپ، آماده‌سازی و ارسال",
];

const trustItems = [
  "بررسی طرح قبل از چاپ",
  "امکان سفارش شخصی‌سازی‌شده",
  "ارتباط مستقیم با تیم",
  "نمایش نمونه‌کارهای واقعی",
  "توضیح شفاف فرایند سفارش",
];

export default function OrderProcess() {
  return (
    <PageSection className="bg-white">
      <SectionHeading
        eyebrow="فرایند همکاری"
        title="از ایده تا محصول نهایی"
        description="به‌جای پیچیده‌کردن سفارش، مسیر کار را مرحله‌به‌مرحله و قابل پیگیری نگه می‌داریم."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        {steps.map((step, index) => (
          <div
            key={step}
            className="relative rounded-2xl border border-[#E3DED5] bg-[#FAFAF8] p-5 motion-safe:transition motion-safe:hover:-translate-y-0.5"
          >
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute -left-2 top-9 hidden h-px w-4 bg-[#D2AD70] lg:block"
              />
            )}
            <p className="text-xs font-black text-[#B2894C]">
              {(index + 1).toLocaleString("fa-IR", {
                minimumIntegerDigits: 2,
              })}
            </p>
            <h3 className="mt-3 text-sm font-black leading-7 text-[#333230]">
              {step}
            </h3>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[1.5rem] border border-[#D2AD70]/30 bg-[#F6F1E8] p-5 sm:p-6">
        <p className="text-sm font-black text-[#333230]">اعتمادسازی بدون اغراق</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {trustItems.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[#D8CFC0] bg-white px-3 py-1.5 text-xs font-black text-[#6F6A63]"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
