"use client";

import type { CheckoutDeliveryMethod } from "@/lib/checkout-api";

type OrderRoadmapProps = {
  status: string;
  statusLabel: string;
  deliveryMethod: CheckoutDeliveryMethod;
  compact?: boolean;
};

type RoadmapStep = {
  key: string;
  label: string;
  statuses: string[];
};

function getRoadmapSteps(deliveryMethod: CheckoutDeliveryMethod): RoadmapStep[] {
  const handoffLabel = deliveryMethod === "PICKUP" ? "آماده تحویل" : "پست";

  return [
    {
      key: "registered",
      label: "ثبت سفارش",
      statuses: ["REGISTERED"],
    },
    {
      key: "review",
      label: "بررسی طرح",
      statuses: ["REVIEWING", "WAITING_DESIGN_APPROVAL"],
    },
    {
      key: "print",
      label: "چاپ",
      statuses: ["READY_FOR_PRINT", "PRINTING"],
    },
    {
      key: "handoff",
      label: handoffLabel,
      statuses: ["READY_TO_SHIP", "SHIPPED"],
    },
    {
      key: "delivered",
      label: "تحویل",
      statuses: ["DELIVERED"],
    },
  ];
}

function getCurrentStepIndex(status: string, steps: RoadmapStep[]) {
  return steps.findIndex((step) => step.statuses.includes(status));
}

export default function OrderRoadmap({
  status,
  statusLabel,
  deliveryMethod,
  compact = false,
}: OrderRoadmapProps) {
  const steps = getRoadmapSteps(deliveryMethod);
  const isCancelled = status === "CANCELLED";
  const currentStepIndex = getCurrentStepIndex(status, steps);
  const safeCurrentStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const progressPercent = isCancelled
    ? 0
    : (safeCurrentStepIndex / Math.max(steps.length - 1, 1)) * 80;

  return (
    <div
      className={
        compact
          ? "mt-5 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] p-4"
          : "rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-sm"
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-black text-[#B2894C]">مسیر سفارش</p>
        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-black ${
            isCancelled
              ? "border-red-200 bg-red-50 text-red-600"
              : "border-[#D2AD70]/45 bg-[#F6F1E8] text-[#B2894C]"
          }`}
        >
          الان: {statusLabel}
        </span>
      </div>

      <div className="mt-6 overflow-x-auto pb-1">
        <ol className="relative grid min-w-[520px] grid-cols-5">
          <span
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-4 h-0.5 rounded-full bg-[#E3DED5]"
          />
          <span
            aria-hidden="true"
            className={`absolute right-[10%] top-4 h-0.5 rounded-full transition-all ${
              isCancelled ? "bg-transparent" : "bg-[#D2AD70]"
            }`}
            style={{ width: `${progressPercent}%` }}
          />

          {steps.map((step, index) => {
            const isDone = !isCancelled && index < safeCurrentStepIndex;
            const isCurrent = !isCancelled && index === safeCurrentStepIndex;
            const isUpcoming = isCancelled || index > safeCurrentStepIndex;

            return (
              <li key={step.key} className="relative z-10 flex min-w-0 flex-col items-center text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white transition ${
                    isCurrent
                      ? "border-[#B2894C] shadow-[0_0_0_5px_rgba(210,173,112,0.22)]"
                      : isDone
                        ? "border-[#D2AD70]"
                        : "border-[#D8CFC0]"
                  }`}
                  aria-label={step.label}
                >
                  <span
                    className={`h-3 w-3 rounded-full ${
                      isCurrent
                        ? "bg-[#B2894C]"
                        : isDone
                          ? "bg-[#D2AD70]"
                          : isUpcoming
                            ? "bg-[#E3DED5]"
                            : "bg-[#D2AD70]"
                    }`}
                  />
                </span>
                <p
                  className={`mt-3 w-full truncate px-1 font-black ${
                    compact ? "text-xs" : "text-sm"
                  } ${isUpcoming ? "text-[#8B857D]" : "text-[#333230]"}`}
                  title={step.label}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
