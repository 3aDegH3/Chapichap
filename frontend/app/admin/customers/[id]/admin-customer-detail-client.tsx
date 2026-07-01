"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import { AdminCustomerFile, getAdminCustomer, getAdminCustomerFileBlob } from "@/lib/admin-api";

type CustomerTab = "profile" | "orders" | "design" | "interactions";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const moneyFormatter = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "-";
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]"><h3 className="text-base font-black text-[#1F2933]">{title}</h3><div className="mt-4">{children}</div></section>;
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return <div className="border-b border-[#E3E8EF] py-3 last:border-b-0"><p className="text-xs font-black text-[#697586]">{label}</p><div className="mt-1 text-sm font-bold text-[#1F2933]">{value || "-"}</div></div>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-[#D5DAE1] p-6 text-center text-sm font-bold text-[#697586]">{children}</p>;
}

function fileSize(size: number) {
  if (size < 1024) return `${numberFormatter.format(size)} بایت`;
  if (size < 1024 * 1024) return `${numberFormatter.format(Math.round(size / 1024))} کیلوبایت`;
  return `${numberFormatter.format(Math.round((size / 1024 / 1024) * 10) / 10)} مگابایت`;
}

async function openFile(file: AdminCustomerFile, mode: "preview" | "download") {
  const response = await getAdminCustomerFileBlob(file, mode);
  const url = window.URL.createObjectURL(response.data);
  if (mode === "preview") {
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function AdminCustomerDetailClient({ customerId }: { customerId: number }) {
  const [tab, setTab] = useState<CustomerTab>("profile");
  const [fileError, setFileError] = useState<string | null>(null);
  const customerQuery = useQuery({
    queryKey: ["admin-customer", customerId],
    queryFn: async () => (await getAdminCustomer(customerId)).data,
  });

  async function handleFile(file: AdminCustomerFile, mode: "preview" | "download") {
    try {
      setFileError(null);
      await openFile(file, mode);
    } catch (error) {
      setFileError(getApiErrorMessage(error));
    }
  }

  if (customerQuery.isLoading) return <div className="h-[560px] animate-pulse rounded-lg bg-white" />;
  if (customerQuery.isError || !customerQuery.data) return <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">{getApiErrorMessage(customerQuery.error)}</section>;

  const customer = customerQuery.data;
  const tabs: Array<{ value: CustomerTab; label: string; count?: number }> = [
    { value: "profile", label: "پروفایل و آدرس‌ها" },
    { value: "orders", label: "سفارش‌ها", count: customer.orders.length },
    { value: "design", label: "درخواست‌های طراحی", count: customer.design_requests.length },
    { value: "interactions", label: "پیام‌ها و فایل‌ها", count: customer.contact_messages.length + customer.files.length },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link href="/admin/customers" className="text-sm font-black text-[#A15C38] underline-offset-4 hover:underline">بازگشت به مشتریان</Link>
            <div className="mt-3 flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-md bg-[#1F2933] text-lg font-black text-white">{customer.full_name.slice(0, 1)}</span><div><h2 className="text-2xl font-black text-[#1F2933]">{customer.full_name}</h2><p className="mt-1 text-sm font-bold text-[#697586]">{customer.email}</p></div></div>
          </div>
          <span className={`inline-flex rounded-md px-3 py-1.5 text-xs font-black ${customer.account_status === "active" ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{customer.account_status_label}</span>
        </div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-[#E3E8EF] bg-[#E3E8EF] sm:grid-cols-3">
          <div className="bg-[#F8FAFC] p-4"><p className="text-xs font-black text-[#697586]">تعداد سفارش</p><p className="mt-2 text-xl font-black text-[#1F2933]">{numberFormatter.format(customer.order_count)}</p></div>
          <div className="bg-[#F8FAFC] p-4"><p className="text-xs font-black text-[#697586]">مجموع سفارش‌ها</p><p className="mt-2 text-xl font-black text-[#1F2933]">{moneyFormatter.format(Number(customer.total_order_amount))} تومان</p></div>
          <div className="bg-[#F8FAFC] p-4"><p className="text-xs font-black text-[#697586]">آخرین سفارش</p><p className="mt-2 text-sm font-black text-[#1F2933]">{formatDate(customer.last_order_at)}</p></div>
        </div>
      </section>

      <nav className="flex gap-1 overflow-x-auto rounded-lg border border-[#D5DAE1] bg-white p-1" aria-label="بخش‌های پرونده مشتری">
        {tabs.map((item) => <button key={item.value} type="button" onClick={() => setTab(item.value)} className={`h-10 shrink-0 rounded-md px-4 text-sm font-black transition ${tab === item.value ? "bg-[#1F2933] text-white" : "text-[#697586] hover:bg-[#EEF1F4]"}`}>{item.label}{typeof item.count === "number" ? ` (${numberFormatter.format(item.count)})` : ""}</button>)}
      </nav>

      {fileError && <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">{fileError}</section>}

      {tab === "profile" && (
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="اطلاعات پروفایل">
            <Info label="نام و نام خانوادگی" value={customer.full_name} />
            <Info label="شماره تماس" value={<span dir="ltr">{customer.phone_number || "-"}</span>} />
            <Info label="ایمیل" value={customer.email} />
            <Info label="تأیید شماره تماس" value={customer.phone_verified ? "تأییدشده" : "تأییدنشده"} />
            <Info label="تأیید ایمیل" value={customer.email_verified ? "تأییدشده" : "تأییدنشده"} />
            <Info label="تاریخ ثبت‌نام" value={formatDate(customer.date_joined)} />
            <Info label="آخرین ورود" value={formatDate(customer.last_login)} />
          </Panel>
          <Panel title="آدرس‌ها">
            {customer.addresses.length === 0 ? <EmptyState>آدرسی برای این مشتری ثبت نشده است.</EmptyState> : <div className="divide-y divide-[#E3E8EF]">{customer.addresses.map((address) => (
              <article key={address.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2"><h4 className="text-sm font-black text-[#1F2933]">{address.title}</h4>{address.is_default && <span className="rounded-md bg-[#ECFDF3] px-2 py-1 text-[11px] font-black text-[#027A48]">پیش‌فرض</span>}</div>
                <p className="mt-2 text-sm font-bold leading-7 text-[#364152]">{address.province}، {address.city}، {address.address}، پلاک {address.plaque || "-"}، واحد {address.unit || "-"}</p>
                <p className="mt-2 text-xs font-bold text-[#697586]">گیرنده: {address.receiver_name}، {address.phone}، کدپستی {address.postal_code}</p>
              </article>
            ))}</div>}
          </Panel>
        </div>
      )}

      {tab === "orders" && <Panel title="سفارش‌های قبلی">{customer.orders.length === 0 ? <EmptyState>سفارشی برای این مشتری ثبت نشده است.</EmptyState> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="text-right text-xs font-black text-[#697586]"><tr><th className="pb-3">شماره سفارش</th><th className="pb-3">گیرنده</th><th className="pb-3">مبلغ</th><th className="pb-3">وضعیت</th><th className="pb-3">تاریخ</th><th className="pb-3">عملیات</th></tr></thead><tbody>{customer.orders.map((order) => <tr key={order.id} className="border-t border-[#E3E8EF]"><td className="py-4 font-black text-[#1F2933]">{order.order_number}</td><td className="py-4 font-bold text-[#364152]">{order.receiver_name}</td><td className="py-4 font-black text-[#364152]">{moneyFormatter.format(Number(order.total_amount))} تومان</td><td className="py-4 font-bold text-[#364152]">{order.status_label}</td><td className="py-4 font-bold text-[#697586]">{formatDate(order.created_at)}</td><td className="py-4"><Link href={`/admin/orders/${order.id}`} className="text-xs font-black text-[#A15C38] underline-offset-4 hover:underline">جزئیات سفارش</Link></td></tr>)}</tbody></table></div>}</Panel>}

      {tab === "design" && <Panel title="درخواست‌های طراحی">{customer.design_requests.length === 0 ? <EmptyState>درخواست طراحی برای این مشتری ثبت نشده است.</EmptyState> : <div className="divide-y divide-[#E3E8EF]">{customer.design_requests.map((request) => <article key={request.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"><div><p className="font-black text-[#1F2933]">{request.request_number}، {request.order_type_label}</p><p className="mt-1 text-xs font-bold text-[#697586]">{request.status_label}، {formatDate(request.created_at)}</p></div><Link href={`/admin/design-requests/${request.id}`} className="text-xs font-black text-[#A15C38] underline-offset-4 hover:underline">مشاهده درخواست</Link></article>)}</div>}</Panel>}

      {tab === "interactions" && (
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="پیام‌های تماس">
            {customer.contact_messages.length === 0 ? <EmptyState>پیام تماسی با شماره این مشتری پیدا نشد.</EmptyState> : <div className="divide-y divide-[#E3E8EF]">{customer.contact_messages.map((message) => <article key={message.id} className="py-4 first:pt-0 last:pb-0"><div className="flex items-center justify-between gap-3"><p className="text-sm font-black text-[#1F2933]">{message.subject_label}</p><span className="text-xs font-bold text-[#697586]">{message.status_label}</span></div><p className="mt-2 line-clamp-2 text-sm font-bold leading-7 text-[#364152]">{message.message}</p><Link href={`/admin/contact-messages/${message.id}`} className="mt-2 inline-block text-xs font-black text-[#A15C38]">مشاهده پیام</Link></article>)}</div>}
          </Panel>
          <Panel title="فایل‌های ارسال‌شده">
            {customer.files.length === 0 ? <EmptyState>فایلی از این مشتری پیدا نشد.</EmptyState> : <div className="divide-y divide-[#E3E8EF]">{customer.files.map((file) => <article key={`${file.source}-${file.id}`} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-black text-[#1F2933]">{file.filename}</p><p className="mt-1 text-xs font-bold text-[#697586]">{fileSize(file.file_size)}، {formatDate(file.created_at)}</p></div><div className="flex gap-2">{file.preview_url && <button type="button" onClick={() => void handleFile(file, "preview")} className="h-9 rounded-md border border-[#D5DAE1] px-3 text-xs font-black text-[#364152]">پیش‌نمایش</button>}<button type="button" onClick={() => void handleFile(file, "download")} className="h-9 rounded-md bg-[#1F2933] px-3 text-xs font-black text-white">دانلود</button></div></article>)}</div>}
          </Panel>
        </div>
      )}
    </div>
  );
}
