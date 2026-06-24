import { Suspense } from "react";

import PaymentSuccessClient from "./payment-success-client";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessClient />
    </Suspense>
  );
}

function PaymentSuccessLoading() {
  return (
    <main className="bg-[#FAFAF8]">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-[#E3DED5]" />
        <div className="mx-auto mt-6 h-10 w-72 max-w-full animate-pulse rounded bg-[#E3DED5]" />
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-[#E3DED5]" />
      </section>
    </main>
  );
}
