"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <div className="min-h-screen bg-[#F4F5F7] text-[#1F2933]">{children}</div>;
  }

  return (
    <div className="min-h-screen brand-bg text-[var(--dark)]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
