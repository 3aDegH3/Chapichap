"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api";

const loginSchema = z.object({
  identifier: z.string().min(1, "ایمیل یا شماره موبایل را وارد کنید."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const fieldLabels: Record<keyof LoginFormValues, string> = {
  identifier: "ایمیل یا شماره موبایل",
  password: "رمز عبور",
};

export default function LoginPage() {
  const { login, error: authError } = useAuth();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      setServerError(null);
      await login(values, searchParams.get("next") || "/account");
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      const appliedErrors = Object.entries(fieldErrors).filter(([field]) => field in fieldLabels);

      appliedErrors.forEach(([field, message]) => {
        setError(field as keyof LoginFormValues, {
          type: "server",
          message,
        });
      });

      if (appliedErrors.length > 0) {
        setServerError(
          `ورود انجام نشد. مشکل در ${appliedErrors
            .map(([field]) => fieldLabels[field as keyof LoginFormValues])
            .join("، ")} است.`
        );
        return;
      }

      setServerError(getApiErrorMessage(error) || authError || "ورود ناموفق بود. اطلاعات را بررسی کنید.");
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-xl md:grid-cols-2">
        <section className="relative hidden bg-[var(--dark)] p-10 text-white md:block">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-[var(--primary)] opacity-30 blur-3xl" />
            <div className="absolute -left-16 bottom-16 h-56 w-56 rounded-full bg-[var(--secondary)] opacity-30 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-xl font-black">
                چ
              </div>

              <h1 className="mt-8 text-3xl font-black leading-snug">
                دوباره خوش آمدی
              </h1>

              <p className="mt-4 max-w-sm leading-8 text-white/70">
                وارد حساب شو تا سفارش‌ها، درخواست‌های طراحی و مسیر خریدت را
                ادامه بدهی.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-5 backdrop-blur">
              <p className="text-sm leading-7 text-white/75">
                «هدیه خاص از جایی شروع می‌شود که طرح تو وارد ماجرا می‌شود.»
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-black text-[var(--primary)]">
              ورود به حساب
            </p>

            <h2 className="mt-3 text-3xl font-black text-[var(--dark)]">
              وارد حساب کاربری شوید
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              با ایمیل یا شماره موبایل وارد شوید.
            </p>

            {serverError && (
              <Alert variant="error" className="mt-6">
                {serverError}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <Input
                id="identifier"
                label="ایمیل یا شماره موبایل"
                placeholder="example@email.com یا 0912..."
                error={errors.identifier?.message}
                {...register("identifier")}
              />

              <Input
                id="password"
                label="رمز عبور"
                type="password"
                placeholder="رمز عبور"
                error={errors.password?.message}
                {...register("password")}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                ورود
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm font-bold text-gray-600 sm:flex-row sm:justify-between">
              <Link href="/forgot-password" className="text-[var(--secondary)] hover:underline">
                فراموشی رمز عبور
              </Link>
              <span>
                حساب نداری؟{" "}
                <Link href="/register" className="text-[var(--primary)] hover:underline">
                  ثبت‌نام کن
                </Link>
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
