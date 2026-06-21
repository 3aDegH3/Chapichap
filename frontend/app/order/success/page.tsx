import { Suspense } from "react";

import OrderSuccessClient from "./success-client";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessLoading />}>
      <OrderSuccessClient />
    </Suspense>
  );
}

function OrderSuccessLoading() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-gray-100" />
        <div className="mx-auto mt-6 h-10 w-72 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-8 h-72 animate-pulse rounded-lg bg-gray-100" />
      </section>
    </main>
  );
}
