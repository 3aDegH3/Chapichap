"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import {
  getAddresses,
  validateOffer,
  type CustomerAddress,
  type ValidatedOffer,
} from "@/lib/account-api";
import {
  createOrder,
  getCheckoutPreview,
  type CheckoutPreview,
  type CheckoutCartItemPayload,
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
  save_address: z.boolean(),
  address_title: z.string().trim().optional(),
  coupon_code: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;
type AddressMode = "saved" | "new";

const defaultCheckoutValues: CheckoutFormValues = {
  receiver_name: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  postal_code: "",
  delivery_method: "SHIPPING",
  payment_method: "IN_PERSON",
  save_address: false,
  address_title: "",
  coupon_code: "",
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

function toCheckoutItems(
  items: ReturnType<typeof useCart>["items"]
): CheckoutCartItemPayload[] {
  return items.map((item) => ({
    product_id: item.product.id,
    quantity: item.quantity,
  }));
}

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart, isReady, items, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [initialDraft] = useState<CheckoutFormValues | null>(readCheckoutDraft);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressMode, setAddressMode] = useState<AddressMode>("saved");
  const [offer, setOffer] = useState<ValidatedOffer | null>(null);
  const [offerError, setOfferError] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const {
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
    setValue,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: { ...defaultCheckoutValues, ...initialDraft },
  });

  const watchedValues = useWatch({ control });
  const deliveryMethod = watchedValues.delivery_method || "SHIPPING";
  const paymentMethod = watchedValues.payment_method || "IN_PERSON";
  const couponCode = watchedValues.coupon_code || "";
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || null;
  const shouldShowAddressForm = addressMode === "new" || !isAuthenticated || addresses.length === 0;

  const loadPreview = useCallback(async (method: CheckoutDeliveryMethod) => {
    setIsLoading(true);
    setError("");

    try {
      setOffer(null);
      setOfferError("");
      const data = await getCheckoutPreview(method, toCheckoutItems(items));
      setPreview(data);
    } catch (previewError) {
      setError(getApiErrorMessage(previewError));
    } finally {
      setIsLoading(false);
    }
  }, [items]);

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

  const applyAddress = useCallback((address: CustomerAddress) => {
    setAddressMode("saved");
    setSelectedAddressId(address.id);
    setValue("receiver_name", address.receiver_name, { shouldValidate: true });
    setValue("phone", address.phone, { shouldValidate: true });
    setValue("province", address.province, { shouldValidate: true });
    setValue("city", address.city, { shouldValidate: true });
    setValue("address", address.address, { shouldValidate: true });
    setValue("postal_code", address.postal_code, { shouldValidate: true });
  }, [setValue]);

  const useNewAddress = useCallback(() => {
    setAddressMode("new");
    setSelectedAddressId(null);
    setValue("receiver_name", "", { shouldValidate: true });
    setValue("phone", "", { shouldValidate: true });
    setValue("province", "", { shouldValidate: true });
    setValue("city", "", { shouldValidate: true });
    setValue("address", "", { shouldValidate: true });
    setValue("postal_code", "", { shouldValidate: true });
    setValue("save_address", Boolean(isAuthenticated));
    setValue("address_title", "");
  }, [isAuthenticated, setValue]);

  const loadAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      setAddressMode("new");
      return;
    }

    try {
      const data = await getAddresses();
      setAddresses(data.addresses);

      if (data.addresses.length === 0) {
        setAddressMode("new");
        return;
      }

      const defaultAddress = data.addresses.find((address) => address.is_default) || data.addresses[0];
      if (addressMode === "saved" && defaultAddress && !selectedAddressId) {
        applyAddress(defaultAddress);
      }
    } catch {
      setAddresses([]);
    }
  }, [addressMode, applyAddress, isAuthenticated, selectedAddressId]);

  useEffect(() => {
    if (!isReady) return;

    if (totalItems === 0) {
      router.replace("/cart");
      return;
    }

    const timeout = window.setTimeout(() => {
      void loadPreview(deliveryMethod);
      void loadPaymentMethods();
      void loadAddresses();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [deliveryMethod, isReady, loadAddresses, loadPaymentMethods, loadPreview, router, totalItems]);

  useEffect(() => {
    window.localStorage.setItem(
      CHECKOUT_STORAGE_KEY,
      JSON.stringify({ ...defaultCheckoutValues, ...watchedValues })
    );
  }, [watchedValues]);

  async function applyCoupon() {
    if (!preview || !couponCode.trim()) {
      setOffer(null);
      setOfferError("");
      return;
    }

    setOffer(null);
    setOfferError("");

    try {
      const data = await validateOffer({
        coupon_code: couponCode.trim(),
        order_amount: preview.total_amount,
        shipping_cost: preview.shipping_cost,
      });
      setOffer(data);
    } catch (couponError) {
      setOfferError(getApiErrorMessage(couponError));
    }
  }

  async function submitOrder(values: CheckoutFormValues) {
    setSubmitError("");

    try {
      const order = await createOrder({
        address_id: selectedAddressId,
        ...values,
        coupon_code: offer ? values.coupon_code?.trim() : "",
        notes: values.notes || "",
        items: toCheckoutItems(items),
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

  const discountAmount = offer ? Number(offer.discount_amount) || 0 : 0;
  const payableTotal = Math.max(Number(preview?.total_amount || 0) - discountAmount, 0);

  return (
    <main className="bg-[#FAFAF8]">
      <section className="border-b border-[#E3DED5] bg-[#F2EEE6]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[#B2894C]">تسویه حساب</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight text-[#333230] sm:text-5xl">
                مرور نهایی سفارش
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-8 text-[#77736D]">
                مبلغ‌ها از سمت سرور محاسبه و تأیید می‌شوند تا سفارش با قیمت درست ثبت شود.
              </p>
            </div>
            <Link
              href="/cart"
              className="inline-flex h-12 w-fit items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
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
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <h2 className="text-lg font-black text-red-700">امکان نمایش Checkout نیست</h2>
              <p className="mt-3 text-sm font-bold leading-7 text-red-700">{error}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void loadPreview(deliveryMethod)}
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-6 text-sm font-black text-[#333230] transition hover:-translate-y-0.5 hover:bg-[#B2894C]"
                >
                  تلاش دوباره
                </button>
                <Link
                  href="/cart"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-red-200 bg-white px-6 text-sm font-black text-red-700"
                >
                  بازگشت به سبد خرید
                </Link>
              </div>
            </div>
          ) : preview ? (
            <div className="space-y-6">
              <section className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-[#333230]">آدرس تحویل</h2>
                    <p className="mt-2 text-sm font-bold leading-7 text-[#77736D]">
                      آدرس پیش‌فرض پنل کاربری به صورت خودکار انتخاب می‌شود.
                    </p>
                  </div>

                  {isAuthenticated && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={useNewAddress}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-4 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
                    >
                      آدرس جدید
                    </button>
                  )}
                </div>

                {isAuthenticated && addresses.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-[#D2AD70]/35 bg-[#F6F1E8] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-black text-[#B2894C]">آدرس‌های ذخیره‌شده</p>
                      {selectedAddress && addressMode === "saved" && (
                        <span className="text-xs font-black text-[#77736D]">
                          آدرس انتخاب‌شده: {selectedAddress.title}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          type="button"
                          onClick={() => applyAddress(address)}
                          className={`rounded-lg border p-4 text-right text-sm transition ${
                            addressMode === "saved" && selectedAddressId === address.id
                              ? "border-[#D2AD70] bg-white text-[#333230] shadow-[0_12px_26px_-22px_rgba(51,50,48,0.65)]"
                              : "border-[#E3DED5] bg-white/75 text-[#77736D] hover:border-[#D2AD70]"
                          }`}
                        >
                          <span className="flex flex-wrap items-center gap-2 font-black">
                            {address.title}
                            {address.is_default && (
                              <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] text-green-700">
                                پیش‌فرض
                              </span>
                            )}
                          </span>
                          <span className="mt-2 block font-bold leading-7">
                            {address.receiver_name}، {address.phone}
                          </span>
                          <span className="mt-2 block font-bold leading-7">
                            {address.province}، {address.city}، {address.address}
                          </span>
                          <span className="mt-2 block text-xs font-bold text-[#77736D]">
                            کد پستی: {address.postal_code}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {shouldShowAddressForm ? (
                  <div className="mt-5 rounded-2xl border border-[#E3DED5] bg-[#FAFAF8] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-base font-black text-[#333230]">ثبت آدرس جدید</p>
                        <p className="mt-1 text-sm font-bold text-[#77736D]">
                          این آدرس برای همین سفارش استفاده می‌شود و در صورت انتخاب، ذخیره هم می‌شود.
                        </p>
                      </div>
                      {addresses.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const defaultAddress =
                              addresses.find((address) => address.is_default) || addresses[0];
                            if (defaultAddress) applyAddress(defaultAddress);
                          }}
                          className="h-10 rounded-xl border border-[#E3DED5] bg-white px-4 text-xs font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
                        >
                          بازگشت به آدرس‌های ذخیره‌شده
                        </button>
                      )}
                    </div>

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

                      {isAuthenticated && (
                        <div className="grid gap-4 rounded-xl border border-[#E3DED5] bg-white p-4 sm:grid-cols-[1fr_220px]">
                          <label className="flex items-center gap-3 text-sm font-black text-[#333230]">
                            <input type="checkbox" className="h-5 w-5 rounded border-[#D2AD70]" {...register("save_address")} />
                            این آدرس در پنل ذخیره شود
                          </label>
                          {watchedValues.save_address && (
                            <input
                              {...register("address_title")}
                              className={inputClass(false)}
                              placeholder="عنوان آدرس"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : selectedAddress ? (
                  <div className="mt-5 rounded-2xl border border-[#E3DED5] bg-[#FAFAF8] p-4">
                    <p className="text-sm font-black text-[#333230]">سفارش به این آدرس ارسال می‌شود</p>
                    <p className="mt-2 text-sm font-bold leading-7 text-[#77736D]">
                      {selectedAddress.receiver_name}، {selectedAddress.phone}
                    </p>
                    <p className="mt-1 text-sm font-bold leading-7 text-[#77736D]">
                      {selectedAddress.province}، {selectedAddress.city}، {selectedAddress.address}
                    </p>
                  </div>
                ) : null}

                <div className="mt-5 grid gap-5">
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

              <section className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
                <h2 className="text-xl font-black text-[#333230]">روش تحویل</h2>
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
                  <div className="mt-4 rounded-xl border border-[#D2AD70]/35 bg-[#F6F1E8] p-4 text-sm font-bold leading-7 text-[#B2894C]">
                    {PICKUP_ADDRESS}
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
                <h2 className="text-xl font-black text-[#333230]">روش پرداخت</h2>
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
                <div className="mt-4 rounded-xl border border-[#D2AD70]/35 bg-[#F6F1E8] p-4 text-sm font-bold leading-7 text-[#77736D]">
                  {IN_PERSON_PAYMENT_INSTRUCTIONS}
                </div>
              </section>

              <div className="rounded-2xl border border-[#E3DED5] bg-white p-5 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)]">
                <h2 className="text-xl font-black text-[#333230]">آیتم‌های سفارش</h2>
                <p className="mt-2 text-sm font-bold text-[#77736D]">
                  {preview.total_quantity.toLocaleString("fa-IR")} آیتم در سفارش
                </p>
              </div>

              {preview.items.map((item) => (
                <CheckoutItem key={item.product_id} item={item} />
              ))}
            </div>
          ) : null}
        </div>

        <aside className="h-fit rounded-2xl border border-[#D8CFC0] bg-white p-5 shadow-[0_20px_55px_-38px_rgba(51,50,48,0.75)] lg:sticky lg:top-28">
          <p className="text-sm font-black text-[#B2894C]">مرحله نهایی</p>
          <h2 className="mt-2 text-xl font-black text-[#333230]">خلاصه پرداخت</h2>

          {isAuthenticated && (
            <div className="mt-5 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] p-4">
              <label className="block">
                <span className="text-sm font-black text-[#333230]">کد پیشنهاد</span>
                <div className="mt-2 flex gap-2">
                  <input
                    {...register("coupon_code")}
                    className={inputClass(false)}
                    placeholder="کد تخفیف"
                  />
                  <button
                    type="button"
                    onClick={() => void applyCoupon()}
                    disabled={!preview || !couponCode.trim()}
                    className="h-12 shrink-0 rounded-xl bg-[#D2AD70] px-4 text-xs font-black text-[#333230] transition hover:bg-[#B2894C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    اعمال
                  </button>
                </div>
              </label>
              {offer && (
                <p className="mt-3 text-xs font-black text-green-700">
                  {offer.offer.title} اعمال شد.
                </p>
              )}
              {offerError && (
                <p className="mt-3 text-xs font-black text-red-700">{offerError}</p>
              )}
            </div>
          )}

          <div className="mt-5 space-y-3 border-b border-[#E3DED5] pb-5 text-sm font-bold text-[#77736D]">
            <SummaryRow label="جمع کالاها" value={`${formatPrice(preview?.subtotal || 0)} تومان`} />
            <SummaryRow
              label={preview?.delivery_method_title || "هزینه ارسال"}
              value={`${formatPrice(preview?.shipping_cost || 0)} تومان`}
            />
            {discountAmount > 0 && (
              <SummaryRow label="تخفیف" value={`${formatPrice(discountAmount)} تومان`} />
            )}
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="text-sm font-bold text-[#77736D]">مبلغ نهایی</span>
            <span className="text-2xl font-black text-[#333230]">
              {formatPrice(payableTotal)} تومان
            </span>
          </div>

          <div className="mt-5 rounded-xl border border-[#E3DED5] bg-[#FAFAF8] p-4 text-xs font-bold leading-6 text-[#77736D]">
            اطلاعات گیرنده و روش تحویل به صورت موقت ذخیره می‌شود و در مرحله ساخت سفارش استفاده خواهد شد.
          </div>

          <div className="mt-6 grid gap-3">
            <button
              type="button"
              disabled={!isValid || !preview || isSubmitting || isLoading}
              onClick={() => void handleSubmit(submitOrder)()}
              className={`inline-flex h-12 cursor-not-allowed items-center justify-center rounded-xl px-6 text-sm font-black ${
                isValid && preview && !isSubmitting && !isLoading
                  ? "cursor-pointer bg-[#D2AD70] text-[#333230] shadow-[0_16px_30px_-22px_rgba(51,50,48,0.85)] transition hover:-translate-y-0.5 hover:bg-[#B2894C]"
                  : "bg-[#E3DED5] text-[#77736D]"
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
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E3DED5] bg-white px-6 text-sm font-black text-[#333230] transition hover:border-[#D2AD70] hover:bg-[#F6F1E8]"
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
      <span className="text-sm font-black text-[#333230]">{label}</span>
      <div className="mt-2">{children}</div>
      {error && <span className="mt-2 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return `h-12 w-full rounded-xl border bg-white px-4 text-sm font-medium text-[#333230] outline-none transition placeholder:text-gray-400 focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-[#E3DED5] focus:border-[#D2AD70] focus:ring-[#D2AD70]/20"
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
      className={`cursor-pointer rounded-xl border p-4 transition ${
        isSelected
          ? "border-[#D2AD70] bg-[#F6F1E8]"
          : "border-[#E3DED5] bg-white hover:border-[#D2AD70] hover:bg-[#FAFAF8]"
      }`}
    >
      <input type="radio" value={value} className="sr-only" {...register} />
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-base font-black text-[#333230]">{label}</span>
          <span className="mt-2 block text-sm font-medium leading-6 text-[#77736D]">{description}</span>
        </span>
        <span className="shrink-0 rounded-lg border border-[#E3DED5] bg-white px-3 py-1 text-xs font-black text-[#B2894C] shadow-sm">
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
      className={`rounded-xl border p-4 transition ${
        isDisabled
          ? "cursor-not-allowed border-[#E3DED5] bg-[#FAFAF8] opacity-70"
          : isSelected
            ? "cursor-pointer border-[#D2AD70] bg-[#F6F1E8]"
            : "cursor-pointer border-[#E3DED5] bg-white hover:border-[#D2AD70] hover:bg-[#FAFAF8]"
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
          <span className="block text-base font-black text-[#333230]">{method.title}</span>
          <span className="mt-2 block text-sm font-medium leading-6 text-[#77736D]">
            {method.description}
          </span>
        </span>
        {!method.is_active && (
          <span className="shrink-0 rounded-lg border border-[#E3DED5] bg-white px-3 py-1 text-xs font-black text-[#77736D] shadow-sm">
            به‌زودی
          </span>
        )}
      </span>
    </label>
  );
}

function CheckoutItem({ item }: { item: CheckoutPreview["items"][number] }) {
  return (
    <article className="grid gap-4 rounded-2xl border border-[#E3DED5] bg-white p-4 shadow-[0_18px_45px_-36px_rgba(51,50,48,0.7)] sm:grid-cols-[120px_1fr] sm:items-center">
      <Link
        href={`/products/${item.slug}`}
        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#E3DED5] bg-[#F6F1E8]"
      >
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-black text-[#B2894C]">
            چاپ
          </div>
        )}
      </Link>

      <div className="min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="line-clamp-1 text-lg font-black text-[#333230] transition hover:text-[#B2894C]"
        >
          {item.title}
        </Link>

        <div className="mt-4 grid gap-3 text-sm font-bold text-[#77736D] sm:grid-cols-3">
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
      <span className="text-[#333230]">{value}</span>
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E3DED5] bg-[#FAFAF8] px-3 py-3">
      <p className="text-xs text-[#77736D]">{label}</p>
      <p className="mt-1 font-black text-[#333230]">{value}</p>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="grid gap-4 rounded-2xl border border-[#E3DED5] bg-white p-4 sm:grid-cols-[120px_1fr]"
        >
          <div className="aspect-[4/3] animate-pulse rounded-xl bg-[#E3DED5]" />
          <div>
            <div className="h-6 w-56 max-w-full animate-pulse rounded bg-[#E3DED5]" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="h-16 animate-pulse rounded-xl bg-[#E3DED5]" />
              <div className="h-16 animate-pulse rounded-xl bg-[#E3DED5]" />
              <div className="h-16 animate-pulse rounded-xl bg-[#E3DED5]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
