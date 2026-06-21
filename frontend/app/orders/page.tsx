"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { getOrders, type Order } from "@/lib/checkout-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getOrders();
        if (isMounted) setOrders(data);
      } catch (ordersError) {
        if (isMounted) setError(getApiErrorMessage(ordersError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[var(--secondary)]">پیگیری سفارش</p>
          <h1 className="mt-3 text-3xl font-black text-[var(--dark)] sm:text-5xl">
            سفارش‌های شما
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {isLoading ? (
          <OrdersSkeleton />
        ) : error ? (
          <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
            <p className="font-black">خطا در دریافت سفارش‌ها</p>
            <p className="mt-2 text-sm font-bold">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <h2 className="text-xl font-black text-[var(--dark)]">هنوز سفارشی ثبت نشده</h2>
            <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
              بعد از ثبت سفارش، وضعیت و جزئیات آن از همین صفحه قابل پیگیری است.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--secondary)] px-6 text-sm font-black text-white transition hover:opacity-90"
            >
              مشاهده محصولات
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-xl font-black text-[var(--dark)] transition hover:text-[var(--primary)]"
                    >
                      {order.order_number}
                    </Link>
                    <p className="mt-2 text-sm font-bold text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={order.status_label} tone="order" />
                    <StatusBadge label={order.payment?.status_label || "بدون پرداخت"} tone="payment" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-3">
                  <SummaryPill label="روش پرداخت" value={order.payment?.method_label || "-"} />
                  <SummaryPill label="روش تحویل" value={order.delivery_method_label} />
                  <SummaryPill label="مبلغ نهایی" value={`${formatPrice(order.total_amount)} تومان`} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "order" | "payment" }) {
  const classes =
    tone === "order"
      ? "border-sky-100 bg-sky-50 text-[var(--secondary)]"
      : "border-yellow-200 bg-yellow-50 text-yellow-800";

  return (
    <span className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-black ${classes}`}>
      {label}
    </span>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="h-7 w-48 animate-pulse rounded bg-gray-100" />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
