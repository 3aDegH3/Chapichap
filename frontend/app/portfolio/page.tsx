import { Suspense } from "react";

import PortfolioClient from "./portfolio-client";

export default function PortfolioPage() {
  return (
    <Suspense fallback={<PortfolioPageFallback />}>
      <PortfolioClient />
    </Suspense>
  );
}

function PortfolioPageFallback() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-52 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-12 max-w-2xl animate-pulse rounded bg-gray-100" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-lg border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
