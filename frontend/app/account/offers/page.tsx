"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/api";
import { getOffers, type CustomerOffer } from "@/lib/account-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

function formatDate(date: string | null) {
  if (!date) return "بدون تاریخ";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(date));
}

export default function AccountOffersPage() {
  const [offers, setOffers] = useState<CustomerOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOffers() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getOffers();
        if (mounted) setOffers(data.offers);
      } catch (loadError) {
        if (mounted) setError(getApiErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadOffers();

    return () => {
      mounted = false;
    };
  }, []);

  async function copyCode(code: string) {
    if (!code || typeof navigator === "undefined") return;
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-56 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (error) return <Alert variant="error">{error}</Alert>;

  if (offers.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-black text-[var(--dark)]">فعلاً پیشنهادی ندارید</h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-gray-600">
          پیشنهادهای اختصاصی و کدهای تخفیف بعد از فعال‌سازی در همین بخش نمایش داده می‌شوند.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[var(--secondary)] px-6 text-sm font-black text-white"
        >
          مشاهده محصولات
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {offers.map((offer) => (
        <article key={offer.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[var(--secondary)]">{offer.offer_type_label}</p>
              <h2 className="mt-2 text-xl font-black text-[var(--dark)]">{offer.title}</h2>
            </div>
            <StatusBadge status={offer.status} />
          </div>

          {offer.description && (
            <p className="mt-4 text-sm font-bold leading-7 text-gray-600">{offer.description}</p>
          )}

          <div className="mt-5 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-2">
            <InfoPill label="نوع تخفیف" value={offer.discount_type_label} />
            <InfoPill label="مقدار" value={offer.discount_type === "percent" ? `${formatPrice(offer.discount_value)}٪` : `${formatPrice(offer.discount_value)} تومان`} />
            <InfoPill label="حداقل سفارش" value={`${formatPrice(offer.minimum_order_amount)} تومان`} />
            <InfoPill label="اعتبار" value={formatDate(offer.expires_at)} />
          </div>

          {offer.coupon_code && (
            <button
              type="button"
              onClick={() => void copyCode(offer.coupon_code)}
              className="mt-5 flex h-12 w-full items-center justify-between rounded-2xl border border-yellow-200 bg-yellow-50 px-4 text-sm font-black text-yellow-900"
            >
              <span>{offer.coupon_code}</span>
              <span>{copiedCode === offer.coupon_code ? "کپی شد" : "کپی کد"}</span>
            </button>
          )}
        </article>
      ))}
    </section>
  );
}

function StatusBadge({ status }: { status: CustomerOffer["status"] }) {
  const labels = {
    active: "فعال",
    used: "استفاده‌شده",
    expired: "منقضی",
  };
  const classes = {
    active: "border-green-200 bg-green-50 text-green-700",
    used: "border-gray-200 bg-gray-50 text-gray-600",
    expired: "border-red-200 bg-red-50 text-red-700",
  };

  return <span className={`rounded-full border px-3 py-1 text-xs font-black ${classes[status]}`}>{labels[status]}</span>;
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}
