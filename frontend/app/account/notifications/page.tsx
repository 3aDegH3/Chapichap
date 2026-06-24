"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api";
import {
  getNotifications,
  readAllNotifications,
  readNotification,
  type NotificationItem,
} from "@/lib/account-api";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async function loadNotifications() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadNotifications]);

  async function markRead(id: number) {
    setError("");

    try {
      await readNotification(id);
      await loadNotifications();
    } catch (readError) {
      setError(getApiErrorMessage(readError));
    }
  }

  async function markAllRead() {
    setError("");

    try {
      await readAllNotifications();
      await loadNotifications();
    } catch (readError) {
      setError(getApiErrorMessage(readError));
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[#333230]">اعلان‌ها</h2>
          <p className="mt-2 text-sm font-bold text-[#77736D]">رویدادهای حساب، سفارش و پشتیبانی</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void markAllRead()}>
          خواندن همه
        </Button>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] px-6 py-16 text-center">
          <h3 className="text-xl font-black text-[#333230]">اعلانی وجود ندارد</h3>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#77736D]">
            اعلان‌های مهم حساب کاربری در این بخش نمایش داده می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-5 shadow-sm ${
                notification.is_read ? "border-[#E3DED5] bg-white" : "border-[#D2AD70]/45 bg-[#F6F1E8]"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-black text-[#333230]">{notification.title}</h3>
                  <p className="mt-2 text-sm font-bold leading-7 text-[#77736D]">{notification.message}</p>
                  <p className="mt-2 text-xs font-bold text-[#77736D]">{formatDate(notification.created_at)}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-4 text-xs font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#FAFAF8]"
                    >
                      مشاهده
                    </Link>
                  )}
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => void markRead(notification.id)}
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-[#D2AD70] px-4 text-xs font-black text-[#333230]"
                    >
                      خواندم
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
