"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { AdminPermission, AdminUser, getAdminMe } from "@/lib/admin-api";

import AdminShell from "./AdminShell";

const routePermissions: Array<{ prefix: string; permission: AdminPermission }> = [
  { prefix: "/admin/products", permission: "products" },
  { prefix: "/admin/categories", permission: "categories" },
  { prefix: "/admin/orders", permission: "orders" },
  { prefix: "/admin/design-requests", permission: "design_requests" },
  { prefix: "/admin/contact-messages", permission: "contact_messages" },
  { prefix: "/admin/customer-files", permission: "customer_files" },
  { prefix: "/admin/customers", permission: "customers" },
  { prefix: "/admin/activity-logs", permission: "activity_logs" },
  { prefix: "/admin/settings", permission: "settings" },
];

function getRequiredPermission(pathname: string): AdminPermission {
  return routePermissions.find((item) => pathname.startsWith(item.prefix))?.permission || "dashboard";
}

export default function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function verifyAdminAccess() {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }

      try {
        setIsCheckingAccess(true);
        setError(null);
        const response = await getAdminMe();
        if (!ignore) setAdminUser(response.data.data.user);
      } catch (accessError) {
        if (!ignore) {
          setAdminUser(null);
          setError(getApiErrorMessage(accessError));
        }
      } finally {
        if (!ignore) setIsCheckingAccess(false);
      }
    }

    void verifyAdminAccess();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading || isCheckingAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4">
        <div className="w-full max-w-sm rounded-lg border border-[#D5DAE1] bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.55)]">
          <div className="h-3 w-28 animate-pulse rounded-full bg-[#D5DAE1]" />
          <div className="mt-6 space-y-3">
            <div className="h-10 animate-pulse rounded-md bg-[#EEF1F4]" />
            <div className="h-10 animate-pulse rounded-md bg-[#EEF1F4]" />
            <div className="h-10 animate-pulse rounded-md bg-[#EEF1F4]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !adminUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F5F7] px-4">
        <section className="w-full max-w-md rounded-lg border border-[#D5DAE1] bg-white p-6 shadow-[0_20px_55px_-40px_rgba(15,23,42,0.55)]">
          <p className="text-sm font-black text-[#A15C38]">دسترسی مجاز نیست</p>
          <h1 className="mt-3 text-2xl font-black text-[#1F2933]">
            این بخش فقط برای مدیران فعال است.
          </h1>
          <p className="mt-3 text-sm font-medium leading-7 text-[#697586]">
            {error || "حساب فعلی دسترسی مدیریتی ندارد."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#1F2933] px-5 text-sm font-black text-white transition hover:bg-[#111827]"
            >
              خروج و ورود با حساب مدیر
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-5 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4]"
            >
              بازگشت به سایت
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const requiredPermission = getRequiredPermission(pathname);
  const hasRouteAccess = adminUser.admin_permissions.includes(requiredPermission);

  if (!hasRouteAccess) {
    return (
      <AdminShell adminUser={adminUser}>
        <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <p className="text-sm font-black text-[#A15C38]">دسترسی محدود است</p>
          <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
            نقش فعلی اجازه مشاهده این بخش را ندارد.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-[#697586]">
            برای تغییر سطح دسترسی، Super Admin باید نقش مدیریتی این حساب را در Django Admin تنظیم کند.
          </p>
        </section>
      </AdminShell>
    );
  }

  return <AdminShell adminUser={adminUser}>{children}</AdminShell>;
}
