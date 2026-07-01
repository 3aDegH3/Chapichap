"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { getPayment, type Payment } from "@/lib/payment-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(paymentId));
  const [error, setError] = useState(paymentId ? "" : "شناسه پرداخت در آدرس وجود ندارد.");

  useEffect(() => {
    if (!paymentId) return;

    let mounted = true;

    async function loadPayment() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getPayment(paymentId as string);
        if (mounted) setPayment(data);
      } catch (paymentError) {
        if (mounted) setError(getApiErrorMessage(paymentError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadPayment();

    return () => {
      mounted = false;
    };
  }, [paymentId]);

  if (isLoading) {
    return (
      <main className="bg-[#FAFAF8]">
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mt-8 h-72 animate-pulse rounded-2xl bg-[#E3DED5]" />
        </section>
      </main>
    );
  }

  if (error || !payment) {
    return (
      <main className="bg-[#FAFAF8]">
        <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-2xl font-black text-[#333230]">امکان نمایش رسید نیست</h1>
          <p className="mt-4 leading-7 text-[#77736D]">{error}</p>
          <Link href="/account/orders" className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230]">
            مشاهده سفارش‌ها
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50 text-2xl font-black text-green-700">
          ✓
        </div>
        <p className="mt-6 text-sm font-black text-green-700">پرداخت با موفقیت انجام شد</p>
        <h1 className="mt-3 text-3xl font-black text-[#333230]">
          سفارش {payment.order_number}
        </h1>

        <div className="mt-8 grid gap-3 rounded-2xl border border-[#E3DED5] bg-white p-5 text-right shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
          <SummaryRow label="مبلغ" value={`${formatPrice(payment.amount)} تومان`} />
          <SummaryRow label="روش پرداخت" value={payment.method_label} />
          <SummaryRow label="وضعیت" value={payment.status_label} />
          <SummaryRow label="شماره پیگیری" value={payment.tracking_code || "-"} />
          <SummaryRow label="رسید پرداخت" value={payment.receipt_number || "-"} />
          <SummaryRow label="ارجاع درگاه" value={payment.provider_reference || "-"} />
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={`/account/orders/${payment.order}`} className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:-translate-y-0.5 hover:bg-[#B2894C]">
            مشاهده جزئیات سفارش
          </Link>
          <Link href="/products" className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]">
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
