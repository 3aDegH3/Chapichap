"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
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
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black text-[var(--secondary)]">بازیابی رمز</p>
        <h1 className="mt-3 text-3xl font-black text-[var(--dark)]">دریافت کد بازیابی</h1>
        {error && <Alert variant="error" className="mt-6">{error}</Alert>}
        <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
          <Input id="email" label="ایمیل" type="email" error={errors.email?.message} {...register("email")} />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>ارسال کد بازیابی</Button>
        </form>
        <Link href="/login" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-[var(--dark)]">بازگشت به ورود</Link>
      </section>
    </main>
  );
}
