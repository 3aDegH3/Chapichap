import { Suspense } from "react";

import OrderErrorClient from "./error-client";

export default function OrderErrorPage() {
  return (
    <Suspense fallback={<OrderErrorLoading />}>
      <OrderErrorClient />
    </Suspense>
  );
}

function OrderErrorLoading() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto h-10 w-80 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mx-auto mt-5 h-20 w-full max-w-xl animate-pulse rounded bg-gray-100" />
      </section>
    </main>
  );
}
