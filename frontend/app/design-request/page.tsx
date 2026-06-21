import { Suspense } from "react";

import DesignRequestClient from "./design-request-client";

export default function DesignRequestPage() {
  return (
    <Suspense fallback={<DesignRequestLoading />}>
      <DesignRequestClient />
    </Suspense>
  );
}

function DesignRequestLoading() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-5 w-32 animate-pulse rounded bg-sky-100" />
        <div className="mt-4 h-12 w-72 max-w-full animate-pulse rounded bg-gray-100" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="h-72 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-[520px] animate-pulse rounded-lg bg-gray-100" />
        </div>
      </section>
    </main>
  );
}
