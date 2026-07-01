"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  createContactMessage,
  type ContactMessagePayload,
} from "@/lib/contact-api";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api";

const contactSubjects = [
  { value: "order", label: "سفارش محصول" },
  { value: "custom_design", label: "طراحی اختصاصی" },
  { value: "collaboration", label: "همکاری" },
  { value: "follow_up", label: "پیگیری سفارش" },
  { value: "general", label: "سؤال عمومی" },
] as const;

const contactSchema = z.object({
  full_name: z.string().trim().min(2, "نام و نام خانوادگی را کامل‌تر وارد کنید."),
  phone: z
    .string()
    .trim()
    .min(8, "شماره تماس معتبر وارد کنید.")
    .regex(/^[0-9۰-۹٠-٩+\-()\s]+$/, "شماره تماس فقط می‌تواند شامل عدد، فاصله یا + باشد."),
  subject: z.enum(["order", "custom_design", "collaboration", "follow_up", "general"]),
  message: z.string().trim().min(10, "متن پیام باید حداقل ۱۰ کاراکتر باشد."),
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

  async function onSubmit(values: ContactFormValues) {
    setServerError("");
    setSuccessMessage("");

    try {
      await createContactMessage(values as ContactMessagePayload);
      setSuccessMessage(
        "پیام شما با موفقیت ثبت شد. تیم چاپی چاپ در اولین فرصت با شما ارتباط می‌گیرد."
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
          "ارسال پیام انجام نشد. لطفاً دوباره تلاش کنید یا از طریق شماره تماس و اینستاگرام با ما در ارتباط باشید."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] sm:p-6"
    >
      <div>
        <p className="text-sm font-black text-[#B2894C]">فرم تماس</p>
        <h2 className="mt-2 text-2xl font-black text-[#333230]">
          پیام خود را برای ما بفرستید
        </h2>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          id="full_name"
          label="نام و نام خانوادگی"
          error={errors.full_name?.message}
        >
          <input
            id="full_name"
            {...register("full_name")}
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? "full_name-error" : undefined}
            className={inputClass(Boolean(errors.full_name))}
          />
        </Field>

        <Field id="phone" label="شماره تماس" error={errors.phone?.message}>
          <input
            id="phone"
            {...register("phone")}
            inputMode="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            className={inputClass(Boolean(errors.phone))}
          />
        </Field>

        <Field id="subject" label="موضوع درخواست" error={errors.subject?.message}>
          <select
            id="subject"
            {...register("subject")}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            className={inputClass(Boolean(errors.subject))}
          >
            {contactSubjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-end">
          <label className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] px-4 py-3 text-sm font-bold text-[#333230]">
            <input
              type="checkbox"
              {...register("contact_permission")}
              className="h-4 w-4 accent-[#D2AD70]"
            />
            رضایت دارم تیم چاپی چاپ برای پیگیری با من تماس بگیرد.
          </label>
        </div>
      </div>

      <Field id="message" label="متن پیام" error={errors.message?.message} className="mt-5">
        <textarea
          id="message"
          {...register("message")}
          rows={6}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          className={`${inputClass(Boolean(errors.message))} h-auto resize-none py-3 leading-8`}
        />
      </Field>

      <div aria-live="polite" className="mt-5">
        {successMessage && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold leading-7 text-emerald-800">
            {successMessage}
          </p>
        )}
        {serverError && (
          <p className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-bold leading-7 text-red-700">
            {serverError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 h-12 w-full rounded-2xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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
      <label htmlFor={id} className="block text-sm font-black text-[#333230]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 text-xs font-bold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-[#333230] outline-none transition placeholder:text-[#A8A29A] focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-[#E3DED5] focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
  }`;
}
