"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Alert from "@/components/ui/Alert";
import { getApiErrorMessage } from "@/lib/api";
import { getAccountDashboard, type DashboardData } from "@/lib/account-api";

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

export default function AccountDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      async function loadDashboard() {
        setIsLoading(true);
        setError("");
        try {
          setDashboard(await getAccountDashboard());
        } catch (loadError) {
          setError(getApiErrorMessage(loadError));
        } finally {
          setIsLoading(false);
        }
      }
      void loadDashboard();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  if (isLoading) return <DashboardSkeleton />;
  if (error || !dashboard) return <Alert variant="error">{error || "داشبورد قابل دریافت نیست."}</Alert>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="سفارش‌های فعال" value={dashboard.active_orders_count} href="/account/orders" />
        <MetricCard label="درخواست‌های طراحی" value={dashboard.design_requests_count} href="/account/design-requests" />
        <MetricCard label="تیکت‌های باز" value={dashboard.open_tickets_count} href="/account/tickets" />
        <MetricCard label="اعلان‌های خوانده‌نشده" value={dashboard.unread_notifications_count} href="/account/notifications" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#333230]">آخرین سفارش</h2>
            <Link href="/account/orders" className="text-sm font-black text-[#B2894C]">همه سفارش‌ها</Link>
          </div>
          {dashboard.latest_order ? (
            <div className="mt-5 rounded-xl bg-[#FAFAF8] p-4">
              <Link href={`/account/orders/${dashboard.latest_order.id}`} className="text-lg font-black text-[#333230] hover:text-[#B2894C]">
                {dashboard.latest_order.order_number}
              </Link>
              <div className="mt-4 grid gap-3 text-sm font-bold text-[#77736D] sm:grid-cols-2">
                <InfoPill label="وضعیت" value={dashboard.latest_order.status_label} />
                <InfoPill label="مبلغ" value={`${formatPrice(dashboard.latest_order.total_amount)} تومان`} />
              </div>
            </div>
          ) : (
            <EmptyState text="هنوز سفارشی ثبت نشده است." href="/products" label="مشاهده محصولات" />
          )}
        </div>

        <div className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[#333230]">درخواست طراحی</h2>
            <Link href="/account/design-requests" className="text-sm font-black text-[#B2894C]">همه درخواست‌ها</Link>
          </div>
          {dashboard.latest_design_request ? (
            <div className="mt-5 rounded-xl bg-[#FAFAF8] p-4">
              <p className="text-lg font-black text-[#333230]">{dashboard.latest_design_request.order_type_label}</p>
              <div className="mt-4 grid gap-3 text-sm font-bold text-[#77736D] sm:grid-cols-2">
                <InfoPill label="وضعیت" value={dashboard.latest_design_request.status_label} />
                <InfoPill label="ثبت" value={new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(dashboard.latest_design_request.created_at))} />
              </div>
            </div>
          ) : (
            <EmptyState text="درخواست طراحی فعالی ندارید." href="/design-request" label="ثبت درخواست طراحی" />
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]">
      <p className="text-sm font-black text-[#77736D]">{label}</p>
      <p className="mt-4 text-3xl font-black text-[#333230]">{value.toLocaleString("fa-IR")}</p>
    </Link>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-4 py-3">
      <p className="text-xs text-[#77736D]">{label}</p>
      <p className="mt-1 font-black text-[#333230]">{value}</p>
    </div>
  );
}

function EmptyState({ text, href, label }: { text: string; href: string; label: string }) {
  return (
    <div className="mt-5 rounded-xl border border-dashed border-[#D2AD70]/50 bg-[#F6F1E8] p-6 text-center">
      <p className="font-bold text-[#77736D]">{text}</p>
      <Link href={href} className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#D2AD70] px-5 text-sm font-black text-[#333230]">
        {label}
      </Link>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
        <div className="h-64 animate-pulse rounded-2xl bg-white" />
      </div>
    </div>
  );
}
