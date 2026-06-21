"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCart } from "@/contexts/CartContext";
import { getApiErrorMessage } from "@/lib/api";
import {
  createOrder,
  getCheckoutPreview,
  type CheckoutPreview,
  type CheckoutDeliveryMethod,
} from "@/lib/checkout-api";
import {
  getPaymentMethods,
  initializePayment,
  type PaymentMethod,
  type PaymentMethodCode,
} from "@/lib/payment-api";

const CHECKOUT_STORAGE_KEY = "chapichap.checkout.v1";
const PICKUP_ADDRESS = "تهران، مرکز چاپ چی چاپ؛ هماهنگی زمان مراجعه پس از ثبت سفارش انجام می‌شود.";
const IN_PERSON_PAYMENT_INSTRUCTIONS =
  "پس از ثبت سفارش، برای هماهنگی زمان پرداخت و تحویل با شما تماس گرفته می‌شود. سفارش تا زمان تأیید پرداخت در وضعیت در انتظار پرداخت باقی می‌ماند.";

const checkoutSchema = z.object({
  receiver_name: z.string().trim().min(2, "نام و نام خانوادگی را کامل وارد کن."),
  phone: z
    .string()
    .trim()
    .min(8, "شماره تماس معتبر وارد کن.")
    .regex(/^[0-9۰-۹٠-٩+\-()\s]+$/, "شماره تماس معتبر وارد کن."),
  province: z.string().trim().min(2, "استان را وارد کن."),
  city: z.string().trim().min(2, "شهر را وارد کن."),
  address: z.string().trim().min(10, "آدرس کامل‌تر وارد کن."),
  postal_code: z
    .string()
    .trim()
    .regex(/^[0-9۰-۹٠-٩]{10}$/, "کد پستی باید ۱۰ رقم باشد."),
  delivery_method: z.enum(["SHIPPING", "PICKUP"]),
  payment_method: z.enum(["IN_PERSON"]),
  notes: z.string().trim().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const defaultCheckoutValues: CheckoutFormValues = {
  receiver_name: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  postal_code: "",
  delivery_method: "SHIPPING",
  payment_method: "IN_PERSON",
  notes: "",
};

function readCheckoutDraft() {
  if (typeof window === "undefined") return null;

  try {
    const rawDraft = window.localStorage.getItem(CHECKOUT_STORAGE_KEY);
    return rawDraft ? (JSON.parse(rawDraft) as CheckoutFormValues) : null;
  } catch {
    window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    return null;
  }
}

function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price) || 0);
}

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart, isReady, totalItems } = useCart();
  const [initialDraft] = useState<CheckoutFormValues | null>(readCheckoutDraft);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: { ...defaultCheckoutValues, ...initialDraft },
  });

  const watchedValues = useWatch({ control });
  const deliveryMethod = watchedValues.delivery_method || "SHIPPING";
  const paymentMethod = watchedValues.payment_method || "IN_PERSON";

  const loadPreview = useCallback(async (method: CheckoutDeliveryMethod) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getCheckoutPreview(method);
      setPreview(data);
    } catch (previewError) {
      setError(getApiErrorMessage(previewError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPaymentMethods = useCallback(async () => {
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(methods);
    } catch {
      setPaymentMethods([
        {
          code: "IN_PERSON",
          title: "پرداخت حضوری",
          description: IN_PERSON_PAYMENT_INSTRUCTIONS,
          is_active: true,
          requires_redirect: false,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (totalItems === 0) {
      router.replace("/cart");
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadPreview(deliveryMethod);
      void loadPaymentMethods();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [deliveryMethod, isReady, loadPaymentMethods, loadPreview, router, totalItems]);

  useEffect(() => {
    window.localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({ ...defaultCheckoutValues, ...watchedValues })
    );
  }, [watchedValues]);

  async function submitOrder(values: CheckoutFormValues) {
    setSubmitError("");

    try {
      const order = await createOrder({
        ...values,
        notes: values.notes || "",
      });

      window.localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      clearCart();

      try {
        const payment = await initializePayment(order.id, values.payment_method);
        router.replace(`/order/success?order=${order.id}&payment=${payment.id}`);
      } catch (paymentError) {
        router.replace(
          `/order/success?order=${order.id}&payment_error=${encodeURIComponent(
            getApiErrorMessage(paymentError)
          )}`
        );
      }
    } catch (orderError) {
      const message = getApiErrorMessage(orderError);
      setSubmitError(message);
      router.push(`/order/error?message=${encodeURIComponent(message)}`);
    }
  }

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[var(--secondary)]">تسویه حساب</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight text-[var(--dark)] sm:text-5xl">
                مرور نهایی سفارش
              </h1>
              <p className="mt-4 max-w-2xl leading-8 text-gray-600">
                مبلغ‌ها از سمت سرور محاسبه و تأیید می‌شوند تا سفارش با قیمت درست ثبت شود.
              </p>
            </div>
            <Link
              href="/cart"
              className="inline-flex h-12 w-fit items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
            >
              ویرایش سبد خرید
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div className="min-w-0">
          {isLoading || !isReady ? (
            <CheckoutSkeleton />
          ) : error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 p-6">
              <h2 className="text-lg font-black text-red-700">امکان نمایش Checkout نیست</h2>
              <p className="mt-3 leading-7 text-red-700">{error}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void loadPreview(deliveryMethod)}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90"
                >
                  تلاش دوباره
                </button>
                <Link
                  href="/cart"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-red-200 bg-white px-6 text-sm font-black text-red-700"
                >
                  بازگشت به سبد خرید
                </Link>
              </div>
            </div>
          ) : preview ? (
            <div className="space-y-6">
              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-[var(--dark)]">اطلاعات گیرنده</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <CheckoutField label="نام و نام خانوادگی" error={errors.receiver_name?.message}>
                    <input
                      {...register("receiver_name")}
                      className={inputClass(Boolean(errors.receiver_name))}
                      placeholder="نام گیرنده"
                    />
                  </CheckoutField>

                  <CheckoutField label="شماره تماس" error={errors.phone?.message}>
                    <input
                      {...register("phone")}
                      inputMode="tel"
                      className={inputClass(Boolean(errors.phone))}
                      placeholder="0912..."
                    />
                  </CheckoutField>

                  <CheckoutField label="استان" error={errors.province?.message}>
                    <input
                      {...register("province")}
                      className={inputClass(Boolean(errors.province))}
                      placeholder="تهران"
                    />
                  </CheckoutField>

                  <CheckoutField label="شهر" error={errors.city?.message}>
                    <input
                      {...register("city")}
                      className={inputClass(Boolean(errors.city))}
                      placeholder="تهران"
                    />
                  </CheckoutField>

                  <CheckoutField label="کد پستی" error={errors.postal_code?.message}>
                    <input
                      {...register("postal_code")}
                      inputMode="numeric"
                      className={inputClass(Boolean(errors.postal_code))}
                      placeholder="۱۰ رقم"
                    />
                  </CheckoutField>
                </div>

                <div className="mt-5 grid gap-5">
                  <CheckoutField label="آدرس کامل" error={errors.address?.message}>
                    <textarea
                      {...register("address")}
                      rows={4}
                      className={`${inputClass(Boolean(errors.address))} h-auto resize-none py-3 leading-7`}
                      placeholder="خیابان، کوچه، پلاک، واحد"
                    />
                  </CheckoutField>

                  <CheckoutField label="توضیحات تکمیلی" error={errors.notes?.message}>
                    <textarea
                      {...register("notes")}
                      rows={3}
                      className={`${inputClass(Boolean(errors.notes))} h-auto resize-none py-3 leading-7`}
                      placeholder="اختیاری؛ مثل زمان مناسب تماس یا توضیح تحویل"
                    />
                  </CheckoutField>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-[var(--dark)]">روش تحویل</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <DeliveryOption
                    label="ارسال به آدرس"
                    description="سفارش به آدرس واردشده ارسال می‌شود."
                    price="۵۰٬۰۰۰ تومان"
                    value="SHIPPING"
                    selectedValue={deliveryMethod}
                    register={register("delivery_method")}
                  />
                  <DeliveryOption
                    label="تحویل حضوری"
                    description="بعد از هماهنگی، سفارش را حضوری دریافت می‌کنی."
                    price="رایگان"
                    value="PICKUP"
                    selectedValue={deliveryMethod}
                    register={register("delivery_method")}
                  />
                </div>

                {deliveryMethod === "PICKUP" && (
                  <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm font-bold leading-7 text-[var(--secondary)]">
                    {PICKUP_ADDRESS}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-black text-[var(--dark)]">روش پرداخت</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((method) => (
                    <PaymentMethodOption
                      key={method.code}
                      method={method}
                      selectedValue={paymentMethod}
                      register={register("payment_method")}
                    />
                  ))}
                </div>
                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm font-bold leading-7 text-yellow-800">
                  {IN_PERSON_PAYMENT_INSTRUCTIONS}
                </div>
              </section>

              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <h2 className="text-xl font-black text-[var(--dark)]">آیتم‌های سفارش</h2>
                <p className="mt-2 text-sm font-bold text-gray-500">
                  {preview.total_quantity.toLocaleString("fa-IR")} آیتم در سفارش
                </p>
              </div>

              {preview.items.map((item) => (
                <CheckoutItem key={item.product_id} item={item} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-black text-[var(--dark)]">خلاصه پرداخت</h2>

          <div className="mt-5 space-y-3 border-b border-gray-100 pb-5 text-sm font-bold text-gray-600">
            <SummaryRow label="جمع کالاها" value={`${formatPrice(preview?.subtotal || 0)} تومان`} />
            <SummaryRow
              label={preview?.delivery_method_title || "هزینه ارسال"}
              value={`${formatPrice(preview?.shipping_cost || 0)} تومان`}
            />
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="text-sm font-bold text-gray-500">مبلغ نهایی</span>
            <span className="text-2xl font-black text-[var(--dark)]">
              {formatPrice(preview?.total_amount || 0)} تومان
            </span>
          </div>

          <div className="mt-5 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm font-bold leading-7 text-[var(--secondary)]">
            اطلاعات گیرنده و روش تحویل به صورت موقت ذخیره می‌شود و در مرحله ساخت سفارش استفاده خواهد شد.
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={!isValid || !preview || isSubmitting || isLoading}
              onClick={() => void handleSubmit(submitOrder)()}
              className={`inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full px-6 text-sm font-black ${
                isValid && preview && !isSubmitting && !isLoading
                  ? "cursor-pointer bg-[var(--primary)] text-white shadow-lg shadow-pink-900/20 transition hover:opacity-90"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {isSubmitting ? "در حال ثبت سفارش..." : "ثبت سفارش"}
            </button>
            {submitError && (
              <p className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-bold leading-6 text-red-700">
                {submitError}
              </p>
            )}
            <Link
              href="/cart"
              className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
            >
              ویرایش سبد خرید
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}

function CheckoutField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[var(--dark)]">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <span className="mt-2 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `h-12 w-full rounded-lg border bg-white px-4 text-sm font-medium text-[var(--dark)] outline-none transition placeholder:text-gray-400 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-gray-200 focus:border-[var(--primary)] focus:ring-pink-100"
  }`;
}

function DeliveryOption({
  label,
  description,
  price,
  value,
  selectedValue,
  register,
}: {
  label: string;
  description: string;
  price: string;
  value: CheckoutDeliveryMethod;
  selectedValue: CheckoutDeliveryMethod;
  register: UseFormRegisterReturn<"delivery_method">;
}) {
  const isSelected = selectedValue === value;

  return (
    <label
      className={`cursor-pointer rounded-lg border p-4 transition ${
        isSelected
          ? "border-[var(--primary)] bg-pink-50"
          : "border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50"
      }`}
    >
      <input type="radio" value={value} className="sr-only" {...register} />
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-base font-black text-[var(--dark)]">{label}</span>
          <span className="mt-2 block text-sm leading-6 text-gray-600">{description}</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-[var(--secondary)] shadow-sm">
          {price}
        </span>
      </span>
    </label>
  );
}

function PaymentMethodOption({
  method,
  selectedValue,
  register,
}: {
  method: PaymentMethod;
  selectedValue: PaymentMethodCode;
  register: UseFormRegisterReturn<"payment_method">;
}) {
  const isSelected = selectedValue === method.code;
  const isDisabled = !method.is_active;

  return (
    <label
      className={`rounded-lg border p-4 transition ${
        isDisabled
          ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-70"
          : isSelected
            ? "cursor-pointer border-[var(--primary)] bg-pink-50"
            : "cursor-pointer border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50"
      }`}
    >
      <input
        type="radio"
        value={method.code}
        disabled={isDisabled}
        className="sr-only"
        {...register}
      />
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-base font-black text-[var(--dark)]">{method.title}</span>
          <span className="mt-2 block text-sm leading-6 text-gray-600">
            {method.description}
          </span>
        </span>
        {!method.is_active && (
          <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-black text-gray-500 shadow-sm">
            به‌زودی
          </span>
        )}
      </span>
    </label>
  );
}

function CheckoutItem({ item }: { item: CheckoutPreview["items"][number] }) {
  return (
    <article className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr] sm:items-center">
      <Link
        href={`/products/${item.slug}`}
        className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-sky-50 via-white to-pink-50"
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-black text-[var(--secondary)]">
            چاپ
          </div>
        )}
      </Link>

      <div className="min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="line-clamp-1 text-lg font-black text-[var(--dark)] transition hover:text-[var(--primary)]"
        >
          {item.title}
        </Link>

        <div className="mt-4 grid gap-3 text-sm font-bold text-gray-600 sm:grid-cols-3">
          <SummaryPill label="تعداد" value={item.quantity.toLocaleString("fa-IR")} />
          <SummaryPill label="قیمت واحد" value={`${formatPrice(item.unit_price)} تومان`} />
          <SummaryPill label="جمع ردیف" value={`${formatPrice(item.line_total)} تومان`} />
        </div>
      </div>
    </article>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-black text-[var(--dark)]">{value}</p>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-[120px_1fr]"
        >
          <div className="aspect-[4/3] animate-pulse rounded-lg bg-gray-100" />
          <div>
            <div className="h-6 w-56 max-w-full animate-pulse rounded bg-gray-100" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-16 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
