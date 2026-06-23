"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api";
import { requestPasswordReset } from "@/lib/auth-api";

const schema = z.object({ email: z.string().email("ایمیل معتبر وارد کنید.") });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function submit(values: FormValues) {
    setError("");
    try {
      await requestPasswordReset(values.email);
      router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <main className="bg-[#F2EEE6] px-4 py-10 sm:py-14">
      <section className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#D8CFC0] bg-[#FAFAF8] p-6 shadow-[0_24px_70px_-42px_rgba(51,50,48,0.65)] sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#D2AD70]/60 bg-white">
            <Image src="/brand/logo.png" alt="لوگوی چاپی چاپ" width={128} height={128} className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-black text-[#B2894C]">بازیابی رمز</p>
            <h1 className="mt-1 text-2xl font-black text-[#333230]">دریافت کد بازیابی</h1>
          </div>
        </div>
        <p className="mt-5 text-sm font-medium leading-7 text-[#77736D]">
          ایمیل حساب کاربری‌ات را وارد کن تا کد بازیابی برای تنظیم رمز جدید ارسال شود.
        </p>
        {error && <Alert variant="error" className="mt-6">{error}</Alert>}
        <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
          <Input
            id="email"
            label="ایمیل"
            type="email"
            error={errors.email?.message}
            className="rounded-xl border-[#E3DED5] bg-white focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
            {...register("email")}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-[#D2AD70] px-7 text-base font-black text-[#333230] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "در حال ارسال..." : "ارسال کد بازیابی"}
          </button>
        </form>
        <Link href="/login" className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-5 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]">بازگشت به ورود</Link>
      </section>
    </main>
  );
}
