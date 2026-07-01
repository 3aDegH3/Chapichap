"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import OrderRoadmap from "@/components/account/OrderRoadmap";
import { getApiErrorMessage } from "@/lib/api";
import { getAccountOrders } from "@/lib/account-api";
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

function getOrderProductTitle(order: Order) {
  const titles = order.items
    .map((item) => item.product_title.trim())
    .filter(Boolean);

  if (titles.length === 0) return "محصول ثبت نشده";
  if (titles.length === 1) return titles[0];

  const visibleTitles = titles.slice(0, 2).join("، ");
  const hiddenCount = titles.length - 2;

  return hiddenCount > 0
    ? `${visibleTitles} و ${hiddenCount.toLocaleString("fa-IR")} محصول دیگر`
    : visibleTitles;
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const timeout = window.setTimeout(() => {
      async function loadOrders() {
        setIsLoading(true);
        setError("");

        try {
          const data = await getAccountOrders();
          if (mounted) setOrders(data.orders);
        } catch (ordersError) {
          if (mounted) setError(getApiErrorMessage(ordersError));
        } finally {
          if (mounted) setIsLoading(false);
        }
      }

      void loadOrders();
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(timeout);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (error) return <Alert variant="error">{error}</Alert>;

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] px-6 py-16 text-center">
        <h2 className="text-xl font-black text-[#333230]">هنوز سفارشی ثبت نشده</h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-[#77736D]">
          بعد از ثبت سفارش، وضعیت و جزئیات آن از همین بخش قابل پیگیری است.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230]"
        >
          مشاهده محصولات
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {orders.map((order) => (
        <article key={order.id} className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                href={`/account/orders/${order.id}`}
                className="text-xl font-black text-[#333230] transition hover:text-[#B2894C]"
              >
                {order.order_number}
              </Link>
              <p className="mt-2 text-sm font-bold text-[#77736D]">{formatDate(order.created_at)}</p>
              <p className="mt-3 max-w-2xl text-sm font-black leading-7 text-[#333230]">
                <span className="text-[#77736D]">محصول: </span>
                {getOrderProductTitle(order)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge label={order.status_label} tone="order" />
              <StatusBadge label={order.payment?.status_label || "بدون پرداخت"} tone="payment" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm font-bold text-[#77736D] sm:grid-cols-3">
            <SummaryPill label="روش پرداخت" value={order.payment?.method_label || "-"} />
            <SummaryPill label="روش تحویل" value={order.delivery_method_label} />
            <SummaryPill label="مبلغ نهایی" value={`${formatPrice(order.total_amount)} تومان`} />
          </div>

          <OrderRoadmap
            status={order.status}
            statusLabel={order.status_label}
            deliveryMethod={order.delivery_method}
            compact
          />
        </article>
      ))}
    </section>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "order" | "payment" }) {
  const classes =
    tone === "order"
      ? "border-[#D2AD70]/35 bg-[#F6F1E8] text-[#B2894C]"
      : "border-yellow-200 bg-yellow-50 text-yellow-800";

  return <span className={`inline-flex h-9 items-center rounded-full border px-3 text-xs font-black ${classes}`}>{label}</span>;
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#FAFAF8] px-4 py-3">
      <p className="text-xs text-[#77736D]">{label}</p>
      <p className="mt-1 font-black text-[#333230]">{value}</p>
    </div>
  );
}
