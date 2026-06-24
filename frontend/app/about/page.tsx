import type { Metadata } from "next";

import AboutFinalCTA from "@/components/about/AboutFinalCTA";
import AboutHero from "@/components/about/AboutHero";
import BrandMission from "@/components/about/BrandMission";
import BrandStory from "@/components/about/BrandStory";
import BrandValues from "@/components/about/BrandValues";
import OrderProcess from "@/components/about/OrderProcess";
import ServicesGrid from "@/components/about/ServicesGrid";

export const metadata: Metadata = {
  title: "درباره چاپی چاپ | تیم طراحی، چاپ و هدایای اختصاصی",
  description:
    "با تیم چاپی چاپ و مسیر ما در طراحی، چاپ و ساخت هدایای اختصاصی آشنا شوید. ایده‌های شما را به محصولات شخصی و ماندگار تبدیل می‌کنیم.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="bg-[#FAFAF8]">
      <AboutHero />
      <BrandStory />
      <BrandMission />
      <ServicesGrid />
      <BrandValues />
      <OrderProcess />
      <AboutFinalCTA />
    </main>
  );
}
