"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/api";
import { getAccountOrder } from "@/lib/account-api";
import type { Order } from "@/lib/checkout-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOrder() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getAccountOrder(params.id);
        if (mounted) setOrder(data.order);
      } catch (orderError) {
        if (mounted) setError(getApiErrorMessage(orderError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    if (params.id) void loadOrder();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="h-[520px] animate-pulse rounded-2xl bg-white" />
        <div className="h-96 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-5">
        <Alert variant="error">{error || "سفارش پیدا نشد."}</Alert>
        <Link
          href="/account/orders"
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--secondary)] px-6 text-sm font-black text-white"
        >
          بازگشت به سفارش‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-[var(--secondary)]">جزئیات سفارش</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--dark)]">{order.order_number}</h2>
              <p className="mt-2 text-sm font-bold text-gray-500">{formatDate(order.created_at)}</p>
            </div>
            <Link
              href="/account/tickets/new"
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-gray-200 bg-white px-5 text-sm font-black text-[var(--dark)]"
            >
              ثبت تیکت
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[var(--dark)]">Timeline سفارش</h2>
          {order.status_history.length === 0 ? (
            <p className="mt-5 rounded-xl bg-gray-50 p-4 text-sm font-bold text-gray-600">
              هنوز رویدادی برای این سفارش ثبت نشده است.
            </p>
          ) : (
            <ol className="mt-5 grid gap-4">
              {order.status_history.map((item) => (
                <li key={item.id} className="grid grid-cols-[18px_1fr] gap-3">
                  <span className="mt-1 h-4 w-4 rounded-full border-4 border-sky-100 bg-[var(--secondary)]" />
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-black text-[var(--dark)]">{item.title || item.status_label}</p>
                      <p className="text-xs font-bold text-gray-500">{formatDate(item.created_at)}</p>
                    </div>
                    {item.description && (
                      <p className="mt-2 text-sm font-bold leading-7 text-gray-600">{item.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[var(--dark)]">آیتم‌ها</h2>
          <div className="mt-5 grid gap-4">
            {order.items.map((item) => (
              <article key={item.id} className="grid gap-4 rounded-xl border border-gray-200 p-4 sm:grid-cols-[112px_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 via-white to-pink-50">
                  {item.product_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product_image_url} alt={item.product_title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-black text-[var(--secondary)]">
                      چاپ
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-black text-[var(--dark)]">{item.product_title}</h3>
                  <div className="mt-4 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-3">
                    <SummaryPill label="تعداد" value={item.quantity.toLocaleString("fa-IR")} />
                    <SummaryPill label="قیمت واحد" value={`${formatPrice(item.unit_price)} تومان`} />
                    <SummaryPill label="جمع ردیف" value={`${formatPrice(item.line_total)} تومان`} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[var(--dark)]">اطلاعات گیرنده</h2>
          <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-2">
            <SummaryPill label="نام" value={order.receiver_name} />
            <SummaryPill label="شماره تماس" value={order.phone} />
            <SummaryPill label="استان" value={order.province} />
            <SummaryPill label="شهر" value={order.city} />
            <SummaryPill label="کد پستی" value={order.postal_code} />
            <SummaryPill label="روش تحویل" value={order.delivery_method_label} />
          </div>
          <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm font-bold leading-7 text-[var(--dark)]">
            {order.address}
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:sticky xl:top-28">
        <h2 className="text-xl font-black text-[var(--dark)]">خلاصه</h2>
        <div className="mt-5 grid gap-3">
          <StatusRow label="سفارش" value={order.status_label} tone="order" />
          <StatusRow label="پرداخت" value={order.payment?.status_label || "بدون پرداخت"} tone="payment" />
          <StatusRow label="روش پرداخت" value={order.payment?.method_label || "-"} tone="neutral" />
        </div>

        <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm font-bold text-gray-600">
          <SummaryLine label="جمع کالاها" value={`${formatPrice(order.subtotal)} تومان`} />
          <SummaryLine label="هزینه ارسال" value={`${formatPrice(order.shipping_cost)} تومان`} />
          {Number(order.discount_amount) > 0 && (
            <SummaryLine label="تخفیف" value={`${formatPrice(order.discount_amount)} تومان`} />
          )}
          <SummaryLine label="مبلغ نهایی" value={`${formatPrice(order.total_amount)} تومان`} />
        </div>

        {order.coupon_code && (
          <div className="mt-5 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-black text-yellow-900">
            کد استفاده‌شده: {order.coupon_code}
          </div>
        )}
      </aside>
    </div>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: "order" | "payment" | "neutral" }) {
  const colors = {
    order: "border-sky-100 bg-sky-50 text-[var(--secondary)]",
    payment: "border-yellow-200 bg-yellow-50 text-yellow-800",
    neutral: "border-gray-200 bg-gray-50 text-gray-700",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-bold text-gray-500">{label}</span>
      <span className={`rounded-full border px-3 py-1 text-xs font-black ${colors[tone]}`}>{value}</span>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span className="text-[var(--dark)]">{value}</span>
    </div>
  );
}
