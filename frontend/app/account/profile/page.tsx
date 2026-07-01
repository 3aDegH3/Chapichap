"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { updateAccountProfile } from "@/lib/account-api";

const schema = z.object({
  first_name: z.string().trim().min(2, "نام را وارد کنید."),
  last_name: z.string().trim().min(2, "نام خانوادگی را وارد کنید."),
  username: z.string().trim().optional(),
  phone_number: z.string().trim().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AccountProfilePage() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { first_name: "", last_name: "", username: "", phone_number: "" },
  });

  useEffect(() => {
    if (!user) return;
    reset({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      username: user.username || "",
      phone_number: user.phone_number || "",
    });
  }, [reset, user]);

  async function submit(values: FormValues) {
    setMessage("");
    setError("");
    try {
      await updateAccountProfile({
        ...values,
        username: values.username || null,
        phone_number: values.phone_number || null,
      });
      await refreshUser();
      setMessage("پروفایل به‌روزرسانی شد.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[var(--dark)]">اطلاعات پروفایل</h2>
        {message && <Alert variant="success" className="mt-5">{message}</Alert>}
        {error && <Alert variant="error" className="mt-5">{error}</Alert>}
        <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-5 sm:grid-cols-2">
          <Input id="first_name" label="نام" error={errors.first_name?.message} {...register("first_name")} />
          <Input id="last_name" label="نام خانوادگی" error={errors.last_name?.message} {...register("last_name")} />
          <Input id="username" label="نام کاربری" error={errors.username?.message} {...register("username")} />
          <Input id="phone_number" label="شماره موبایل" inputMode="tel" error={errors.phone_number?.message} {...register("phone_number")} />
          <div className="sm:col-span-2">
            <Button type="submit" isLoading={isSubmitting}>ذخیره تغییرات</Button>
          </div>
        </form>
      </section>

      <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[var(--dark)]">وضعیت حساب</h2>
        <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600">
          <InfoRow label="ایمیل" value={user?.email || "-"} />
          <InfoRow label="تایید ایمیل" value={user?.email_verified ? "تایید شده" : "نیازمند تایید"} />
          <InfoRow label="تایید موبایل" value={user?.phone_verified ? "تایید شده" : "ثبت نشده"} />
        </div>
        {!user?.email_verified && (
          <Link href="/verify-email" className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[var(--secondary)] px-5 text-sm font-black text-white">
            تایید ایمیل
          </Link>
        )}
      </aside>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}
