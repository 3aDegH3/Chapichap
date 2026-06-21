"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api";
import { closeTicket, getTicket, replyTicket, type SupportTicket } from "@/lib/account-api";

const schema = z.object({
  message: z.string().trim().min(2, "متن پیام را وارد کنید."),
});

type FormValues = z.infer<typeof schema>;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "" },
  });

  const loadTicket = useCallback(async function loadTicket() {
    if (!params.id) return;

    setIsLoading(true);
    setError("");

    try {
      const data = await getTicket(params.id);
      setTicket(data.ticket);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadTicket();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadTicket]);

  async function submit(values: FormValues) {
    setError("");
    setMessage("");

    try {
      const data = await replyTicket(params.id, { message: values.message, files });
      setTicket(data.ticket);
      setFiles([]);
      reset();
      setMessage("پیام ارسال شد.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  async function closeCurrentTicket() {
    setError("");
    setMessage("");

    try {
      await closeTicket(params.id);
      setMessage("تیکت بسته شد.");
      await loadTicket();
    } catch (closeError) {
      setError(getApiErrorMessage(closeError));
    }
  }

  if (isLoading) return <div className="h-[600px] animate-pulse rounded-2xl bg-white" />;

  if (error && !ticket) {
    return (
      <div className="space-y-5">
        <Alert variant="error">{error}</Alert>
        <Link href="/account/tickets" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--secondary)] px-6 text-sm font-black text-white">
          بازگشت به تیکت‌ها
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black text-[var(--secondary)]">تیکت #{ticket.id.toLocaleString("fa-IR")}</p>
            <h2 className="mt-2 text-2xl font-black text-[var(--dark)]">{ticket.subject}</h2>
            <p className="mt-2 text-sm font-bold text-gray-500">{formatDate(ticket.created_at)}</p>
          </div>
          <Link href="/account/tickets" className="text-sm font-black text-gray-500">
            بازگشت
          </Link>
        </div>

        {message && <Alert variant="success" className="mt-5">{message}</Alert>}
        {error && <Alert variant="error" className="mt-5">{error}</Alert>}

        <div className="mt-6 grid gap-4">
          {ticket.messages.map((item) => (
            <article
              key={item.id}
              className={`rounded-2xl p-4 ${
                item.is_staff_message ? "border border-sky-100 bg-sky-50" : "border border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-black text-[var(--dark)]">{item.sender_name}</p>
                <p className="text-xs font-bold text-gray-500">{formatDate(item.created_at)}</p>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm font-bold leading-7 text-gray-700">{item.message}</p>
              {item.attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-[var(--dark)]"
                    >
                      {attachment.filename}
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        {!isClosed && (
          <form onSubmit={handleSubmit(submit)} className="mt-6 border-t border-gray-100 pt-6">
            <label className="block">
              <span className="text-sm font-black text-[var(--dark)]">پاسخ جدید</span>
              <textarea
                rows={5}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium leading-7 outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-pink-100"
                {...register("message")}
              />
              {errors.message?.message && <span className="mt-2 block text-xs font-bold text-red-600">{errors.message.message}</span>}
            </label>

            <input
              type="file"
              multiple
              className="mt-4 block w-full text-sm font-bold text-gray-600"
              onChange={(event) => setFiles(Array.from(event.target.files || []))}
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button type="submit" isLoading={isSubmitting}>
                ارسال پاسخ
              </Button>
              <Button type="button" variant="outline" onClick={() => void closeCurrentTicket()}>
                بستن تیکت
              </Button>
            </div>
          </form>
        )}
      </section>

      <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
        <h2 className="text-xl font-black text-[var(--dark)]">مشخصات</h2>
        <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600">
          <InfoPill label="وضعیت" value={ticket.status_label} />
          <InfoPill label="دسته‌بندی" value={ticket.category_label} />
          <InfoPill label="اولویت" value={ticket.priority_label} />
          <InfoPill label="سفارش" value={ticket.order_number || "-"} />
          <InfoPill label="آخرین تغییر" value={formatDate(ticket.updated_at)} />
        </div>
      </aside>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}
