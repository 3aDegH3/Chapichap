import type { Metadata } from "next";

import AboutClient from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "درباره چاپی چاپ | تیم طراحی، چاپ و هدایای اختصاصی",
  description:
    "با تیم چاپی چاپ و مسیر ما در طراحی، چاپ و ساخت هدایای اختصاصی آشنا شوید. ایده‌های شما را به محصولات شخصی و ماندگار تبدیل می‌کنیم.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}