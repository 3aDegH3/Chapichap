import type { Metadata } from "next";
import "./globals.css";

import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "چاپ و هدایای اختصاصی",
  description: "فروشگاه آنلاین چاپ، هدیه اختصاصی و سفارش طراحی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AppProviders>
          <div className="min-h-screen bg-slate-50 text-slate-900">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}