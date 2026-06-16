"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="h-48 animate-pulse rounded-[2rem] bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Badge variant="soft">حساب کاربری</Badge>

          <h1 className="mt-4 text-3xl font-black text-[var(--dark)]">
            پروفایل من
          </h1>

          <p className="mt-3 leading-7 text-gray-600">
            اطلاعات اولیه حساب کاربری شما در این بخش نمایش داده می‌شود.
          </p>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-[var(--dark)] p-8 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--primary)] text-2xl font-black">
                  {user.username?.charAt(0)?.toUpperCase() ||
                    user.email.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p className="text-xl font-black">
                    {user.username || "کاربر چاپینو"}
                  </p>
                  <p className="mt-1 text-sm text-white/60">{user.email}</p>
                </div>
              </div>

              <Button variant="primary" onClick={logout}>
                خروج از حساب
              </Button>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="rounded-3xl bg-gray-50 p-5">
              <p className="text-xs font-black text-gray-500">نام کاربری</p>
              <p className="mt-2 font-black text-[var(--dark)]">
                {user.username || "ثبت نشده"}
              </p>
            </div>

            <div className="rounded-3xl bg-gray-50 p-5">
              <p className="text-xs font-black text-gray-500">ایمیل</p>
              <p className="mt-2 font-black text-[var(--dark)]">{user.email}</p>
            </div>

            <div className="rounded-3xl bg-gray-50 p-5">
              <p className="text-xs font-black text-gray-500">شماره موبایل</p>
              <p className="mt-2 font-black text-[var(--dark)]">
                {user.phone_number || "ثبت نشده"}
              </p>
            </div>

            <div className="rounded-3xl bg-gray-50 p-5">
              <p className="text-xs font-black text-gray-500">تاریخ عضویت</p>
              <p className="mt-2 font-black text-[var(--dark)]">
                {new Intl.DateTimeFormat("fa-IR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(new Date(user.date_joined))}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}