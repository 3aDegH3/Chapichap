"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import {
  AdminDesignRequestDetail,
  AdminDesignRequestInternalNote,
  AdminDesignRequestStatus,
  createAdminDesignRequestInternalNote,
  deleteAdminDesignRequestInternalNote,
  getAdminDesignRequest,
  getAdminDesignRequestFileBlob,
  getAdminDesignRequestInternalNotes,
  linkAdminDesignRequestOrder,
  updateAdminDesignRequestInternalNote,
  updateAdminDesignRequestResponse,
  updateAdminDesignRequestStatus,
} from "@/lib/admin-api";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const designStatusOptions: Array<{ value: AdminDesignRequestStatus; label: string }> = [
  { value: "received", label: "جدید" },
  { value: "reviewing", label: "در حال بررسی" },
  { value: "needs_info", label: "نیازمند اطلاعات بیشتر" },
  { value: "designing", label: "در حال طراحی" },
  { value: "ready_for_approval", label: "آماده تأیید" },
  { value: "approved", label: "تأییدشده" },
  { value: "rejected", label: "ردشده" },
  { value: "closed", label: "بسته‌شده" },
];

const inputClass =
  "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";
const textAreaClass =
  "min-h-28 rounded-md border border-[#D5DAE1] bg-white px-3 py-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function formatDate(value?: string | null) {
  if (!value) return "-";
  return dateFormatter.format(new Date(value));
}

function formatFileSize(size: number) {
  if (size < 1024) return `${numberFormatter.format(size)} بایت`;
  if (size < 1024 * 1024) return `${numberFormatter.format(Math.round(size / 1024))} کیلوبایت`;
  return `${numberFormatter.format(Math.round((size / (1024 * 1024)) * 10) / 10)} مگابایت`;
}

function getStatusTone(status: string) {
  if (["received", "reviewing", "needs_info"].includes(status)) return "warning" as const;
  if (["ready_for_approval", "approved"].includes(status)) return "success" as const;
  if (status === "rejected") return "danger" as const;
  return "neutral" as const;
}

function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "warning" | "success" | "danger" }) {
  const className =
    tone === "warning"
      ? "bg-[#FFFBEB] text-[#92400E]"
      : tone === "success"
        ? "bg-[#ECFDF3] text-[#027A48]"
        : tone === "danger"
          ? "bg-[#FEF3F2] text-[#B42318]"
          : "bg-[#EEF1F4] text-[#364152]";

  return <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
      <h3 className="text-base font-black text-[#1F2933]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[#F8FAFC] px-3 py-3">
      <p className="text-xs font-black text-[#697586]">{label}</p>
      <div className="mt-1 text-sm font-bold text-[#1F2933]">{value || "-"}</div>
    </div>
  );
}

async function openDesignFile(fileId: number, filename: string, mode: "preview" | "download") {
  const response = await getAdminDesignRequestFileBlob(fileId, mode);
  const blobUrl = window.URL.createObjectURL(response.data);

  if (mode === "preview") {
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    return;
  }

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

function Header({ item }: { item: AdminDesignRequestDetail }) {
  return (
    <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link href="/admin/design-requests" className="text-sm font-black text-[#A15C38] underline-offset-4 hover:underline">
            بازگشت به درخواست‌ها
          </Link>
          <h2 className="mt-2 text-2xl font-black text-[#1F2933]">{item.request_number}</h2>
          <p className="mt-2 text-sm font-bold text-[#697586]">
            {item.customer_name}، {item.order_type_label}
          </p>
        </div>
        <StatusBadge label={item.status_label} tone={getStatusTone(item.status)} />
      </div>
    </section>
  );
}

export default function AdminDesignRequestDetailClient({ designRequestId }: { designRequestId: number }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AdminDesignRequestStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [adminResponse, setAdminResponse] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["admin-design-request", designRequestId],
    queryFn: async () => {
      const response = await getAdminDesignRequest(designRequestId);
      return response.data;
    },
  });

  const notesQuery = useQuery({
    queryKey: ["admin-design-request-notes", designRequestId],
    queryFn: async () => {
      const response = await getAdminDesignRequestInternalNotes(designRequestId);
      return response.data;
    },
  });
  const item = detailQuery.data;

  async function refreshDetail() {
    await queryClient.invalidateQueries({ queryKey: ["admin-design-request", designRequestId] });
    await queryClient.invalidateQueries({ queryKey: ["admin-design-requests"] });
  }

  const statusMutation = useMutation({
    mutationFn: () => updateAdminDesignRequestStatus(designRequestId, { status: status || item?.status || "received", note: statusNote }),
    onSuccess: async () => {
      setStatus(null);
      setStatusNote("");
      setError(null);
      await refreshDetail();
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const responseMutation = useMutation({
    mutationFn: () => updateAdminDesignRequestResponse(designRequestId, adminResponse ?? item?.admin_response ?? ""),
    onSuccess: async () => {
      setAdminResponse(null);
      setError(null);
      await refreshDetail();
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const orderMutation = useMutation({
    mutationFn: () => linkAdminDesignRequestOrder(designRequestId, orderId ? Number(orderId) : null),
    onSuccess: async () => {
      setOrderId(null);
      setError(null);
      await refreshDetail();
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const createNoteMutation = useMutation({
    mutationFn: () => createAdminDesignRequestInternalNote(designRequestId, noteText),
    onSuccess: async () => {
      setNoteText("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-design-request-notes", designRequestId] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, text }: { noteId: number; text: string }) =>
      updateAdminDesignRequestInternalNote(designRequestId, noteId, text),
    onSuccess: async () => {
      setEditingNoteId(null);
      setEditingNoteText("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-design-request-notes", designRequestId] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => deleteAdminDesignRequestInternalNote(designRequestId, noteId),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-design-request-notes", designRequestId] });
    },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  function submitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    statusMutation.mutate();
  }

  function submitResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    responseMutation.mutate();
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    orderMutation.mutate();
  }

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!noteText.trim()) return;
    createNoteMutation.mutate();
  }

  async function handleFileAction(mode: "preview" | "download") {
    const file = detailQuery.data?.uploaded_file;
    if (!file) return;
    try {
      setError(null);
      await openDesignFile(file.id, file.original_name, mode);
    } catch (fileError) {
      setError(getApiErrorMessage(fileError));
    }
  }

  if (detailQuery.isLoading) {
    return <div className="h-[520px] animate-pulse rounded-lg bg-white" />;
  }

  if (detailQuery.isError || !item) {
    return (
      <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
        <p className="text-sm font-black text-[#B42318]">خطا در دریافت درخواست طراحی</p>
        <p className="mt-2 text-sm font-medium text-[#697586]">{getApiErrorMessage(detailQuery.error)}</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <Header item={item} />

      {error && (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
          {error}
        </section>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <Panel title="اطلاعات مشتری و درخواست">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="نام مشتری" value={item.contact_name} />
              <InfoRow label="شماره تماس" value={item.contact_phone} />
              <InfoRow label="ایمیل" value={item.contact_email || item.user_email || "-"} />
              <InfoRow label="نوع درخواست" value={item.order_type_label} />
              <InfoRow label="محصول موردنظر" value={item.product_title || "-"} />
              <InfoRow label="زمان ثبت" value={formatDate(item.created_at)} />
            </div>
            <div className="mt-3 rounded-md bg-[#F8FAFC] px-3 py-3">
              <p className="text-xs font-black text-[#697586]">توضیح درخواست</p>
              <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-7 text-[#1F2933]">{item.description}</p>
            </div>
          </Panel>

          <Panel title="فایل‌های مرجع">
            {item.uploaded_file ? (
              <div className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-black text-[#1F2933]">{item.uploaded_file.original_name}</p>
                    <p className="mt-1 text-xs font-bold text-[#697586]">
                      {item.uploaded_file.content_type || "-"}، {formatFileSize(item.uploaded_file.size)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.uploaded_file.preview_url && (
                      <button
                        type="button"
                        onClick={() => void handleFileAction("preview")}
                        className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152]"
                      >
                        پیش‌نمایش
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleFileAction("download")}
                      className="inline-flex h-9 items-center rounded-md bg-[#1F2933] px-3 text-xs font-black text-white"
                    >
                      دانلود
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-[#697586]">فایلی برای این درخواست ثبت نشده است.</p>
            )}
          </Panel>

          <Panel title="تاریخچه وضعیت">
            {item.status_history.length === 0 ? (
              <p className="text-sm font-bold text-[#697586]">تاریخچه‌ای ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {item.status_history.map((history) => (
                  <div key={history.id} className="rounded-lg border border-[#E3E8EF] p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="text-sm font-black text-[#1F2933]">
                        {history.previous_status_label || "شروع"} به {history.new_status_label}
                      </p>
                      <p className="text-xs font-bold text-[#697586]">{formatDate(history.created_at)}</p>
                    </div>
                    {history.note && <p className="mt-2 text-sm font-bold text-[#364152]">{history.note}</p>}
                    <p className="mt-2 text-xs font-bold text-[#697586]">{history.created_by_label || "مدیر"}</p>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="یادداشت داخلی">
            <form onSubmit={submitNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                className={textAreaClass}
                placeholder="یادداشت داخلی برای تیم"
              />
              <button
                type="submit"
                disabled={createNoteMutation.isPending || !noteText.trim()}
                className="inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60"
              >
                ثبت یادداشت
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {notesQuery.data?.map((note: AdminDesignRequestInternalNote) => (
                <article key={note.id} className="rounded-lg border border-[#E3E8EF] p-4">
                  {editingNoteId === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editingNoteText}
                        onChange={(event) => setEditingNoteText(event.target.value)}
                        className={textAreaClass}
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateNoteMutation.mutate({ noteId: note.id, text: editingNoteText })}
                          className="inline-flex h-9 items-center rounded-md bg-[#1F2933] px-3 text-xs font-black text-white"
                        >
                          ذخیره
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteText("");
                          }}
                          className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152]"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm font-bold leading-7 text-[#1F2933]">{note.text}</p>
                      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs font-bold text-[#697586]">
                          {note.author_label}، {formatDate(note.created_at)}
                        </p>
                        {note.can_edit && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteId(note.id);
                                setEditingNoteText(note.text);
                              }}
                              className="text-xs font-black text-[#364152] underline-offset-4 hover:underline"
                            >
                              ویرایش
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteNoteMutation.mutate(note.id)}
                              className="text-xs font-black text-[#B42318] underline-offset-4 hover:underline"
                            >
                              حذف
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </article>
              ))}
              {notesQuery.data?.length === 0 && (
                <p className="text-sm font-bold text-[#697586]">یادداشتی ثبت نشده است.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="تغییر وضعیت">
            <form onSubmit={submitStatus} className="space-y-3">
              <select value={status ?? item.status} onChange={(event) => setStatus(event.target.value as AdminDesignRequestStatus)} className={inputClass}>
                {designStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                className={textAreaClass}
                placeholder="یادداشت تغییر وضعیت"
              />
              <button
                type="submit"
                disabled={statusMutation.isPending}
                className="inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60"
              >
                ثبت وضعیت
              </button>
            </form>
          </Panel>

          <Panel title="پاسخ ادمین">
            <form onSubmit={submitResponse} className="space-y-3">
              <textarea
                value={adminResponse ?? item.admin_response ?? ""}
                onChange={(event) => setAdminResponse(event.target.value)}
                className="min-h-40 rounded-md border border-[#D5DAE1] bg-white px-3 py-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20"
                placeholder="پاسخ قابل مشاهده برای مشتری"
              />
              <p className="text-xs font-bold text-[#697586]">آخرین ثبت: {formatDate(item.admin_response_at)}</p>
              <button
                type="submit"
                disabled={responseMutation.isPending}
                className="inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60"
              >
                ثبت پاسخ
              </button>
            </form>
          </Panel>

          <Panel title="اتصال به سفارش">
            <form onSubmit={submitOrder} className="space-y-3">
              <input
                type="number"
                value={orderId ?? (item.order ? String(item.order) : "")}
                onChange={(event) => setOrderId(event.target.value)}
                className={inputClass}
                placeholder="شناسه سفارش"
              />
              {item.order && (
                <Link href={`/admin/orders/${item.order}`} className="block text-sm font-black text-[#A15C38] underline-offset-4 hover:underline">
                  مشاهده سفارش {item.order_number}
                </Link>
              )}
              <button
                type="submit"
                disabled={orderMutation.isPending}
                className="inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60"
              >
                ذخیره ارتباط
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
