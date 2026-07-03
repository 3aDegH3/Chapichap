"use client";

import { useState } from "react";

const faqs = [
  {
    question: "برای شروع سفارش باید فایل نهایی داشته باشم؟",
    answer:
      "نه. اگر فقط ایده، عکس یا توضیح اولیه دارید، می‌توانید درخواست طراحی ثبت کنید تا مسیر آماده‌سازی طرح مشخص شود.",
  },
  {
    question: "برای سفارش عمده و سازمانی از کجا شروع کنم؟",
    answer:
      "موضوع «همکاری» را در فرم انتخاب کنید و تعداد تقریبی، محصول موردنظر و زمان موردنیاز را در پیام بنویسید.",
  },
  {
    question: "مراجعه حضوری بدون هماهنگی ممکن است؟",
    answer:
      "برای اینکه زمان بررسی سفارش دقیق‌تر باشد، مراجعه حضوری فقط با هماهنگی قبلی انجام می‌شود.",
  },
  {
    question: "برای پیگیری سفارش از کجا اقدام کنم؟",
    answer:
      "می‌توانید موضوع «پیگیری سفارش» را انتخاب کنید یا از بخش سفارش‌ها در حساب کاربری وضعیت سفارش را مشاهده کنید.",
  },
] as const;

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="border-b border-[#E8E1D8] bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1760px] px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-1.5 w-12 rounded-full bg-[#C99A52]" />
            <p className="text-[20px] font-black text-[#A16E2D]">
              سؤال‌های پرتکرار
            </p>
          </div>

          <h2 className="mt-4 text-[34px] font-black leading-[1.55] text-[#302B27] sm:text-[42px] lg:text-[48px]">
            قبل از تماس شاید پاسخ اینجا باشد
          </h2>

          <p className="mt-5 text-[20px] font-medium leading-[2] text-[#746D65] sm:text-[22px]">
            پاسخ کوتاه به سؤال‌هایی که معمولاً پیش از ثبت سفارش یا مراجعه
            حضوری پرسیده می‌شوند.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="overflow-hidden rounded-[24px] border border-[#E3DBD0] bg-[#FBFAF7] transition-all duration-500 hover:border-[#D2AD70]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-5 p-5 text-right sm:p-6"
                  aria-expanded={isOpen}
                >
                  <span className="flex min-w-0 items-center gap-4">
                    <span
                      className={[
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] text-[20px] font-black transition-all duration-500",
                        isOpen
                          ? "bg-[#302C28] text-[#E1B976]"
                          : "bg-[#F1E8DC] text-[#98672B]",
                      ].join(" ")}
                    >
                      {(index + 1).toLocaleString("fa-IR", {
                        minimumIntegerDigits: 2,
                      })}
                    </span>

                    <span className="text-[22px] font-black leading-[1.7] text-[#302B27]">
                      {item.question}
                    </span>
                  </span>

                  <span
                    className={[
                      "text-[30px] font-medium text-[#9B692B] transition-transform duration-500",
                      isOpen ? "rotate-45" : "",
                    ].join(" ")}
                  >
                    +
                  </span>
                </button>

                <div
                  className={[
                    "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  ].join(" ")}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-[#E9E2D9] px-5 py-5 text-[20px] font-medium leading-[2] text-[#746D65] sm:px-6">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}