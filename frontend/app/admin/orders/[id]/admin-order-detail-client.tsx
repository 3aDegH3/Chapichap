"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import {
  AdminOrderInternalNote,
  AdminOrderDetail,
  AdminCustomerFile,
  createAdminOrderInternalNote,
  deleteAdminOrderInternalNote,
  getAdminOrder,
  getAdminCustomerFileBlob,
  getAdminOrderInternalNotes,
  updateAdminOrderInternalNote,
  updateAdminOrderShipping,
  updateAdminOrderStatus,
} from "@/lib/admin-api";

const orderStatusOptions = [
  { value: "REGISTERED", label: "ثبت‌شده" },
  { value: "REVIEWING", label: "در حال بررسی" },
  { value: "WAITING_DESIGN_APPROVAL", label: "در انتظار تأیید طرح" },
  { value: "READY_FOR_PRINT", label: "آماده چاپ" },
  { value: "PRINTING", label: "در حال چاپ" },
  { value: "READY_TO_SHIP", label: "آماده ارسال" },
  { value: "SHIPPED", label: "ارسال‌شده" },
  { value: "DELIVERED", label: "تحویل‌شده" },
  { value: "CANCELLED", label: "لغوشده" },
];

const deliveryMethodOptions = [
  { value: "SHIPPING", label: "ارسال به آدرس" },
  { value: "PICKUP", label: "تحویل حضوری" },
] as const;

const currencyFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateTimeFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const inputClass =
  "min-h-11 rounded-md border border-[#D5DAE1] bg-white px-3 py-2 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function formatCurrency(value: string) {
  return `${currencyFormatter.format(Number(value))} تومان`;
}

function formatDate(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatFileSize(size: number) {
  if (size < 1024) return `${numberFormatter.format(size)} بایت`;
  if (size < 1024 * 1024) return `${numberFormatter.format(Math.round(size / 1024))} کیلوبایت`;
  return `${numberFormatter.format(Math.round((size / 1024 / 1024) * 10) / 10)} مگابایت`;
}

async function openOrderFile(file: AdminCustomerFile, mode: "preview" | "download") {
  const response = await getAdminCustomerFileBlob(file, mode);
  const blobUrl = window.URL.createObjectURL(response.data);
  if (mode === "preview") {
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    return;
  }
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
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

function getOrderTone(status: string) {
  if (["REGISTERED", "REVIEWING", "WAITING_DESIGN_APPROVAL"].includes(status)) return "warning" as const;
  if (["READY_FOR_PRINT", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(status)) return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  return "neutral" as const;
}

function getPaymentTone(status?: string | null) {
  if (status === "successful") return "success" as const;
  if (status === "pending") return "warning" as const;
  if (status === "failed" || status === "canceled" || status === "expired") return "danger" as const;
  return "neutral" as const;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md bg-[#F8FAFC] px-4 py-3">
      <p className="text-xs font-black text-[#697586]">{label}</p>
      <div className="mt-1 text-sm font-black text-[#1F2933]">{value || "-"}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
      <h3 className="text-lg font-black text-[#1F2933]">{title}</h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function OrderItems({ order }: { order: AdminOrderDetail }) {
  if (order.items.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[#D5DAE1] bg-[#F8FAFC] p-6 text-center text-sm font-bold text-[#697586]">
        قلمی برای این سفارش ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#E3E8EF]">
      {order.items.map((item) => (
        <div key={item.id} className="grid gap-4 border-b border-[#E3E8EF] p-4 last:border-b-0 lg:grid-cols-[1fr_auto]">
          <div className="flex min-w-0 gap-3">
            {item.product_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.product_image_url} alt={item.product_title} className="h-16 w-16 rounded-md border border-[#D5DAE1] object-cover" />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-[#D5DAE1] bg-[#F8FAFC] text-xs font-black text-[#697586]">
                بدون
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-black text-[#1F2933]">{item.product_title}</p>
              <p className="mt-2 text-sm font-bold text-[#697586]">
                {numberFormatter.format(item.quantity)} عدد · قیمت واحد {formatCurrency(item.unit_price)}
              </p>
              {Object.keys(item.selected_options || {}).length > 0 && (
                <p className="mt-2 text-xs font-bold text-[#697586]">
                  {JSON.stringify(item.selected_options)}
                </p>
              )}
            </div>
          </div>
          <p className="text-sm font-black text-[#1F2933] lg:text-left">{formatCurrency(item.line_total)}</p>
        </div>
      ))}
    </div>
  );
}

function InternalNotesPanel({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const notesQuery = useQuery({
    queryKey: ["admin-order-notes", orderId],
    queryFn: async () => {
      const response = await getAdminOrderInternalNotes(orderId);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (text: string) => createAdminOrderInternalNote(orderId, text),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-order-notes", orderId] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, text }: { noteId: number; text: string }) =>
      updateAdminOrderInternalNote(orderId, noteId, text),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-order-notes", orderId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: number) => deleteAdminOrderInternalNote(orderId, noteId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-order-notes", orderId] });
    },
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const text = String(formData.get("text") || "").trim();
    if (!text) return;
    createMutation.mutate(text, {
      onSuccess: () => form.reset(),
    });
  }

  function handleUpdate(event: FormEvent<HTMLFormElement>, note: AdminOrderInternalNote) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const text = String(formData.get("text") || "").trim();
    if (!text || text === note.text) return;
    updateMutation.mutate({ noteId: note.id, text });
  }

  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error;

  return (
    <Panel title="یادداشت داخلی">
      <form onSubmit={handleCreate} className="space-y-3">
        <textarea
          name="text"
          className={`${inputClass} min-h-24 w-full`}
          placeholder="یادداشت فقط برای مدیران قابل مشاهده است"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827] disabled:opacity-60"
        >
          {createMutation.isPending ? "در حال ثبت" : "ثبت یادداشت"}
        </button>
      </form>

      {mutationError && (
        <p className="mt-4 rounded-md border border-[#F3B1A6] bg-[#FEF3F2] p-3 text-sm font-bold text-[#B42318]">
          {getApiErrorMessage(mutationError)}
        </p>
      )}

      {notesQuery.isLoading ? (
        <div className="mt-4 h-28 animate-pulse rounded-md bg-[#F8FAFC]" />
      ) : notesQuery.isError ? (
        <p className="mt-4 rounded-md border border-[#F3B1A6] bg-[#FEF3F2] p-3 text-sm font-bold text-[#B42318]">
          {getApiErrorMessage(notesQuery.error)}
        </p>
      ) : notesQuery.data?.length ? (
        <div className="mt-5 space-y-3">
          {notesQuery.data.map((note) => (
            <article key={note.id} className="rounded-md border border-[#E3E8EF] p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#1F2933]">{note.author_label}</p>
                  <p className="mt-1 text-xs font-bold text-[#697586]">
                    {formatDate(note.created_at)}
                    {note.updated_at !== note.created_at ? " · ویرایش‌شده" : ""}
                  </p>
                </div>
                {note.can_edit && (
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (window.confirm("این یادداشت داخلی حذف شود؟")) {
                        deleteMutation.mutate(note.id);
                      }
                    }}
                    className="rounded-md border border-[#F3B1A6] px-2.5 py-1 text-xs font-black text-[#B42318] transition hover:bg-[#FEF3F2] disabled:opacity-50"
                  >
                    حذف
                  </button>
                )}
              </div>

              {note.can_edit ? (
                <form onSubmit={(event) => handleUpdate(event, note)} className="mt-3 space-y-2">
                  <textarea
                    name="text"
                    defaultValue={note.text}
                    className={`${inputClass} min-h-24 w-full`}
                  />
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4] disabled:opacity-60"
                  >
                    ذخیره ویرایش
                  </button>
                </form>
              ) : (
                <p className="mt-3 whitespace-pre-line text-sm font-bold leading-7 text-[#364152]">
                  {note.text}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-[#D5DAE1] bg-[#F8FAFC] p-5 text-center text-sm font-bold text-[#697586]">
          هنوز یادداشت داخلی ثبت نشده است.
        </p>
      )}
    </Panel>
  );
}

export default function AdminOrderDetailClient({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const [fileError, setFileError] = useState<string | null>(null);

  const orderQuery = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      const response = await getAdminOrder(orderId);
      return response.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: (payload: { status: string; note?: string; visible_to_customer?: boolean }) =>
      updateAdminOrderStatus(orderId, payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(["admin-order", orderId], response.data.data.order);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const shippingMutation = useMutation({
    mutationFn: (payload: {
      delivery_method?: "SHIPPING" | "PICKUP";
      shipping_provider?: string;
      shipping_tracking_code?: string;
    }) => updateAdminOrderShipping(orderId, payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(["admin-order", orderId], response.data.data.order);
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  function handleStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    statusMutation.mutate({
      status: String(formData.get("status") || ""),
      note: String(formData.get("note") || ""),
      visible_to_customer: true,
    });
  }

  function handleShippingSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    shippingMutation.mutate({
      delivery_method: String(formData.get("delivery_method") || "SHIPPING") as "SHIPPING" | "PICKUP",
      shipping_provider: String(formData.get("shipping_provider") || ""),
      shipping_tracking_code: String(formData.get("shipping_tracking_code") || ""),
    });
  }

  async function handleFileAction(file: AdminCustomerFile, mode: "preview" | "download") {
    try {
      setFileError(null);
      await openOrderFile(file, mode);
    } catch (error) {
      setFileError(getApiErrorMessage(error));
    }
  }

  if (orderQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-lg bg-white" />
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      </div>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
        <p className="text-sm font-black text-[#B42318]">خطا در دریافت سفارش</p>
        <p className="mt-2 text-sm font-medium text-[#697586]">
          {getApiErrorMessage(orderQuery.error)}
        </p>
      </section>
    );
  }

  const order = orderQuery.data;
  const mutationError = statusMutation.error || shippingMutation.error;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)] print:shadow-none">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-black text-[#A15C38]">جزئیات سفارش</p>
              <StatusBadge label={order.status_label} tone={getOrderTone(order.status)} />
            </div>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">{order.order_number}</h2>
            <p className="mt-2 text-sm font-bold text-[#697586]">ثبت شده در {formatDate(order.created_at)}</p>
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <Link href="/admin/orders" className="inline-flex h-10 items-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4]">
              بازگشت
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 items-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4]"
            >
              چاپ خلاصه
            </button>
            <button
              type="button"
              onClick={() => {
                statusMutation.mutate({
                  status: "CANCELLED",
                  note: "سفارش توسط مدیریت لغو شد.",
                  visible_to_customer: true,
                });
              }}
              disabled={statusMutation.isPending || order.status === "CANCELLED"}
              className="inline-flex h-10 items-center rounded-md border border-[#F3B1A6] bg-white px-4 text-sm font-black text-[#B42318] transition hover:bg-[#FEF3F2] disabled:opacity-50"
            >
              لغو سفارش
            </button>
          </div>
        </div>
      </section>

      {mutationError && (
        <div className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
          {getApiErrorMessage(mutationError)}
        </div>
      )}
      {fileError && (
        <div className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
          {fileError}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoRow label="مبلغ کالاها" value={formatCurrency(order.subtotal)} />
        <InfoRow label="هزینه ارسال" value={formatCurrency(order.shipping_cost)} />
        <InfoRow label="تخفیف" value={formatCurrency(order.discount_amount)} />
        <InfoRow label="مبلغ نهایی" value={formatCurrency(order.total_amount)} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Panel title="اطلاعات مشتری">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="نام و نام خانوادگی" value={order.receiver_name || order.customer_full_name} />
              <InfoRow label="شماره تماس" value={order.phone} />
              <InfoRow label="ایمیل" value={order.customer_email || "-"} />
              <InfoRow label="کد پستی" value={order.postal_code} />
              <InfoRow label="استان" value={order.province} />
              <InfoRow label="شهر" value={order.city} />
              <div className="md:col-span-2">
                <InfoRow label="آدرس کامل" value={order.address} />
              </div>
            </div>
          </Panel>

          <Panel title="اقلام سفارش">
            <OrderItems order={order} />
          </Panel>

          <Panel title="پرداخت">
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow
                label="وضعیت پرداخت"
                value={
                  <StatusBadge
                    label={order.payment?.status_label || "ثبت نشده"}
                    tone={getPaymentTone(order.payment?.status)}
                  />
                }
              />
              <InfoRow label="روش پرداخت" value={order.payment?.method_label || "-"} />
              <InfoRow label="کد پیگیری پرداخت" value={order.payment?.tracking_code || "-"} />
              <InfoRow label="شماره رسید" value={order.payment?.receipt_number || "-"} />
            </div>
          </Panel>

          <Panel title="فایل‌های مشتری">
            {order.customer_files.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#D5DAE1] bg-[#F8FAFC] p-6 text-center text-sm font-bold text-[#697586]">
                فایلی برای این سفارش ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-[#E3E8EF]">
                {order.customer_files.map((file) => (
                  <article key={`${file.source}-${file.id}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-[#1F2933]">{file.filename}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">{formatFileSize(file.file_size)}، {formatDate(file.created_at)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2 print:hidden">
                      {file.preview_url && <button type="button" onClick={() => void handleFileAction(file, "preview")} className="h-9 rounded-md border border-[#D5DAE1] px-3 text-xs font-black text-[#364152]">پیش‌نمایش</button>}
                      <button type="button" onClick={() => void handleFileAction(file, "download")} className="h-9 rounded-md bg-[#1F2933] px-3 text-xs font-black text-white">دانلود</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <aside className="space-y-5 print:hidden">
          <Panel title="تغییر وضعیت">
            <form key={`status-${order.status}-${order.status_history.length}`} onSubmit={handleStatusSubmit} className="space-y-3">
              <select name="status" defaultValue={order.status} className={inputClass}>
                {orderStatusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <textarea
                name="note"
                className={`${inputClass} min-h-24`}
                placeholder="یادداشت تغییر وضعیت"
              />
              <button
                type="submit"
                disabled={statusMutation.isPending}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827] disabled:opacity-60"
              >
                {statusMutation.isPending ? "در حال ذخیره" : "ثبت وضعیت"}
              </button>
            </form>
          </Panel>

          <Panel title="اطلاعات ارسال">
            <form
              key={`shipping-${order.delivery_method}-${order.shipping_provider}-${order.shipping_tracking_code}`}
              onSubmit={handleShippingSubmit}
              className="space-y-3"
            >
              <select name="delivery_method" defaultValue={order.delivery_method} className={inputClass}>
                {deliveryMethodOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <input
                name="shipping_provider"
                defaultValue={order.shipping_provider}
                className={inputClass}
                placeholder="روش یا شرکت ارسال"
              />
              <input
                name="shipping_tracking_code"
                defaultValue={order.shipping_tracking_code}
                className={inputClass}
                placeholder="کد رهگیری ارسال"
              />
              <button
                type="submit"
                disabled={shippingMutation.isPending}
                className="inline-flex h-10 w-full items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827] disabled:opacity-60"
              >
                {shippingMutation.isPending ? "در حال ذخیره" : "ذخیره ارسال"}
              </button>
            </form>
          </Panel>

          <Panel title="یادداشت مشتری">
            {order.notes ? (
              <p className="whitespace-pre-line text-sm font-bold leading-7 text-[#364152]">{order.notes}</p>
            ) : (
              <p className="text-sm font-bold text-[#697586]">یادداشتی ثبت نشده است.</p>
            )}
          </Panel>

          <InternalNotesPanel orderId={order.id} />

          <Panel title="تاریخچه وضعیت">
            {order.status_history.length === 0 ? (
              <p className="text-sm font-bold text-[#697586]">تاریخچه‌ای ثبت نشده است.</p>
            ) : (
              <div className="space-y-3">
                {order.status_history.map((item) => (
                  <div key={item.id} className="rounded-md border border-[#E3E8EF] p-3">
                    <p className="font-black text-[#1F2933]">{item.new_status_label}</p>
                    <p className="mt-1 text-xs font-bold text-[#697586]">
                      {formatDate(item.created_at)} · {item.created_by_label}
                    </p>
                    {item.description && (
                      <p className="mt-2 text-sm font-bold leading-7 text-[#364152]">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </div>
  );
}
