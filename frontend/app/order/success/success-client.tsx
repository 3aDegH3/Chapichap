"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { getOrder, type Order } from "@/lib/checkout-api";
import { siteInfo } from "@/lib/site-info";

const IN_PERSON_PAYMENT_INSTRUCTIONS =
  "سفارش بدون پرداخت آنلاین ثبت شد و تیم چاپی چاپ برای هماهنگی پرداخت و ادامه فرایند با شما تماس می‌گیرد.";

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
      <main className="bg-[#FAFAF8]">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-[#E3DED5]" />
          <div className="mx-auto mt-6 h-10 w-72 max-w-full animate-pulse rounded bg-[#E3DED5]" />
          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-[#E3DED5]" />
        </section>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="bg-[#FAFAF8]">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black text-[#333230]">امکان نمایش سفارش نیست</h1>
          <p className="mt-4 leading-7 text-[#77736D]">{error}</p>
          <Link
            href="/account/orders"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:bg-[#B2894C]"
          >
            مشاهده سفارش‌ها
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#D2AD70]/50 bg-[#F6F1E8] text-2xl font-black text-[#B2894C]">
          ✓
        </div>
        <p className="mt-6 text-sm font-black text-[#B2894C]">سفارش با موفقیت ثبت شد</p>
        <h1 className="mt-3 text-3xl font-black text-[#333230]">
          کد سفارش {order.order_number}
        </h1>
        <p className="mt-4 leading-8 text-[#77736D]">
          سفارش با وضعیت «{order.status_label}» ثبت شد. وضعیت پرداخت و مراحل آماده‌سازی از پنل کاربری قابل پیگیری است.
        </p>

        <div className="mt-8 grid gap-3 rounded-2xl border border-[#E3DED5] bg-white p-5 text-right shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
          <SummaryRow label="گیرنده" value={order.receiver_name} />
          <SummaryRow label="روش تحویل" value={order.delivery_method_label} />
          <SummaryRow label="روش پرداخت" value={order.payment?.method_label || "پرداخت حضوری"} />
          <SummaryRow label="وضعیت پرداخت" value={order.payment?.status_label || "در انتظار پرداخت"} />
          {order.payment?.tracking_code && (
            <SummaryRow label="شماره پیگیری" value={order.payment.tracking_code} />
          )}
          {order.payment?.receipt_number && (
            <SummaryRow label="رسید پرداخت" value={order.payment.receipt_number} />
          )}
          <SummaryRow label="جمع کالاها" value={`${formatPrice(order.subtotal)} تومان`} />
          <SummaryRow label="هزینه ارسال" value={`${formatPrice(order.shipping_cost)} تومان`} />
          <SummaryRow label="مبلغ نهایی" value={`${formatPrice(order.total_amount)} تومان`} />
        </div>

        <div className="mt-5 rounded-2xl border border-[#D2AD70]/45 bg-[#F6F1E8] p-5 text-right">
          <p className="text-base font-black text-[#333230]">هماهنگی پرداخت و ادامه سفارش</p>
          <p className="mt-3 text-sm font-bold leading-7 text-[#77736D]">
            {IN_PERSON_PAYMENT_INSTRUCTIONS}
          </p>
          <p className="mt-3 text-sm font-bold leading-7 text-[#77736D]">
            محل هماهنگی/پرداخت حضوری: {siteInfo.officeAddress}
          </p>
        </div>

        {paymentError && (
          <div className="mt-5 rounded-xl border border-[#D2AD70]/45 bg-[#F6F1E8] p-4 text-right text-sm font-bold leading-7 text-[#77736D]">
            سفارش ثبت شد، اما ساخت رکورد پرداخت نیاز به بررسی دوباره دارد: {paymentError}
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:-translate-y-0.5 hover:bg-[#B2894C]"
          >
            مشاهده جزئیات سفارش
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
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
    <div className="flex justify-between gap-4 text-sm font-bold text-[#77736D]">
      <span>{label}</span>
      <span className="text-[#333230]">{value}</span>
    </div>
  );
}
