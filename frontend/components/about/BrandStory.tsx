import Image from "next/image";

import PageSection from "@/components/shared/PageSection";
import SectionHeading from "@/components/shared/SectionHeading";

export default function BrandStory() {
  return (
    <PageSection className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-center">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-[#E3DED5] bg-[#F6F1E8] p-6">
          <div className="mx-auto flex aspect-square max-w-[260px] items-center justify-center rounded-[1.5rem] border border-[#D2AD70]/40 bg-white">
            <Image
              src="/brand/logo.png"
              alt="لوگوی چاپی چاپ روی بسته‌بندی هدیه"
              width={220}
              height={220}
              className="h-44 w-44 object-contain"
            />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {["طرح", "چاپ", "هدیه"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#D8CFC0] bg-white px-3 py-2 text-xs font-black text-[#333230]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="داستان برند"
            title="چاپی چاپ از کجا شروع شد؟"
          />
          <div className="mt-6 space-y-4 text-sm font-medium leading-8 text-[#77736D] sm:text-base">
            <p>
              چاپی چاپ با یک ایده ساده شکل گرفت؛ اینکه هدیه‌ها و محصولات چاپی
              نباید تکراری و بی‌احساس باشند. ما می‌خواهیم هر مشتری بتواند
              طرح، تصویر، نوشته یا خاطره‌ای که برایش ارزشمند است را به یک
              محصول واقعی تبدیل کند.
            </p>
            <p>
              ما یک تیم تازه و حرفه‌ای هستیم و مسیر خود را با تمرکز بر طراحی
              خلاقانه، اجرای دقیق و ارتباط صمیمی با مشتری آغاز کرده‌ایم. برای
              ما هر سفارش فقط یک چاپ نیست؛ نتیجه یک ایده شخصی است که باید با
              دقت ساخته شود.
            </p>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
