import { Suspense } from "react";

import MockPaymentClient from "./payment-mock-client";

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<MockPaymentLoading />}>
      <MockPaymentClient />
    </Suspense>
  );
}

function MockPaymentLoading() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="h-72 animate-pulse rounded-2xl bg-[#E3DED5]" />
      </section>
    </main>
  );
}
