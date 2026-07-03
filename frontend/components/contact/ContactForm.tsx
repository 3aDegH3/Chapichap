"use client";

import { useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  createContactMessage,
  type ContactMessagePayload,
} from "@/lib/contact-api";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api";

const contactSubjects = [
  {
    value: "order",
    label: "سفارش محصول",
    helper: "راهنمایی برای انتخاب یا ثبت سفارش محصول",
  },
  {
    value: "custom_design",
    label: "طراحی اختصاصی",
    helper: "تبدیل ایده یا تصویر اولیه به طرح قابل چاپ",
  },
  {
    value: "collaboration",
    label: "همکاری",
    helper: "همکاری سازمانی، عمده یا تجاری",
  },
  {
    value: "follow_up",
    label: "پیگیری سفارش",
    helper: "پیگیری وضعیت سفارش ثبت‌شده",
  },
  {
    value: "general",
    label: "سؤال عمومی",
    helper: "پرسش درباره خدمات، چاپ یا محصولات",
  },
] as const;

const contactSchema = z.object({
  full_name: z.string().trim().min(2, "نام و نام خانوادگی را کامل‌تر وارد کنید."),
  phone: z
    .string()
    .trim()
    .min(8, "شماره تماس معتبر وارد کنید.")
    .regex(
      /^[0-9۰-۹٠-٩+\-()\s]+$/,
      "شماره تماس فقط می‌تواند شامل عدد، فاصله یا + باشد.",
    ),
  subject: z.enum([
    "order",
    "custom_design",
    "collaboration",
    "follow_up",
    "general",
  ]),
  message: z.string().trim().min(20, "متن پیام باید حداقل ۲۰ کاراکتر باشد."),
  contact_permission: z.boolean(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const defaultValues: ContactFormValues = {
  full_name: "",
  phone: "",
  subject: "order",
  message: "",
  contact_permission: true,
};

export default function ContactForm() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues,
  });

  const selectedSubject = useWatch({
    control,
    name: "subject",
  });

  const messageValue =
    useWatch({
      control,
      name: "message",
    }) || "";

  async function onSubmit(values: ContactFormValues) {
    setServerError("");
    setSuccessMessage("");

    try {
      await createContactMessage(values as ContactMessagePayload);
      setSuccessMessage(
        "پیام شما با موفقیت ثبت شد. تیم چاپی چاپ در اولین فرصت با شما ارتباط می‌گیرد.",
      );
      reset(defaultValues);
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);

      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (field in defaultValues) {
          setError(field as keyof ContactFormValues, {
            type: "server",
            message,
          });
        }
      });

      setServerError(
        getApiErrorMessage(error) ||
          "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید یا از طریق شماره تماس با ما در ارتباط باشید.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative overflow-hidden rounded-[32px] border border-[#DED5CA] bg-white p-5 shadow-[0_28px_70px_-50px_rgba(48,40,32,0.55)] sm:p-7 lg:p-8"
    >
      <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D2AD70]/10 blur-[80px]" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#D2AD70] to-transparent" />

      <div className="relative">
        <p className="text-[20px] font-black text-[#A16E2D]">فرم تماس</p>

        <h2 className="mt-2 text-[32px] font-black leading-[1.55] text-[#302B27] sm:text-[38px]">
          پیام خود را برای ما بفرست
        </h2>

        <p className="mt-3 text-[20px] font-medium leading-[1.9] text-[#766F67]">
          اطلاعات زیر فقط برای پاسخ‌گویی و پیگیری همین درخواست استفاده می‌شوند.
        </p>
      </div>

      <div className="relative mt-8 grid gap-5 sm:grid-cols-2">
        <Field
          id="full_name"
          label="نام و نام خانوادگی"
          error={errors.full_name?.message}
        >
          <input
            id="full_name"
            {...register("full_name")}
            placeholder="نام شما"
            className={inputClass(Boolean(errors.full_name))}
          />
        </Field>

        <Field id="phone" label="شماره تماس" error={errors.phone?.message}>
          <input
            id="phone"
            {...register("phone")}
            inputMode="tel"
            placeholder="مثلاً 09123456789"
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>
      </div>

      <div className="relative mt-7">
        <p className="text-[20px] font-black text-[#302B27]">موضوع درخواست</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {contactSubjects.map((subject, index) => {
            const isActive = selectedSubject === subject.value;

            return (
              <label
                key={subject.value}
                className={[
                  "group cursor-pointer rounded-[20px] border p-4 transition-all duration-500",
                  isActive
                    ? "border-[#C99A52] bg-[#F5EAD8] shadow-[0_18px_35px_-28px_rgba(116,79,34,0.45)]"
                    : "border-[#E3DBD0] bg-[#FBFAF7] hover:-translate-y-1 hover:border-[#D2AD70]",
                ].join(" ")}
              >
                <input
                  type="radio"
                  value={subject.value}
                  className="sr-only"
                  {...register("subject")}
                />

                <div className="flex items-start gap-4">
                  <span
                    className={[
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] text-[20px] font-black transition-all duration-500",
                      isActive
                        ? "bg-[#302C28] text-[#E1B976]"
                        : "bg-[#F1E8DC] text-[#98672B] group-hover:rotate-[-5deg]",
                    ].join(" ")}
                  >
                    {(index + 1).toLocaleString("fa-IR", {
                      minimumIntegerDigits: 2,
                    })}
                  </span>

                  <span>
                    <span className="block text-[21px] font-black text-[#302B27]">
                      {subject.label}
                    </span>
                    <span className="mt-1.5 block text-[20px] font-medium leading-[1.75] text-[#766F67]">
                      {subject.helper}
                    </span>
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <Field
        id="message"
        label="متن پیام"
        error={errors.message?.message}
        className="relative mt-7"
      >
        <textarea
          id="message"
          {...register("message")}
          rows={7}
          placeholder="درخواست، سؤال یا توضیحات سفارش را با جزئیات بنویس..."
          className={`${inputClass(Boolean(errors.message))} h-auto resize-none py-4 leading-[1.9]`}
        />

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[20px] font-bold text-[#8B8177]">
            حداقل ۲۰ کاراکتر
          </p>
          <p
            className={[
              "text-[20px] font-black",
              messageValue.trim().length >= 20
                ? "text-emerald-700"
                : "text-[#9B692B]",
            ].join(" ")}
          >
            {messageValue.length.toLocaleString("fa-IR")} کاراکتر
          </p>
        </div>
      </Field>

      <label className="relative mt-6 flex cursor-pointer items-start gap-4 rounded-[20px] border border-[#E3DBD0] bg-[#FBFAF7] p-4 transition-all duration-300 hover:border-[#D2AD70] hover:bg-[#F7F1E8]">
        <input
          type="checkbox"
          {...register("contact_permission")}
          className="mt-1 h-6 w-6 shrink-0 accent-[#B2894C]"
        />
        <span className="text-[20px] font-bold leading-[1.9] text-[#4F4943]">
          رضایت دارم تیم چاپی چاپ برای پیگیری این درخواست با من تماس بگیرد.
        </span>
      </label>

      <div aria-live="polite" className="relative mt-6">
        {successMessage && (
          <p className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-5 text-[20px] font-bold leading-[1.9] text-emerald-800">
            {successMessage}
          </p>
        )}

        {serverError && (
          <p className="rounded-[20px] border border-red-200 bg-red-50 p-5 text-[20px] font-bold leading-[1.9] text-red-700">
            {serverError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="contact-shine relative mt-7 inline-flex min-h-[62px] w-full items-center justify-center rounded-[20px] bg-[#302C28] px-8 text-[20px] font-black text-white shadow-[0_20px_45px_-28px_rgba(48,44,40,0.72)] transition-all duration-500 hover:-translate-y-1 hover:bg-[#A87431] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "در حال ارسال..." : "ارسال پیام"}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[20px] font-black text-[#302B27]">
        {label}
      </label>
      <div className="mt-3">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[20px] font-bold leading-[1.7] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "min-h-[58px] w-full rounded-[17px] border bg-white px-5 text-[20px] font-medium text-[#302B27] outline-none transition-all duration-300 placeholder:text-[20px] placeholder:text-[#A49A90] focus:ring-4",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-[#DDD5CA] focus:border-[#C99A52] focus:ring-[#C99A52]/15",
  ].join(" ");
}