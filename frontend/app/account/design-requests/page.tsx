"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/api";
import { getDesignRequests, type DesignRequest } from "@/lib/design-request-api";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function AccountDesignRequestsPage() {
  const [requests, setRequests] = useState<DesignRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadRequests() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getDesignRequests();
        if (mounted) setRequests(data);
      } catch (loadError) {
        if (mounted) setError(getApiErrorMessage(loadError));
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadRequests();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
    );
  }

  if (error) return <Alert variant="error">{error}</Alert>;

  if (requests.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] px-6 py-16 text-center">
        <h2 className="text-xl font-black text-[#333230]">درخواست طراحی ثبت نشده</h2>
        <p className="mx-auto mt-3 max-w-md leading-7 text-[#77736D]">
          درخواست طراحی اختصاصی شما بعد از ثبت در این بخش نمایش داده می‌شود.
        </p>
        <Link
          href="/design-request"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-2xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230]"
        >
          ثبت درخواست طراحی
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-4">
      {requests.map((request) => (
        <article key={request.id} className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-[#333230]">{request.order_type_label}</h2>
                <span className="rounded-full border border-[#D2AD70]/35 bg-[#F6F1E8] px-3 py-1 text-xs font-black text-[#B2894C]">
                  {request.status_label}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-[#77736D]">{formatDate(request.created_at)}</p>
              <p className="mt-4 line-clamp-2 text-sm font-bold leading-7 text-[#77736D]">{request.description}</p>
            </div>

            {request.uploaded_file?.file_url && (
              <a
                href={request.uploaded_file.file_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl border border-[#E3DED5] bg-white px-5 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
              >
                مشاهده فایل
              </a>
            )}
          </div>

          <div className="mt-5 grid gap-3 text-sm font-bold text-[#77736D] sm:grid-cols-3">
            <InfoPill label="نام تماس" value={request.contact_name} />
            <InfoPill label="شماره تماس" value={request.contact_phone} />
            <InfoPill label="محصول" value={request.product?.title || "بدون محصول"} />
          </div>

          {request.admin_response && (
            <div className="mt-5 rounded-xl border border-[#D2AD70]/35 bg-[#F6F1E8] p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-black text-[#B2894C]">پاسخ تیم طراحی</p>
                {request.admin_response_at && (
                  <p className="text-xs font-bold text-[#77736D]">
                    {formatDate(request.admin_response_at)}
                  </p>
                )}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm font-bold leading-8 text-[#333230]">
                {request.admin_response}
              </p>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#FAFAF8] px-4 py-3">
      <p className="text-xs text-[#77736D]">{label}</p>
      <p className="mt-1 break-words font-black text-[#333230]">{value}</p>
    </div>
  );
}
