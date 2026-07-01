import { Suspense } from "react";

import ProductsClient from "./products-client";

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageFallback />}>
      <ProductsClient />
    </Suspense>
  );
}

function ProductsPageFallback() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="mt-4 h-12 max-w-xl animate-pulse rounded bg-gray-100" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-lg border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
