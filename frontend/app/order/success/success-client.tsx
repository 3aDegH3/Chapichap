"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { getOrder, type Order } from "@/lib/checkout-api";

const PICKUP_ADDRESS = "تهران، مرکز چاپ چی چاپ؛ هماهنگی زمان مراجعه پس از ثبت سفارش انجام می‌شود.";
const IN_PERSON_PAYMENT_INSTRUCTIONS =
  "پس از ثبت سفارش، برای هماهنگی زمان پرداخت و تحویل با شما تماس گرفته می‌شود. سفارش تا زمان تأیید پرداخت در وضعیت در انتظار پرداخت باقی می‌ماند.";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const paymentError = searchParams.get("payment_error") || "";
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const [error, setError] = useState(orderId ? "" : "شناسه سفارش در آدرس وجود ندارد.");

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getOrder(orderId as string);
        if (isMounted) setOrder(data);
      } catch (orderError) {
        if (isMounted) setError(getApiErrorMessage(orderError));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-gray-100" />
          <div className="mx-auto mt-6 h-10 w-72 max-w-full animate-pulse rounded bg-gray-100" />
          <div className="mt-8 h-72 animate-pulse rounded-lg bg-gray-100" />
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="bg-white">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black text-[var(--dark)]">امکان نمایش سفارش نیست</h1>
          <p className="mt-4 leading-7 text-gray-600">{error}</p>
          <Link
            href="/account/orders"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--secondary)] px-6 text-sm font-black text-white"
          >
            مشاهده سفارش‌ها
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-2xl font-black text-[var(--secondary)]">
          ✓
        </div>
        <p className="mt-6 text-sm font-black text-[var(--secondary)]">سفارش با موفقیت ثبت شد</p>
        <h1 className="mt-3 text-3xl font-black text-[var(--dark)]">
          کد سفارش {order.order_number}
        </h1>
        <p className="mt-4 leading-8 text-gray-600">
          سفارش با وضعیت «{order.status_label}» و پرداخت با وضعیت «
          {order.payment?.status_label || "در انتظار پرداخت"}» ثبت شد.
        </p>

        <div className="mt-8 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-5 text-right">
          <SummaryRow label="گیرنده" value={order.receiver_name} />
          <SummaryRow label="روش تحویل" value={order.delivery_method_label} />
          <SummaryRow label="روش پرداخت" value={order.payment?.method_label || "پرداخت حضوری"} />
          <SummaryRow label="جمع کالاها" value={`${formatPrice(order.subtotal)} تومان`} />
          <SummaryRow label="هزینه ارسال" value={`${formatPrice(order.shipping_cost)} تومان`} />
          <SummaryRow label="مبلغ نهایی" value={`${formatPrice(order.total_amount)} تومان`} />
        </div>

        <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-5 text-right">
          <p className="text-base font-black text-yellow-900">در انتظار پرداخت حضوری</p>
          <p className="mt-3 text-sm font-bold leading-7 text-yellow-800">
            {IN_PERSON_PAYMENT_INSTRUCTIONS}
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-yellow-800">
            محل هماهنگی/پرداخت: {PICKUP_ADDRESS}
          </p>
        </div>

        {paymentError && (
          <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-right text-sm font-bold leading-7 text-yellow-800">
            سفارش ثبت شد، اما ساخت رکورد پرداخت نیاز به بررسی دوباره دارد: {paymentError}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90"
          >
            مشاهده جزئیات سفارش
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
          >
            بازگشت به محصولات
          </Link>
        </div>
      </section>
    </main>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm font-bold text-gray-600">
      <span>{label}</span>
      <span className="text-[var(--dark)]">{value}</span>
    </div>
  );
}
