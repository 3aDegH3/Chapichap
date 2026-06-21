"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/api";
import { getTickets, type SupportTicket } from "@/lib/account-api";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadTickets() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getTickets();
        if (mounted) setTickets(data.tickets);
      } catch (loadError) {
        if (mounted) setError(getApiErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadTickets();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (error) return <Alert variant="error">{error}</Alert>;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--dark)]">پشتیبانی</h2>
          <p className="mt-2 text-sm font-bold text-gray-500">پیگیری سفارش، پرداخت، فایل طراحی و موارد مرتبط</p>
        </div>
        <Link
          href="/account/tickets/new"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--secondary)] px-6 text-sm font-black text-white"
        >
          تیکت جدید
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <h3 className="text-xl font-black text-[var(--dark)]">تیکتی ثبت نشده</h3>
          <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
            پیام‌های پشتیبانی بعد از ثبت در این بخش قابل پیگیری هستند.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <Link
                    href={`/account/tickets/${ticket.id}`}
                    className="text-xl font-black text-[var(--dark)] hover:text-[var(--primary)]"
                  >
                    {ticket.subject}
                  </Link>
                  <p className="mt-2 text-sm font-bold text-gray-500">{formatDate(ticket.updated_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={ticket.status_label} />
                  {ticket.unread_count > 0 && (
                    <span className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-black text-[var(--primary)]">
                      {ticket.unread_count.toLocaleString("fa-IR")} پیام جدید
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-3">
                <InfoPill label="دسته‌بندی" value={ticket.category_label} />
                <InfoPill label="اولویت" value={ticket.priority_label} />
                <InfoPill label="سفارش" value={ticket.order_number || "-"} />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ label }: { label: string }) {
  return <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-black text-[var(--secondary)]">{label}</span>;
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}
