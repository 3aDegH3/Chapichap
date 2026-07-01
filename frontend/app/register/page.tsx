"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api";

const registerSchema = z.object({
  first_name: z.string().trim().min(2, "نام را وارد کنید."),
  last_name: z.string().trim().min(2, "نام خانوادگی را وارد کنید."),
  username: z.string().optional(),
  email: z.string().email("ایمیل معتبر وارد کنید."),
  phone_number: z.string().optional(),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const fieldLabels: Record<keyof RegisterFormValues, string> = {
  first_name: "نام",
  last_name: "نام خانوادگی",
  username: "نام کاربری",
  email: "ایمیل",
  phone_number: "شماره موبایل",
  password: "رمز عبور",
};

function toPersianFieldError(field: string, message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already exists") || normalized.includes("unique")) {
    return "این مقدار قبلاً ثبت شده است.";
  }
  if (normalized.includes("valid email")) {
    return "ایمیل معتبر وارد کنید.";
  }
  if (normalized.includes("blank") || normalized.includes("required")) {
    return "این فیلد الزامی است.";
  }
  if (normalized.includes("at least") || normalized.includes("min_length")) {
    return "مقدار واردشده کوتاه است.";
  }

  return message;
}

export default function RegisterPage() {
  const { register: registerUser, error: authError } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      setServerError(null);

      await registerUser({
        ...values,
        username: values.username || undefined,
        phone_number: values.phone_number || undefined,
      });
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      const appliedErrors = Object.entries(fieldErrors).filter(([field]) =>
        field in fieldLabels
      );

      appliedErrors.forEach(([field, message]) => {
        setError(field as keyof RegisterFormValues, {
          type: "server",
          message: toPersianFieldError(field, message),
        });
      });

      if (appliedErrors.length > 0) {
        setServerError(
          `ثبت‌نام کامل نشد. مشکل در ${appliedErrors
            .map(([field]) => fieldLabels[field as keyof RegisterFormValues])
            .join("، ")} است.`
        );
        return;
      }

      setServerError(getApiErrorMessage(error) || authError || "ثبت‌نام ناموفق بود. اطلاعات را بررسی کنید.");
    }
  }

  return (
    <main className="bg-[#F2EEE6] px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-[#D8CFC0] bg-[#FAFAF8] shadow-[0_24px_70px_-42px_rgba(51,50,48,0.65)] md:grid-cols-[1.1fr_0.9fr]">
        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-xl">
            <p className="text-sm font-black text-[#B2894C]">ساخت حساب</p>

            <h2 className="mt-3 text-3xl font-black leading-snug text-[#333230]">
              شروع تجربه اختصاصی چاپی چاپ
            </h2>

            <p className="mt-3 text-sm font-medium leading-7 text-[#77736D]">
              حساب بساز تا سفارش چاپ، درخواست طراحی و پیگیری مراحل سفارش‌هایت
              ساده و مرتب بماند.
            </p>

            {serverError && (
              <Alert variant="error" className="mt-6">
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  id="first_name"
                  label="نام"
                  placeholder="نام"
                  error={errors.first_name?.message}
                  className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                  {...register("first_name")}
                />

                <Input
                  id="last_name"
                  label="نام خانوادگی"
                  placeholder="نام خانوادگی"
                  error={errors.last_name?.message}
                  className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                  {...register("last_name")}
                />
              </div>

              <Input
                id="username"
                label="نام کاربری"
                placeholder="مثلاً sadegh"
                error={errors.username?.message}
                className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("username")}
              />

              <Input
                id="email"
                label="ایمیل"
                type="email"
                placeholder="example@email.com"
                error={errors.email?.message}
                className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("email")}
              />

              <Input
                id="phone_number"
                label="شماره موبایل"
                placeholder="09120000000"
                error={errors.phone_number?.message}
                className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("phone_number")}
              />

              <Input
                id="password"
                label="رمز عبور"
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                error={errors.password?.message}
                className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("password")}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-[#D2AD70] px-7 text-base font-black text-[#333230] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "در حال ساخت حساب..." : "ثبت‌نام"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm font-bold text-[#77736D]">
              قبلاً ثبت‌نام کرده‌ای؟{" "}
              <Link
                href="/login"
                className="text-[#B2894C] hover:text-[#333230]"
              >
                وارد شو
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden border-r border-[#E3DED5] bg-[#F6F1E8] p-8 md:block lg:p-10">
          <div className="flex h-full min-h-[620px] flex-col justify-between">
            <div>
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#D2AD70]/60 bg-white shadow-[0_16px_34px_-24px_rgba(51,50,48,0.75)]">
                <Image
                  src="/brand/logo.png"
                  alt="لوگوی چاپی چاپ"
                  width={160}
                  height={160}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <p className="mt-8 text-sm font-black text-[#B2894C]">
                حساب اختصاصی چاپ و هدیه
              </p>

              <h1 className="mt-3 text-3xl font-black leading-snug text-[#333230]">
                هدیه اختصاصی از همین‌جا شروع می‌شود
              </h1>

              <p className="mt-4 max-w-sm text-sm font-medium leading-8 text-[#77736D]">
                با ساخت حساب، مسیر سفارش چاپ، طراحی و پیگیری سفارش‌ها برایت
                ساده‌تر می‌شود.
              </p>
            </div>

            <div className="grid gap-3">
              {["چاپ روی ماگ", "تیشرت اختصاصی", "هدیه شخصی", "طراحی سفارشی"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-[#E3DED5] bg-white px-4 py-3 text-sm font-black text-[#333230]"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
