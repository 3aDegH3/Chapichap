import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import AppProviders from "@/components/providers/AppProviders";
import SiteChrome from "@/components/layout/SiteChrome";

const vazirmatn = localFont({
  src: "./fonts/Vazirmatn-RD[wght].woff2",
  variable: "--font-vazirmatn",
  weight: "100 900",
  style: "normal",
  display: "swap",
  adjustFontFallback: false,
});

const yekan = localFont({
  src: "./fonts/Yekan.regular.woff2",
  variable: "--font-yekan",
  weight: "400",
  style: "normal",
  display: "swap",
});

const nazanin = localFont({
  src: "./fonts/Nazanin.regular.woff2",
  variable: "--font-nazanin",
  weight: "400",
  style: "normal",
  display: "swap",
});

const lotus = localFont({
  src: "./fonts/Lotus.regular.woff2",
  variable: "--font-lotus",
  weight: "400",
  style: "normal",
  display: "swap",
});

const traffic = localFont({
  src: "./fonts/Traffic.regular.woff2",
  variable: "--font-traffic",
  weight: "400",
  style: "normal",
  display: "swap",
});

const morvarid = localFont({
  src: "./fonts/Morvarid.regular.woff2",
  variable: "--font-morvarid",
  weight: "400",
  style: "normal",
  display: "swap",
});

const zar = localFont({
  src: "./fonts/Zar.regular.woff2",
  variable: "--font-zar",
  weight: "400",
  style: "normal",
  display: "swap",
});

const titr = localFont({
  src: "./fonts/Titr.bold.woff2",
  variable: "--font-titr",
  weight: "700",
  style: "normal",
  display: "swap",
});

const iranNastaliq = localFont({
  src: "./fonts/IranNastaliq.regular.woff2",
  variable: "--font-iran-nastaliq",
  weight: "400",
  style: "normal",
  display: "swap",
});

const besmellah = localFont({
  src: "./fonts/Besmellah.regular.woff2",
  variable: "--font-besmellah",
  weight: "400",
  style: "normal",
  display: "swap",
});

const shapedBesmellah = localFont({
  src: "./fonts/ShapedBesmellah.regular.woff2",
  variable: "--font-shaped-besmellah",
  weight: "400",
  style: "normal",
  display: "swap",
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
  const fontVariables = [
    vazirmatn.variable,
    yekan.variable,
    nazanin.variable,
    lotus.variable,
    traffic.variable,
    morvarid.variable,
    zar.variable,
    titr.variable,
    iranNastaliq.variable,
    besmellah.variable,
    shapedBesmellah.variable,
  ].join(" ");

  return (
    <html lang="fa" dir="rtl" className={fontVariables}>
      <body className={`${fontVariables} antialiased`}>
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}