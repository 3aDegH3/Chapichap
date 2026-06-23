import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import AppProviders from "@/components/providers/AppProviders";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-RD[wght].woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Chapi Chap | چاپ و هدایای اختصاصی",
  description: "فروشگاه آنلاین چاپ، هدایای اختصاصی و سفارش طراحی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.className} ${vazirmatn.variable}`}
    >
      <body className={`${vazirmatn.className} ${vazirmatn.variable} antialiased`}>
        <AppProviders>
          <div className="min-h-screen brand-bg text-[var(--dark)]">
            <Header />

            <main>{children}</main>

            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
