"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import {
  AdminActivityLog,
  AdminDashboardContactMessage,
  AdminDashboardDesignRequest,
  AdminDashboardOrder,
  AdminDashboardProduct,
  getAdminDashboard,
} from "@/lib/admin-api";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const currencyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function formatCurrency(value: string) {
  return `${currencyFormatter.format(Number(value))} تومان`;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function DashboardCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "warning" | "success";
}) {
  const toneClass =
    tone === "warning"
      ? "border-[#E4B260] bg-[#FFFBEB]"
      : tone === "success"
        ? "border-[#8FC79A] bg-[#F0FDF4]"
        : "border-[#D5DAE1] bg-white";

  return (
    <div className={`rounded-lg border p-5 shadow-[0_16px_42px_-40px_rgba(15,23,42,0.42)] ${toneClass}`}>
      <p className="text-sm font-bold text-[#697586]">{label}</p>
      <p className="mt-4 text-3xl font-black text-[#1F2933]">{formatNumber(value)}</p>
    </div>
  );
}

function PanelSection({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_16px_42px_-40px_rgba(15,23,42,0.42)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-black text-[#1F2933]">{title}</h3>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
          >
            {actionLabel}
          </Link>
        )}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-[#D5DAE1] bg-[#F8FAFC] p-6 text-center text-sm font-bold text-[#697586]">
      {text}
    </div>
  );
}

function LatestOrders({ orders }: { orders: AdminDashboardOrder[] }) {
  if (orders.length === 0) return <EmptyState text="سفارشی ثبت نشده است." />;

  return (
    <div className="overflow-hidden rounded-md border border-[#E3E8EF]">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/orders/${order.id}`}
          className="grid gap-3 border-b border-[#E3E8EF] bg-white p-4 transition last:border-b-0 hover:bg-[#F8FAFC] md:grid-cols-[1fr_auto]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-black text-[#1F2933]">{order.order_number}</p>
              <span className="rounded-md bg-[#EEF1F4] px-2 py-1 text-xs font-black text-[#364152]">
                {order.status_label}
              </span>
            </div>
            <p className="mt-2 truncate text-sm font-bold text-[#697586]">
              {order.receiver_name} · {order.phone}
            </p>
          </div>
          <div className="text-right md:text-left">
            <p className="text-sm font-black text-[#1F2933]">{formatCurrency(order.total_amount)}</p>
            <p className="mt-1 text-xs font-bold text-[#697586]">{formatDate(order.created_at)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LatestDesignRequests({ requests }: { requests: AdminDashboardDesignRequest[] }) {
  if (requests.length === 0) return <EmptyState text="درخواست طراحی جدیدی وجود ندارد." />;

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <Link
          key={request.id}
          href={`/admin/design-requests/${request.id}`}
          className="block rounded-md border border-[#E3E8EF] bg-white p-4 transition hover:bg-[#F8FAFC]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-black text-[#1F2933]">{request.contact_name}</p>
              <p className="mt-2 text-sm font-bold text-[#697586]">{request.order_type_label}</p>
            </div>
            <span className="shrink-0 rounded-md bg-[#EEF1F4] px-2 py-1 text-xs font-black text-[#364152]">
              {request.status_label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function LowStockProducts({ products }: { products: AdminDashboardProduct[] }) {
  if (products.length === 0) return <EmptyState text="محصول کم‌موجودی وجود ندارد." />;

  return (
    <div className="space-y-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/admin/products/${product.id}`}
          className="flex items-center justify-between gap-3 rounded-md border border-[#E3E8EF] bg-white p-4 transition hover:bg-[#F8FAFC]"
        >
          <div className="min-w-0">
            <p className="truncate font-black text-[#1F2933]">{product.title}</p>
            <p className="mt-2 text-sm font-bold text-[#697586]">
              {product.category_title || "بدون دسته‌بندی"}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-[#FFFBEB] px-3 py-2 text-sm font-black text-[#92400E]">
            {formatNumber(product.stock_quantity)}
          </span>
        </Link>
      ))}
    </div>
  );
}

function LatestContactMessages({ messages }: { messages: AdminDashboardContactMessage[] }) {
  if (messages.length === 0) return <EmptyState text="پیام تماسی ثبت نشده است." />;

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <Link
          key={message.id}
          href={`/admin/contact-messages/${message.id}`}
          className="block rounded-md border border-[#E3E8EF] bg-white p-4 transition hover:bg-[#F8FAFC]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-black text-[#1F2933]">{message.full_name}</p>
              <p className="mt-2 text-sm font-bold text-[#697586]">
                {message.subject_label} · {message.phone}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-[#EEF1F4] px-2 py-1 text-xs font-black text-[#364152]">
              {message.status_label}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function RecentActivities({ activities }: { activities: AdminActivityLog[] }) {
  if (activities.length === 0) return <EmptyState text="فعالیت مدیریتی ثبت نشده است." />;

  return (
    <div className="divide-y divide-[#E3E8EF]">
      {activities.map((activity) => (
        <div key={activity.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-[#1F2933]">{activity.action_label}</p>
            <p className="mt-1 text-sm font-bold text-[#697586]">{activity.description}</p>
          </div>
          <div className="shrink-0 text-xs font-bold text-[#697586] md:text-left">
            <p>{activity.actor_label}</p>
            <p className="mt-1">{formatDate(activity.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-lg bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-white" />
        <div className="h-80 animate-pulse rounded-lg bg-white" />
      </div>
    </div>
  );
}

export default function AdminDashboardClient() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const response = await getAdminDashboard();
      return response.data.data;
    },
  });

  if (isLoading) return <DashboardLoading />;

  if (isError || !data) {
    return (
      <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <p className="text-sm font-black text-[#B42318]">خطا در دریافت داشبورد</p>
        <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
          داده‌های داشبورد دریافت نشد.
        </h2>
        <p className="mt-3 text-sm font-medium leading-7 text-[#697586]">
          {getApiErrorMessage(error)}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-5 inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827]"
        >
          تلاش دوباره
        </button>
      </section>
    );
  }

  const cards = [
    { label: "سفارش‌های جدید", value: data.stats.new_orders, tone: "warning" as const },
    { label: "در حال بررسی", value: data.stats.reviewing_orders },
    { label: "آماده چاپ", value: data.stats.ready_for_print_orders, tone: "success" as const },
    { label: "آماده ارسال", value: data.stats.ready_to_ship_orders },
    { label: "درخواست طراحی جدید", value: data.stats.new_design_requests, tone: "warning" as const },
    { label: "پیام خوانده‌نشده", value: data.stats.unread_contact_messages, tone: "warning" as const },
    { label: "محصول کم‌موجودی", value: data.stats.low_stock_products },
    { label: "مشتریان", value: data.stats.customers },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">داشبورد عملیاتی</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
              وضعیت امروز فروشگاه
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className="inline-flex h-10 items-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4]"
            >
              ثبت محصول
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827]"
            >
              سفارش‌های جدید
            </Link>
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="inline-flex h-10 items-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4] disabled:opacity-60"
            >
              {isFetching ? "در حال به‌روزرسانی" : "به‌روزرسانی"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <PanelSection title="آخرین سفارش‌ها" actionHref="/admin/orders" actionLabel="همه سفارش‌ها">
          <LatestOrders orders={data.latest_orders} />
        </PanelSection>

        <PanelSection
          title="آخرین درخواست‌های طراحی"
          actionHref="/admin/design-requests"
          actionLabel="همه درخواست‌ها"
        >
          <LatestDesignRequests requests={data.latest_design_requests} />
        </PanelSection>

        <PanelSection
          title="محصولات کم‌موجودی"
          actionHref="/admin/products"
          actionLabel="مدیریت محصولات"
        >
          <LowStockProducts products={data.low_stock_products} />
        </PanelSection>

        <PanelSection
          title="پیام‌های تماس"
          actionHref="/admin/contact-messages"
          actionLabel="همه پیام‌ها"
        >
          <LatestContactMessages messages={data.latest_contact_messages} />
        </PanelSection>
      </section>

      {data.can_view_activity_logs && (
        <PanelSection title="فعالیت‌های اخیر مدیران" actionHref="/admin/activity-logs" actionLabel="گزارش کامل">
          <RecentActivities activities={data.recent_admin_activities} />
        </PanelSection>
      )}
    </div>
  );
}
