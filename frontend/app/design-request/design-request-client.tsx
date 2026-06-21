"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  createDesignRequest,
  type DesignRequest,
  type UploadedFileResponse,
  uploadDesignFile,
} from "@/lib/design-request-api";
import { getApiErrorMessage } from "@/lib/api";
import { getProduct, type Product } from "@/lib/products-api";

const STORAGE_KEY = "chapichap.design-request.v1";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];

const orderTypes = [
  { value: "gift", label: "هدیه اختصاصی", hint: "برای ماگ، تیشرت و هدیه شخصی" },
  { value: "print", label: "طرح آماده چاپ", hint: "برای آماده‌سازی فایل چاپی" },
  { value: "logo", label: "طراحی لوگو", hint: "برای هویت بصری و برند" },
  { value: "consulting", label: "مشاوره طراحی", hint: "برای انتخاب مسیر درست" },
  { value: "other", label: "سایر", hint: "برای ایده‌های متفاوت" },
] as const;

const designRequestSchema = z.object({
  product_id: z.number().nullable().optional(),
  order_type: z.enum(["gift", "print", "logo", "consulting", "other"]),
  description: z
    .string()
    .trim()
    .min(20, "حداقل ۲۰ کاراکتر درباره نیازت بنویس."),
  uploaded_file_id: z.number().nullable().optional(),
  contact_name: z.string().trim().min(2, "نام را کامل‌تر وارد کن."),
  contact_phone: z
    .string()
    .trim()
    .min(8, "شماره تماس معتبر وارد کن.")
    .regex(/^[0-9۰-۹٠-٩+\-()\s]+$/, "شماره تماس معتبر وارد کن."),
  contact_email: z
    .string()
    .trim()
    .email("ایمیل معتبر وارد کن.")
    .optional()
    .or(z.literal("")),
});

type DesignRequestFormValues = z.infer<typeof designRequestSchema>;

type DraftPayload = {
  values: DesignRequestFormValues;
  uploadedFile: UploadedFileResponse | null;
  selectedProduct: Product | null;
};

const defaultValues: DesignRequestFormValues = {
  product_id: null,
  order_type: "gift",
  description: "",
  uploaded_file_id: null,
  contact_name: "",
  contact_phone: "",
  contact_email: "",
};

const steps = [
  { title: "نوع سفارش", fields: ["order_type"] },
  { title: "شرح نیاز", fields: ["description"] },
  { title: "فایل", fields: ["uploaded_file_id"] },
  { title: "تماس", fields: ["contact_name", "contact_phone", "contact_email"] },
  { title: "تایید", fields: [] },
] as const;

function readStoredDraft() {
  if (typeof window === "undefined") return null;

  try {
    const rawDraft = window.localStorage.getItem(STORAGE_KEY);
    return rawDraft ? (JSON.parse(rawDraft) as DraftPayload) : null;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024).toLocaleString("fa-IR")} کیلوبایت`;
  return `${(size / (1024 * 1024)).toFixed(1).toLocaleString()} مگابایت`;
}

function isImageFile(file: UploadedFileResponse) {
  return file.content_type.startsWith("image/");
}

export default function DesignRequestClient() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const [initialDraft] = useState<DraftPayload | null>(readStoredDraft);

  const [step, setStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    initialDraft?.selectedProduct || null
  );
  const [productError, setProductError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFileResponse | null>(
    initialDraft?.uploadedFile || null
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdRequest, setCreatedRequest] = useState<DesignRequest | null>(null);

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    setValue,
    trigger,
  } = useForm<DesignRequestFormValues>({
    resolver: zodResolver(designRequestSchema),
    mode: "onChange",
    defaultValues: { ...defaultValues, ...initialDraft?.values },
  });

  const watchedValues = useWatch({ control });
  const progress = ((step + 1) / steps.length) * 100;
  const currentStep = steps[step];

  const selectedOrderType = useMemo(() => {
    const value = watchedValues.order_type || defaultValues.order_type;
    return orderTypes.find((item) => item.value === value) || orderTypes[0];
  }, [watchedValues.order_type]);

  useEffect(() => {
    if (!productSlug) return;

    let isMounted = true;

    async function loadProduct() {
      setProductError("");

      try {
        const product = await getProduct(productSlug as string);
        if (!isMounted) return;
        setSelectedProduct(product);
        setValue("product_id", product.id, { shouldDirty: true });
      } catch {
        if (isMounted) setProductError("محصول انتخاب‌شده پیدا نشد، اما می‌توانی درخواست را بدون محصول ثبت کنی.");
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productSlug, setValue]);

  useEffect(() => {
    if (createdRequest) return;

    const draft: DraftPayload = {
      values: { ...defaultValues, ...watchedValues } as DesignRequestFormValues,
      uploadedFile,
      selectedProduct,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [createdRequest, selectedProduct, uploadedFile, watchedValues]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function goNext() {
    const fields = [...currentStep.fields] as (keyof DesignRequestFormValues)[];
    const isValid = fields.length === 0 ? true : await trigger(fields);

    if (!isValid) return;
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setStep((value) => Math.max(value - 1, 0));
  }

  function validateFile(file: File) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "فرمت فایل مجاز نیست. JPG، PNG، WebP، PDF یا ZIP ارسال کن.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "حجم فایل نباید بیشتر از ۱۰ مگابایت باشد.";
    }

    return "";
  }

  async function handleFile(file: File) {
    const error = validateFile(file);
    setUploadError(error);

    if (error) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    setIsUploading(true);

    try {
      const response = await uploadDesignFile(file);
      setUploadedFile(response);
      setValue("uploaded_file_id", response.id, { shouldDirty: true, shouldValidate: true });
    } catch (uploadException) {
      setUploadedFile(null);
      setValue("uploaded_file_id", null, { shouldDirty: true });
      setUploadError(getApiErrorMessage(uploadException));
    } finally {
      setIsUploading(false);
    }
  }

  function removeUploadedFile() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setUploadedFile(null);
    setUploadError("");
    setValue("uploaded_file_id", null, { shouldDirty: true });
  }

  async function submitForm(values: DesignRequestFormValues) {
    setSubmitError("");

    try {
      const request = await createDesignRequest({
        ...values,
        product_id: selectedProduct?.id || values.product_id || null,
        uploaded_file_id: uploadedFile?.id || values.uploaded_file_id || null,
        contact_email: values.contact_email || "",
      });

      setCreatedRequest(request);
      window.localStorage.removeItem(STORAGE_KEY);
      setStep(steps.length - 1);
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  if (createdRequest) {
    return <DesignRequestSuccess request={createdRequest} uploadedFile={uploadedFile} />;
  }

  return (
    <main className="bg-white">
      <section className="border-b border-gray-100 bg-gradient-to-b from-sky-50/80 to-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-black text-[var(--secondary)]">سفارش طراحی اختصاصی</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black leading-tight text-[var(--dark)] sm:text-5xl">
                ایده‌ات را برای چاپ آماده کنیم
              </h1>
              <p className="mt-4 max-w-2xl leading-8 text-gray-600">
                مسیر ثبت درخواست کوتاه است و وضعیت اولیه بعد از ثبت نمایش داده می‌شود.
              </p>
            </div>
            <Link
              href="/cart"
              className="inline-flex h-12 w-fit items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
            >
              مشاهده سبد خرید
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-28">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[var(--primary)] to-[var(--secondary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 grid gap-2">
            {steps.map((item, index) => {
              const isActive = index === step;
              const isDone = index < step;

              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-right transition ${
                    isActive
                      ? "border-sky-200 bg-sky-50 text-[var(--secondary)]"
                      : "border-transparent bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      isDone
                        ? "bg-[var(--secondary)] text-white"
                        : isActive
                          ? "bg-white text-[var(--secondary)]"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {isDone ? "✓" : (index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="text-sm font-black">{item.title}</span>
                </button>
              );
            })}
          </div>

          {selectedProduct && (
            <div className="mt-5 rounded-lg border border-sky-100 bg-sky-50/70 p-4">
              <p className="text-xs font-black text-[var(--secondary)]">محصول انتخاب‌شده</p>
              <p className="mt-2 line-clamp-2 text-sm font-black text-[var(--dark)]">
                {selectedProduct.title}
              </p>
            </div>
          )}

          {productError && (
            <p className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs font-bold leading-6 text-yellow-800">
              {productError}
            </p>
          )}
        </aside>

        <form
          onSubmit={handleSubmit(submitForm)}
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {step === 0 && (
            <div>
              <StepTitle eyebrow="مرحله اول" title="نوع سفارش را انتخاب کن" />
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {orderTypes.map((item) => (
                  <label
                    key={item.value}
                    className={`cursor-pointer rounded-lg border p-4 transition ${
                      watchedValues.order_type === item.value
                        ? "border-[var(--primary)] bg-pink-50"
                        : "border-gray-200 bg-white hover:border-sky-200 hover:bg-sky-50/60"
                    }`}
                  >
                    <input
                      type="radio"
                      value={item.value}
                      className="sr-only"
                      {...register("order_type")}
                    />
                    <span className="block text-base font-black text-[var(--dark)]">
                      {item.label}
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-gray-600">{item.hint}</span>
                  </label>
                ))}
              </div>
              {errors.order_type && (
                <p className="mt-3 text-sm font-bold text-red-600">{errors.order_type.message}</p>
              )}
            </div>
          )}

          {step === 1 && (
            <div>
              <StepTitle eyebrow={selectedOrderType.label} title="نیازت را دقیق‌تر بنویس" />
              <textarea
                {...register("description")}
                rows={9}
                placeholder="مثلاً: یک طرح برای چاپ روی ماگ می‌خواهم؛ متن فارسی دارد، رنگ‌های شاد باشد، فایل لوگو را هم آپلود می‌کنم."
                className={`mt-6 w-full resize-none rounded-lg border bg-white px-4 py-3 text-sm leading-8 text-[var(--dark)] outline-none transition placeholder:text-gray-400 focus:ring-4 ${
                  errors.description
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-[var(--primary)] focus:ring-pink-100"
                }`}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="font-bold text-gray-500">
                  {(watchedValues.description || "").length.toLocaleString("fa-IR")} کاراکتر
                </span>
                {errors.description && (
                  <span className="font-bold text-red-600">{errors.description.message}</span>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <StepTitle eyebrow="آپلود فایل" title="فایل مرجع یا طرح را اضافه کن" />
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files.item(0);
                  if (file) void handleFile(file);
                }}
                className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-sky-200 bg-sky-50/60 px-5 py-10 text-center transition hover:border-[var(--secondary)] hover:bg-sky-50"
              >
                <span className="text-lg font-black text-[var(--dark)]">
                  فایل را اینجا رها کن یا انتخاب کن
                </span>
                <span className="mt-3 text-sm font-bold text-gray-500">
                  JPG، PNG، WebP، PDF یا ZIP تا ۱۰ مگابایت
                </span>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <label className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full bg-[var(--secondary)] px-6 text-sm font-black text-white transition hover:opacity-90">
                    انتخاب فایل
                    <input
                      type="file"
                      className="sr-only"
                      accept={ALLOWED_FILE_TYPES.join(",")}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleFile(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                  <label className="inline-flex h-12 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]">
                    گرفتن عکس
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      capture="environment"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void handleFile(file);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm font-black text-[var(--secondary)]">
                  فایل در حال آپلود است...
                </div>
              )}

              {uploadError && (
                <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {uploadError}
                </div>
              )}

              {uploadedFile && (
                <div className="mt-5 grid gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gray-50 text-sm font-black text-[var(--secondary)]">
                    {previewUrl && isImageFile(uploadedFile) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewUrl} alt={uploadedFile.original_name} className="h-full w-full object-cover" />
                    ) : (
                      "فایل"
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-black text-[var(--dark)]">
                      {uploadedFile.original_name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-500">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeUploadedFile}
                    className="h-10 rounded-full border border-red-100 bg-red-50 px-4 text-sm font-black text-red-600 transition hover:bg-red-100"
                  >
                    حذف فایل
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <StepTitle eyebrow="اطلاعات تماس" title="برای پیگیری درخواست" />
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="نام و نام خانوادگی" error={errors.contact_name?.message}>
                  <input
                    {...register("contact_name")}
                    className={inputClass(Boolean(errors.contact_name))}
                    placeholder="نام شما"
                  />
                </Field>
                <Field label="شماره تماس" error={errors.contact_phone?.message}>
                  <input
                    {...register("contact_phone")}
                    inputMode="tel"
                    className={inputClass(Boolean(errors.contact_phone))}
                    placeholder="0912..."
                  />
                </Field>
                <Field label="ایمیل" error={errors.contact_email?.message}>
                  <input
                    {...register("contact_email")}
                    inputMode="email"
                    className={inputClass(Boolean(errors.contact_email))}
                    placeholder="name@example.com"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <StepTitle eyebrow="تایید نهایی" title="درخواست آماده ثبت است" />
              <div className="mt-6 grid gap-4">
                <ReviewRow label="نوع سفارش" value={selectedOrderType.label} />
                {selectedProduct && <ReviewRow label="محصول" value={selectedProduct.title} />}
                <ReviewRow label="شرح نیاز" value={getValues("description")} />
                <ReviewRow label="فایل" value={uploadedFile?.original_name || "بدون فایل"} />
                <ReviewRow label="نام" value={getValues("contact_name")} />
                <ReviewRow label="شماره تماس" value={getValues("contact_phone")} />
                <ReviewRow label="ایمیل" value={getValues("contact_email") || "ثبت نشده"} />
              </div>
              {submitError && (
                <div className="mt-5 rounded-lg border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                  {submitError}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0 || isSubmitting}
              className="h-12 rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-gray-700 transition hover:border-[var(--secondary)] hover:text-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              برگشت
            </button>

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => void goNext()}
                disabled={isUploading}
                className="h-12 rounded-full bg-[var(--secondary)] px-7 text-sm font-black text-white shadow-lg shadow-sky-900/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                ادامه
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="h-12 rounded-full bg-[var(--primary)] px-7 text-sm font-black text-white shadow-lg shadow-pink-900/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "در حال ثبت..." : "ثبت درخواست"}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

function StepTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-black text-[var(--secondary)]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-[var(--dark)] sm:text-3xl">{title}</h2>
    </div>
  );
}

function Field({
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

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-black text-gray-500">{label}</p>
      <p className="mt-2 whitespace-pre-line break-words text-sm font-bold leading-7 text-[var(--dark)]">
        {value}
      </p>
    </div>
  );
}

function DesignRequestSuccess({
  request,
  uploadedFile,
}: {
  request: DesignRequest;
  uploadedFile: UploadedFileResponse | null;
}) {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-2xl font-black text-[var(--secondary)]">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-black text-[var(--dark)]">درخواست ثبت شد</h1>
        <p className="mt-4 leading-8 text-gray-600">
          کد درخواست #{request.id.toLocaleString("fa-IR")} با وضعیت «{request.status_label}» ثبت شد.
        </p>

        <div className="mt-8 grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-5 text-right">
          <ReviewRow label="نوع سفارش" value={request.order_type_label} />
          <ReviewRow label="شماره تماس" value={request.contact_phone} />
          <ReviewRow label="فایل" value={uploadedFile?.original_name || request.uploaded_file?.original_name || "بدون فایل"} />
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex h-12 items-center justify-center rounded-full border border-gray-200 bg-white px-6 text-sm font-black text-[var(--dark)] transition hover:border-[var(--secondary)] hover:text-[var(--secondary)]"
          >
            مشاهده محصولات
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--primary)] px-6 text-sm font-black text-white transition hover:opacity-90"
          >
            رفتن به سبد خرید
          </Link>
        </div>
      </section>
    </main>
  );
}
