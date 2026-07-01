"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api";
import {
  getNotifications,
  readAllNotifications,
  readNotification,
  type NotificationItem,
} from "@/lib/account-api";

type NotificationFilter = "all" | "unread";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const visibleNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter((notification) => !notification.is_read);
    }

    return notifications;
  }, [activeFilter, notifications]);

  const loadNotifications = useCallback(async function loadNotifications() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
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
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, is_read: true } : notification
        )
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      await readNotification(id);
      await loadNotifications();
    } catch (readError) {
      setError(getApiErrorMessage(readError));
    }
  }

  async function markAllRead() {
    setError("");

    try {
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
      setUnreadCount(0);
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
          <p className="mt-2 text-sm font-bold text-[#77736D]">
            {unreadCount > 0
              ? `${unreadCount.toLocaleString("fa-IR")} اعلان خوانده‌نشده`
            : "همه اعلان‌ها خوانده شده‌اند"}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="inline-grid h-11 grid-cols-2 overflow-hidden rounded-xl border border-[#E3DED5] bg-[#FAFAF8] p-1">
            <FilterButton
              label={`همه ${notifications.length.toLocaleString("fa-IR")}`}
              active={activeFilter === "all"}
              onClick={() => setActiveFilter("all")}
            />
            <FilterButton
              label={`خوانده‌نشده ${unreadCount.toLocaleString("fa-IR")}`}
              active={activeFilter === "unread"}
              onClick={() => setActiveFilter("unread")}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={() => void markAllRead()}
          >
            خواندن همه
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {visibleNotifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] px-6 py-16 text-center">
          <h3 className="text-xl font-black text-[#333230]">
            {activeFilter === "unread" ? "اعلان خوانده‌نشده‌ای نداری" : "اعلانی وجود ندارد"}
          </h3>
          <p className="mx-auto mt-3 max-w-md leading-7 text-[#77736D]">
            {activeFilter === "unread"
              ? "وقتی رویداد تازه‌ای برای سفارش، پرداخت یا پشتیبانی داشته باشی اینجا دیده می‌شود."
              : "اعلان‌های مهم حساب کاربری در این بخش نمایش داده می‌شوند."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleNotifications.map((notification) => (
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

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 text-xs font-black transition ${
        active
          ? "bg-white text-[#333230] shadow-[0_10px_22px_-18px_rgba(51,50,48,0.75)]"
          : "text-[#77736D] hover:text-[#333230]"
      }`}
    >
      {label}
    </button>
  );
}
