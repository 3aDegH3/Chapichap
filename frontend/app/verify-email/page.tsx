"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { requestEmailCode, verifyEmailCode } from "@/lib/auth-api";

const schema = z.object({ code: z.string().trim().length(6, "کد تایید ۶ رقمی است.") });
type FormValues = z.infer<typeof schema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login?next=/verify-email");
  }, [isAuthenticated, isLoading, router]);

  async function submit(values: FormValues) {
    setError("");
    setMessage("");
    try {
      await verifyEmailCode(values.code);
      await refreshUser();
      setMessage("ایمیل با موفقیت تایید شد.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");
    setIsSending(true);
    try {
      await requestEmailCode();
      setMessage("کد تایید جدید ارسال شد.");
    } catch (sendError) {
      setError(getApiErrorMessage(sendError));
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="bg-[#F2EEE6] px-4 py-10 sm:py-14">
        <div className="mx-auto h-72 max-w-xl animate-pulse rounded-2xl border border-[#D8CFC0] bg-[#FAFAF8]" />
      </main>
    );
  }

  return (
    <main className="bg-[#F2EEE6] px-4 py-10 sm:py-14">
      <section className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#D8CFC0] bg-[#FAFAF8] p-6 shadow-[0_24px_70px_-42px_rgba(51,50,48,0.65)] sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#D2AD70]/60 bg-white">
            <Image src="/brand/logo.png" alt="لوگوی چاپی چاپ" width={128} height={128} className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-black text-[#B2894C]">تایید ایمیل</p>
            <h1 className="mt-1 text-2xl font-black text-[#333230]">کد تایید را وارد کنید</h1>
          </div>
        </div>
        <p className="mt-5 rounded-xl border border-[#E3DED5] bg-white px-4 py-3 text-sm font-black text-[#333230]">{user.email}</p>
        {user.email_verified ? (
          <Alert variant="success" className="mt-6">ایمیل شما تایید شده است.</Alert>
        ) : (
          <>
            {message && <Alert variant="success" className="mt-6">{message}</Alert>}
            {error && <Alert variant="error" className="mt-6">{error}</Alert>}
            <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
              <Input
                id="code"
                label="کد تایید"
                inputMode="numeric"
                placeholder="123456"
                error={errors.code?.message}
                className="rounded-xl border-[#E3DED5] bg-white tracking-[0.35em] focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
                {...register("code")}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-[#D2AD70] px-7 text-base font-black text-[#333230] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "در حال تایید..." : "تایید ایمیل"}
              </button>
            </form>
            <button
              type="button"
              disabled={isSending}
              onClick={() => void resendCode()}
              className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-5 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? "در حال ارسال..." : "ارسال دوباره کد"}
            </button>
          </>
        )}
        <Link href="/account" className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-5 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]">ورود به پنل حساب</Link>
      </section>
    </main>
  );
}
