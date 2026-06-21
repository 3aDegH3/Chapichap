"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api";
import { resetPassword } from "@/lib/auth-api";

const schema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید."),
  code: z.string().trim().length(6, "کد بازیابی ۶ رقمی است."),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد."),
});
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", code: "", password: "" },
  });

  useEffect(() => {
    const email = new URLSearchParams(window.location.search).get("email");
    if (email) setValue("email", email);
  }, [setValue]);

  async function submit(values: FormValues) {
    setError("");
    setMessage("");
    try {
      await resetPassword(values);
      setMessage("رمز عبور تغییر کرد. حالا می‌توانید وارد شوید.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
      <section className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-black text-[var(--secondary)]">رمز جدید</p>
        <h1 className="mt-3 text-3xl font-black text-[var(--dark)]">تنظیم رمز عبور</h1>
        {message && <Alert variant="success" className="mt-6">{message}</Alert>}
        {error && <Alert variant="error" className="mt-6">{error}</Alert>}
        <form onSubmit={handleSubmit(submit)} className="mt-8 space-y-5">
          <Input id="email" label="ایمیل" type="email" error={errors.email?.message} {...register("email")} />
          <Input id="code" label="کد بازیابی" inputMode="numeric" error={errors.code?.message} {...register("code")} />
          <Input id="password" label="رمز عبور جدید" type="password" error={errors.password?.message} {...register("password")} />
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>ذخیره رمز جدید</Button>
        </form>
        <Link href="/login" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-[var(--dark)]">ورود به حساب</Link>
      </section>
    </main>
  );
}
