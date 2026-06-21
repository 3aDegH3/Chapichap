"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { getOrder, type Order } from "@/lib/checkout-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getOrder(params.id);
        if (isMounted) setOrder(data);
      } catch (orderError) {
        if (isMounted) setError(getApiErrorMessage(orderError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (params.id) void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (isLoading) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-10 w-72 animate-pulse rounded bg-gray-100" />
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-80 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black text-[var(--dark)]">سفارش پیدا نشد</h1>
          <p className="mt-4 leading-7 text-gray-600">{error || "به این سفارش دسترسی ندارید."}</p>
          <Link
            href="/orders"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--secondary)] px-6 text-sm font-black text-white"
          >
            بازگشت به سفارش‌ها
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[var(--secondary)]">جزئیات سفارش</p>
          <h1 className="mt-3 text-3xl font-black text-[var(--dark)] sm:text-5xl">
            {order.order_number}
          </h1>
          <p className="mt-4 text-sm font-bold text-gray-500">{formatDate(order.created_at)}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="space-y-6">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-[var(--dark)]">آیتم‌ها</h2>
            <div className="mt-5 grid gap-4">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-lg border border-gray-200 p-4 sm:grid-cols-[112px_1fr]"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-sky-50 via-white to-pink-50">
                    {item.product_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product_image_url}
                        alt={item.product_title}
                        className="h-full w-full object-cover"
                      />
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

          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-[var(--dark)]">اطلاعات گیرنده</h2>
            <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-2">
              <SummaryPill label="نام" value={order.receiver_name} />
              <SummaryPill label="شماره تماس" value={order.phone} />
              <SummaryPill label="استان" value={order.province} />
              <SummaryPill label="شهر" value={order.city} />
              <SummaryPill label="کد پستی" value={order.postal_code} />
              <SummaryPill label="روش تحویل" value={order.delivery_method_label} />
            </div>
            <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm font-bold leading-7 text-[var(--dark)]">
              {order.address}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-[var(--dark)]">وضعیت سفارش</h2>
          <div className="mt-5 grid gap-3">
            <StatusRow label="سفارش" value={order.status_label} tone="order" />
            <StatusRow label="پرداخت" value={order.payment?.status_label || "بدون پرداخت"} tone="payment" />
            <StatusRow label="روش پرداخت" value={order.payment?.method_label || "-"} tone="neutral" />
          </div>

          <div className="mt-5 space-y-3 border-t border-gray-100 pt-5 text-sm font-bold text-gray-600">
            <SummaryLine label="جمع کالاها" value={`${formatPrice(order.subtotal)} تومان`} />
            <SummaryLine label="هزینه ارسال" value={`${formatPrice(order.shipping_cost)} تومان`} />
            <SummaryLine label="مبلغ نهایی" value={`${formatPrice(order.total_amount)} تومان`} />
          </div>

          <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm font-bold leading-7 text-yellow-800">
            اگر پرداخت حضوری را انتخاب کرده‌اید، سفارش تا تأیید مجموعه در وضعیت در انتظار پرداخت باقی می‌ماند.
          </div>
        </aside>
      </section>
    </main>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "order" | "payment" | "neutral";
}) {
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
    <div className="rounded-lg bg-gray-50 px-4 py-3">
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
