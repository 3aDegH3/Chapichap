import { Suspense } from "react";

import PaymentFailedClient from "./payment-failed-client";

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<PaymentFailedLoading />}>
      <PaymentFailedClient />
    </Suspense>
  );
}

function PaymentFailedLoading() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-[#E3DED5]" />
      </section>
    </main>
  );
}
