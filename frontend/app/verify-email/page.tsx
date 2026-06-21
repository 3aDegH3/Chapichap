"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
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
    return <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12"><div className="mx-auto h-64 max-w-xl animate-pulse rounded-2xl bg-white" /></main>;
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black text-[var(--secondary)]">تایید ایمیل</p>
        <h1 className="mt-3 text-3xl font-black text-[var(--dark)]">کد تایید را وارد کنید</h1>
        <p className="mt-3 leading-7 text-gray-600">{user.email}</p>
        {user.email_verified ? (
          <Alert variant="success" className="mt-6">ایمیل شما تایید شده است.</Alert>
        ) : (
          <>
            {message && <Alert variant="success" className="mt-6">{message}</Alert>}
            {error && <Alert variant="error" className="mt-6">{error}</Alert>}
            <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
              <Input id="code" label="کد تایید" inputMode="numeric" placeholder="123456" error={errors.code?.message} {...register("code")} />
              <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>تایید ایمیل</Button>
            </form>
            <Button type="button" variant="outline" className="mt-3 w-full" isLoading={isSending} onClick={() => void resendCode()}>ارسال دوباره کد</Button>
          </>
        )}
        <Link href="/account" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--secondary)] px-5 text-sm font-black text-white">ورود به پنل حساب</Link>
      </section>
    </main>
  );
}
