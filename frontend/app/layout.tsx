import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./design-system.css";

export const metadata = {
  title: "Print & Gift Store",
  description: "Custom printing and personalized gifts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body>
        <div className="layout">
          {children}
        </div>
      </body>
    </html>
  );
}
