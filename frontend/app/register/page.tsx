"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
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
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">
        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-black text-[var(--primary)]">
              ساخت حساب
            </p>

            <h2 className="mt-3 text-3xl font-black text-[var(--dark)]">
              ثبت‌نام در چاپینو
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              حساب بساز تا بتوانی سفارش چاپ یا درخواست طراحی ثبت کنی.
            </p>

            {serverError && (
              <Alert variant="error" className="mt-6">
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <Input
                id="first_name"
                label="نام"
                placeholder="نام"
                error={errors.first_name?.message}
                {...register("first_name")}
              />

              <Input
                id="last_name"
                label="نام خانوادگی"
                placeholder="نام خانوادگی"
                error={errors.last_name?.message}
                {...register("last_name")}
              />

              <Input
                id="username"
                label="نام کاربری"
                placeholder="مثلاً sadegh"
                error={errors.username?.message}
                {...register("username")}
              />

              <Input
                id="email"
                label="ایمیل"
                type="email"
                placeholder="example@email.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                id="phone_number"
                label="شماره موبایل"
                placeholder="09120000000"
                error={errors.phone_number?.message}
                {...register("phone_number")}
              />

              <Input
                id="password"
                label="رمز عبور"
                type="password"
                placeholder="حداقل ۶ کاراکتر"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                ثبت‌نام
              </Button>
            </form>

            <p className="mt-6 text-center text-sm font-bold text-gray-600">
              قبلاً ثبت‌نام کرده‌ای؟{" "}
              <Link
                href="/login"
                className="text-[var(--primary)] hover:underline"
              >
                وارد شو
              </Link>
            </p>
          </div>
        </section>

        <section className="relative hidden bg-[var(--dark)] p-10 text-white md:block">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-[var(--primary)] opacity-30 blur-3xl" />
            <div className="absolute -left-16 bottom-16 h-56 w-56 rounded-full bg-[var(--secondary)] opacity-30 blur-3xl" />
            <div className="absolute left-1/3 top-1/2 h-40 w-40 rounded-full bg-[var(--accent)] opacity-20 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl font-black">
                چ
              </div>

              <h1 className="mt-8 text-3xl font-black leading-snug">
                هدیه اختصاصی از همین‌جا شروع می‌شود
              </h1>

              <p className="mt-4 max-w-sm leading-8 text-white/70">
                با ساخت حساب، مسیر سفارش چاپ، طراحی و پیگیری سفارش‌ها برایت
                ساده‌تر می‌شود.
              </p>
            </div>

            <div className="grid gap-3">
              {["چاپ روی ماگ", "تیشرت اختصاصی", "هدیه شخصی", "طراحی سفارشی"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black backdrop-blur"
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
