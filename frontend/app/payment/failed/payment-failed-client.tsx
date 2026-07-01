"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { getPayment, initializePayment, type Payment } from "@/lib/payment-api";

function createRetryKey(paymentId: number) {
  const randomPart =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `retry:${paymentId}:${randomPart}`;
}

export default function PaymentFailedClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(paymentId));
  const [isRetrying, setIsRetrying] = useState(false);
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

  async function retryPayment() {
    if (!payment) return;

    setIsRetrying(true);
    setError("");

    try {
      const nextPayment = await initializePayment(
        payment.order,
        payment.method,
        createRetryKey(payment.id)
      );

      if (nextPayment.next_action.type === "REDIRECT" && nextPayment.next_action.url) {
        router.replace(nextPayment.next_action.url);
        return;
      }

      router.replace(`/order/success?order=${nextPayment.order}&payment=${nextPayment.id}`);
    } catch (retryError) {
      setError(getApiErrorMessage(retryError));
      setIsRetrying(false);
    }
  }

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
          <h1 className="text-2xl font-black text-[#333230]">امکان نمایش پرداخت نیست</h1>
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-2xl font-black text-red-700">
          !
        </div>
        <p className="mt-6 text-sm font-black text-red-700">پرداخت کامل نشد</p>
        <h1 className="mt-3 text-3xl font-black text-[#333230]">
          سفارش {payment.order_number}
        </h1>
        <p className="mt-4 leading-8 text-[#77736D]">
          وضعیت پرداخت: {payment.status_label}
        </p>

        <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-right text-sm font-bold leading-7 text-red-700">
          {payment.failure_reason || "پرداخت آزمایشی کامل نشد. می‌توانی دوباره تلاش کنی."}
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            disabled={isRetrying || payment.status === "successful"}
            onClick={() => void retryPayment()}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:-translate-y-0.5 hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRetrying ? "در حال انتقال..." : "تلاش مجدد برای پرداخت"}
          </button>
          <Link href={`/account/orders/${payment.order}`} className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]">
            مشاهده سفارش
          </Link>
        </div>
      </section>
    </main>
  );
}
