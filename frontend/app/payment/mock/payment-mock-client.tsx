"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { getApiErrorMessage } from "@/lib/api";
import { submitMockPaymentCallback, type PaymentStatus } from "@/lib/payment-api";

const outcomes: { status: PaymentStatus; label: string; tone: "success" | "error" | "neutral" }[] = [
  { status: "successful", label: "پرداخت موفق", tone: "success" },
  { status: "failed", label: "پرداخت ناموفق", tone: "error" },
  { status: "canceled", label: "انصراف از پرداخت", tone: "neutral" },
  { status: "expired", label: "انقضای پرداخت", tone: "neutral" },
];

export default function MockPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction");
  const reference = searchParams.get("reference") || "-";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function completePayment(status: PaymentStatus) {
    if (!transactionId) {
      setError("شناسه تراکنش در آدرس وجود ندارد.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payment = await submitMockPaymentCallback(transactionId, status);
      if (payment.status === "successful") {
        router.replace(`/payment/success?payment=${payment.id}`);
        return;
      }

      router.replace(`/payment/failed?payment=${payment.id}`);
    } catch (callbackError) {
      setError(getApiErrorMessage(callbackError));
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E3DED5] bg-white p-6 text-center shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
          <p className="text-sm font-black text-[#B2894C]">درگاه آزمایشی</p>
          <h1 className="mt-3 text-2xl font-black text-[#333230]">شبیه‌سازی نتیجه پرداخت</h1>
          <p className="mt-4 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] px-4 py-3 text-sm font-bold text-[#77736D]">
            شماره ارجاع: {reference}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {outcomes.map((outcome) => (
              <button
                key={outcome.status}
                type="button"
                disabled={isSubmitting}
                onClick={() => void completePayment(outcome.status)}
                className={`h-12 rounded-xl px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  outcome.tone === "success"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : outcome.tone === "error"
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "border border-[#E3DED5] bg-white text-[#333230] hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
                }`}
              >
                {outcome.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <Link
            href="/account/orders"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-5 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
          >
            بازگشت به سفارش‌ها
          </Link>
        </div>
      </section>
    </main>
  );
}
