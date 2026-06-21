"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { changeAccountPassword } from "@/lib/account-api";

const schema = z.object({
  current_password: z.string().min(6, "رمز فعلی را وارد کنید."),
  new_password: z.string().min(6, "رمز جدید باید حداقل ۶ کاراکتر باشد."),
});

type FormValues = z.infer<typeof schema>;

export default function AccountSecurityPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: "", new_password: "" },
  });

  async function submit(values: FormValues) {
    setMessage("");
    setError("");
    try {
      await changeAccountPassword(values);
      reset();
      setMessage("رمز عبور تغییر کرد.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[var(--dark)]">تغییر رمز عبور</h2>
        {message && <Alert variant="success" className="mt-5">{message}</Alert>}
        {error && <Alert variant="error" className="mt-5">{error}</Alert>}
        <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-5">
          <Input id="current_password" label="رمز فعلی" type="password" error={errors.current_password?.message} {...register("current_password")} />
          <Input id="new_password" label="رمز جدید" type="password" error={errors.new_password?.message} {...register("new_password")} />
          <Button type="submit" isLoading={isSubmitting}>ذخیره رمز جدید</Button>
        </form>
      </section>

      <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[var(--dark)]">تاییدها</h2>
        <div className="mt-5 grid gap-3">
          <StatusRow label="ایمیل" active={Boolean(user?.email_verified)} />
          <StatusRow label="موبایل" active={Boolean(user?.phone_verified)} />
        </div>
        {!user?.email_verified && (
          <Link href="/verify-email" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--secondary)] px-5 text-sm font-black text-white">
            تایید ایمیل
          </Link>
        )}
        <Link href="/forgot-password" className="mt-3 inline-flex h-12 w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-[var(--dark)]">
          بازیابی رمز با ایمیل
        </Link>
      </aside>
    </div>
  );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold">
      <span className="text-gray-600">{label}</span>
      <span className={active ? "text-green-700" : "text-yellow-800"}>{active ? "تایید شده" : "نیازمند تایید"}</span>
    </div>
  );
}
