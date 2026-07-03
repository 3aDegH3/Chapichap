"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

import { useAuth } from "@/contexts/AuthContext";
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
    <main className="bg-[#F2EEE6] px-4 py-10 sm:py-14">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-2xl border border-[#D8CFC0] bg-[#FAFAF8] shadow-[0_24px_70px_-42px_rgba(51,50,48,0.65)] md:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden border-l border-[#E3DED5] bg-[#F6F1E8] p-8 md:block lg:p-10">
          <div className="flex h-full min-h-[520px] flex-col justify-between">
            <div>
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[#D2AD70]/60 bg-white shadow-[0_16px_34px_-24px_rgba(51,50,48,0.75)]">
                <Image
                  src="/brand/logo.webp"
                  alt="لوگوی چاپی چاپ"
                  width={160}
                  height={160}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>

              <p className="mt-8 text-sm font-black text-[#B2894C]">
                ورود امن به چاپی چاپ
              </p>

              <h1 className="mt-3 text-3xl font-black leading-snug text-[#333230]">
                سفارش‌ها و طرح‌هایت همین‌جا منتظرت هستند
              </h1>

              <p className="mt-4 max-w-sm text-sm font-medium leading-8 text-[#77736D]">
                وارد حساب شو تا سفارش‌ها، درخواست‌های طراحی و مسیر خریدت را
                ادامه بدهی.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "پیگیری سفارش‌های چاپ",
                "دیدن درخواست‌های طراحی",
                "ادامه خریدهای نیمه‌کاره",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-[#E3DED5] bg-white px-4 py-3 text-sm font-black text-[#333230]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#D2AD70]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-md">
            <p className="text-sm font-black text-[#B2894C]">
              ورود به حساب
            </p>

            <h2 className="mt-3 text-3xl font-black leading-snug text-[#333230]">
              خوش برگشتی
            </h2>

            <p className="mt-3 text-sm font-medium leading-7 text-[#77736D]">
              با ایمیل یا شماره موبایل وارد شو و سفارش چاپت را ادامه بده.
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
                className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("identifier")}
              />

              <Input
                id="password"
                label="رمز عبور"
                type="password"
                placeholder="رمز عبور"
                error={errors.password?.message}
                className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("password")}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-[#D2AD70] px-7 text-base font-black text-[#333230] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "در حال ورود..." : "ورود"}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-sm font-bold text-[#77736D] sm:flex-row sm:justify-between">
              <Link href="/forgot-password" className="text-[#B2894C] hover:text-[#333230]">
                فراموشی رمز عبور
              </Link>
              <span>
                حساب نداری؟{" "}
                <Link href="/register" className="text-[#B2894C] hover:text-[#333230]">
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
