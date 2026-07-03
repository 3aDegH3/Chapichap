"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";
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
  "image/heic",
  "image/heif",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];

type IconProps = SVGProps<SVGSVGElement>;

const orderTypes = [
  {
    value: "print",
    label: "طرح آماده برای چاپ",
    hint: "فایل آماده داری و فقط بررسی، اصلاح یا تنظیم چاپ لازم است.",
    icon: PrintIcon,
  },
  {
    value: "custom_print",
    label: "طراحی اختصاصی برای چاپ",
    hint: "ایده خام داری و می‌خواهی از صفر به فایل آماده چاپ تبدیل شود.",
    icon: PaletteIcon,
  },
  {
    value: "gift",
    label: "هدیه اختصاصی",
    hint: "برای ماگ، پوشاک، قاب، پک هدیه و محصولات شخصی‌سازی‌شده.",
    icon: GiftIcon,
  },
  {
    value: "caricature",
    label: "طراحی کاریکاتور",
    hint: "تبدیل عکس به طراحی متفاوت و مناسب هدیه.",
    icon: FaceIcon,
  },
  {
    value: "consulting",
    label: "مشاوره طراحی",
    hint: "هنوز مسیر دقیق را نمی‌دانی و به پیشنهاد تخصصی نیاز داری.",
    icon: MessageIcon,
  },
  {
    value: "other",
    label: "سفارش متفاوت",
    hint: "برای ایده‌هایی که در دسته‌های بالا قرار نمی‌گیرند.",
    icon: SparklesIcon,
  },
] as const;

const designRequestSchema = z.object({
  product_id: z.number().nullable().optional(),
  order_type: z.enum([
    "print",
    "custom_print",
    "gift",
    "caricature",
    "consulting",
    "other",
  ]),
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
  step: number;
};

const defaultValues: DesignRequestFormValues = {
  product_id: null,
  order_type: "print",
  description: "",
  uploaded_file_id: null,
  contact_name: "",
  contact_phone: "",
  contact_email: "",
};

const steps = [
  {
    title: "نوع سفارش",
    subtitle: "مسیر مناسب را انتخاب کن",
    fields: ["order_type"],
    icon: GridIcon,
  },
  {
    title: "جزئیات و فایل",
    subtitle: "ایده و فایل مرجع را بفرست",
    fields: ["description"],
    icon: FileIcon,
  },
  {
    title: "اطلاعات تماس",
    subtitle: "راه ارتباط برای پیگیری",
    fields: ["contact_name", "contact_phone", "contact_email"],
    icon: UserIcon,
  },
  {
    title: "مرور و ثبت",
    subtitle: "همه چیز را بررسی کن",
    fields: [],
    icon: CheckCircleIcon,
  },
] as const;

function isOrderTypeValue(
  value: string | null,
): value is DesignRequestFormValues["order_type"] {
  return orderTypes.some((item) => item.value === value);
}

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
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024).toLocaleString("fa-IR")} کیلوبایت`;
  }

  const sizeInMegabytes = Number((size / (1024 * 1024)).toFixed(1));

  return `${sizeInMegabytes.toLocaleString("fa-IR")} مگابایت`;
}

function isImageFile(file: UploadedFileResponse) {
  return file.content_type.startsWith("image/");
}

export default function DesignRequestClient() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product");
  const orderTypeParam = searchParams.get("type");

  const [step, setStep] = useState(0);
  const [maxVisitedStep, setMaxVisitedStep] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productError, setProductError] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFileResponse | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdRequest, setCreatedRequest] = useState<DesignRequest | null>(
    null,
  );
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const {
    register,
    control,
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
  } = useForm<DesignRequestFormValues>({
    resolver: zodResolver(designRequestSchema),
    mode: "onChange",
    defaultValues,
  });

  const watchedValues = useWatch({ control });
  const progress = ((step + 1) / steps.length) * 100;
  const currentStep = steps[step];

  const selectedOrderType = useMemo(() => {
    const value = watchedValues.order_type || defaultValues.order_type;
    return orderTypes.find((item) => item.value === value) || orderTypes[0];
  }, [watchedValues.order_type]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const draft = readStoredDraft();
      const nextValues = {
        ...defaultValues,
        ...(draft?.values || {}),
        ...(isOrderTypeValue(orderTypeParam)
          ? { order_type: orderTypeParam }
          : {}),
      };

      if (draft) {
        reset(nextValues);
        setUploadedFile(draft.uploadedFile);
        setSelectedProduct(draft.selectedProduct);
        const restoredStep = Math.min(
          Math.max(Number(draft.step) || 0, 0),
          steps.length - 1,
        );
        setStep(restoredStep);
        setMaxVisitedStep(restoredStep);
      } else if (isOrderTypeValue(orderTypeParam)) {
        reset(nextValues);
      }

      setHasLoadedDraft(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [orderTypeParam, reset]);

  useEffect(() => {
    if (!productSlug) return;

    const selectedProductSlug = productSlug;
    let isMounted = true;

    async function loadProduct() {
      setProductError("");

      try {
        const product = await getProduct(selectedProductSlug);

        if (!isMounted) return;

        setSelectedProduct(product);
        setValue("product_id", product.id, { shouldDirty: true });
      } catch {
        if (isMounted) {
          setProductError(
            "محصول انتخاب‌شده پیدا نشد؛ با این حال می‌توانی درخواست را بدون محصول ادامه بدهی.",
          );
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productSlug, setValue]);

  useEffect(() => {
    if (!hasLoadedDraft || createdRequest) return;

    const draft: DraftPayload = {
      values: {
        ...defaultValues,
        ...watchedValues,
      } as DesignRequestFormValues,
      uploadedFile,
      selectedProduct,
      step,
    };

    const timeout = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [
    createdRequest,
    hasLoadedDraft,
    selectedProduct,
    step,
    uploadedFile,
    watchedValues,
  ]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function goNext() {
    const fields = [...currentStep.fields] as (keyof DesignRequestFormValues)[];
    const isValid = fields.length === 0 ? true : await trigger(fields);

    if (!isValid) return;

    const nextStep = Math.min(step + 1, steps.length - 1);
    setStep(nextStep);
    setMaxVisitedStep((current) => Math.max(current, nextStep));
  }

  function goBack() {
    setStep((value) => Math.max(value - 1, 0));
  }

  function openStep(index: number) {
    if (index > maxVisitedStep) return;
    setStep(index);
  }

  function validateFile(file: File) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "فرمت فایل مجاز نیست. JPG، PNG، WebP، HEIC، PDF یا ZIP ارسال کن.";
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

    setPreviewUrl(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    );
    setIsUploading(true);

    try {
      const response = await uploadDesignFile(file);
      setUploadedFile(response);
      setValue("uploaded_file_id", response.id, {
        shouldDirty: true,
        shouldValidate: true,
      });
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

  function restartRequest() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    window.localStorage.removeItem(STORAGE_KEY);
    reset({
      ...defaultValues,
      ...(isOrderTypeValue(orderTypeParam)
        ? { order_type: orderTypeParam }
        : {}),
      product_id: selectedProduct?.id || null,
    });
    setUploadedFile(null);
    setPreviewUrl("");
    setUploadError("");
    setSubmitError("");
    setStep(0);
    setMaxVisitedStep(0);
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
    } catch (error) {
      setSubmitError(getApiErrorMessage(error));
    }
  }

  if (createdRequest) {
    return (
      <DesignRequestSuccess
        request={createdRequest}
        uploadedFile={uploadedFile}
      />
    );
  }

  return (
    <main className="design-request-page min-h-screen overflow-hidden bg-[#fbfaf7] text-[#302c28]">
      <DesignHero selectedProduct={selectedProduct} />

      <section className="relative">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <span className="absolute -right-40 top-20 h-[420px] w-[420px] rounded-full bg-[#d2ad70]/10 blur-[105px]" />
          <span className="absolute -left-40 bottom-32 h-[420px] w-[420px] rounded-full bg-[#efe2ce]/70 blur-[100px]" />
        </div>

        <div className="relative mx-auto grid w-full max-w-[1560px] gap-7 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[350px_minmax(0,1fr)] lg:px-8 lg:py-16">
          <aside className="h-fit lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[30px] border border-[#e2d8ca] bg-white shadow-[0_28px_70px_-48px_rgba(49,42,34,0.5)]">
              <div className="relative overflow-hidden border-b border-[#e9e1d6] bg-[#302c28] p-6 text-white">
                <span className="pointer-events-none absolute -left-14 -top-14 h-40 w-40 rounded-full bg-[#d2ad70]/20 blur-[55px]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[20px] font-black text-[#e3bd7a]">
                      روند ثبت سفارش
                    </p>
                    <p className="mt-2 text-[22px] font-black leading-9 text-white">
                      مرحله {step + 1} از {steps.length}
                    </p>
                  </div>

                  <span className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.07] text-[#e6bf7c]">
                    <RouteIcon className="h-7 w-7" />
                  </span>
                </div>

                <div className="relative mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="design-progress-bar h-full rounded-full bg-gradient-to-l from-[#e9c783] via-[#d2ad70] to-[#a87638]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="relative mt-3 text-[20px] font-bold text-[#c9beb2]">
                  پیش‌نویس به‌صورت خودکار ذخیره می‌شود.
                </p>
              </div>

              <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-1">
                {steps.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === step;
                  const isDone = index < step || index < maxVisitedStep;
                  const isLocked = index > maxVisitedStep;

                  return (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() => openStep(index)}
                      disabled={isLocked}
                      className={[
                        "group flex min-h-[86px] items-center gap-4 rounded-[20px] border px-4 py-3 text-right outline-none transition-all duration-500",
                        isActive
                          ? "border-[#d2ad70] bg-[#f7efe3] shadow-[0_16px_35px_-28px_rgba(126,85,30,0.55)]"
                          : isLocked
                            ? "cursor-not-allowed border-transparent bg-[#fbfaf7] opacity-55"
                            : "border-transparent bg-white hover:-translate-x-1 hover:border-[#e2d3bb] hover:bg-[#faf5ed]",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "design-step-number flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border transition-all duration-500",
                          isActive
                            ? "border-[#d2ad70] bg-[#d2ad70] text-[#302c28]"
                            : isDone
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-[#e6dfd5] bg-[#f6f2eb] text-[#8a8076]",
                        ].join(" ")}
                      >
                        {isDone && !isActive ? (
                          <CheckIcon className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-[20px] font-black text-[#36312d]">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-[20px] font-bold leading-8 text-[#8a8178]">
                          {item.subtitle}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {(selectedProduct || productError) && (
                <div className="border-t border-[#ece5dc] p-5">
                  {selectedProduct && (
                    <div className="rounded-[20px] border border-[#dbc39a] bg-[#f8f0e3] p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-white text-[#9a682c] shadow-sm">
                          <PackageIcon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[20px] font-black text-[#a16c2a]">
                            محصول انتخاب‌شده
                          </p>
                          <p className="mt-1 line-clamp-2 text-[20px] font-black leading-8 text-[#342f2b]">
                            {selectedProduct.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {productError && (
                    <p className="mt-3 rounded-[16px] border border-amber-200 bg-amber-50 p-4 text-[20px] font-bold leading-8 text-amber-800">
                      {productError}
                    </p>
                  )}
                </div>
              )}

              <div className="border-t border-[#ece5dc] p-4">
                <button
                  type="button"
                  onClick={restartRequest}
                  className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[16px] border border-[#e2d8ca] bg-[#fbfaf7] px-4 text-[20px] font-black text-[#696159] transition-all duration-300 hover:border-[#d2ad70] hover:bg-[#f7efe3] hover:text-[#7f541f]"
                >
                  <RefreshIcon className="h-6 w-6" />
                  شروع دوباره فرم
                </button>
              </div>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit(submitForm)}
            className="overflow-hidden rounded-[32px] border border-[#e2d8ca] bg-white shadow-[0_32px_80px_-52px_rgba(49,42,34,0.55)]"
          >
            <div className="border-b border-[#ece5dc] bg-[linear-gradient(135deg,#fff,#fbf7f0)] px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#302c28] text-[#e3ba75] shadow-[0_14px_30px_-22px_rgba(48,44,40,0.65)]">
                    {(() => {
                      const CurrentIcon = currentStep.icon;
                      return <CurrentIcon className="h-7 w-7" />;
                    })()}
                  </span>

                  <div>
                    <p className="text-[20px] font-black text-[#a16c2a]">
                      مرحله {step + 1}
                    </p>
                    <p className="mt-1 text-[22px] font-black text-[#342f2b]">
                      {currentStep.title}
                    </p>
                  </div>
                </div>

                <div className="inline-flex min-h-[48px] items-center gap-2 self-start rounded-full border border-[#e4d6bf] bg-[#faf3e8] px-5 text-[20px] font-black text-[#805723] sm:self-auto">
                  <SaveIcon className="h-5 w-5" />
                  ذخیره خودکار فعال است
                </div>
              </div>
            </div>

            <div
              key={step}
              className="design-step-panel min-h-[560px] p-5 sm:p-8 lg:p-10"
            >
              {step === 0 && (
                <div>
                  <StepTitle
                    eyebrow="انتخاب مسیر سفارش"
                    title="چه نوع طراحی یا خدماتی نیاز داری؟"
                    description="نزدیک‌ترین گزینه به درخواستت را انتخاب کن. بعداً در توضیحات می‌توانی جزئیات کامل را بنویسی."
                  />

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {orderTypes.map((item) => {
                      const Icon = item.icon;
                      const isSelected =
                        watchedValues.order_type === item.value;

                      return (
                        <label
                          key={item.value}
                          className={[
                            "group relative cursor-pointer overflow-hidden rounded-[24px] border p-5 transition-all duration-500",
                            isSelected
                              ? "-translate-y-1 border-[#c89448] bg-[#f8efe1] shadow-[0_24px_50px_-35px_rgba(127,83,29,0.55)]"
                              : "border-[#e5ddd2] bg-white hover:-translate-y-1 hover:border-[#d7bd91] hover:bg-[#fcf8f2] hover:shadow-[0_22px_48px_-38px_rgba(49,42,34,0.45)]",
                          ].join(" ")}
                        >
                          <input
                            type="radio"
                            value={item.value}
                            className="sr-only"
                            {...register("order_type")}
                          />

                          <span className="pointer-events-none absolute -left-12 -top-12 h-36 w-36 rounded-full bg-[#d2ad70]/0 blur-[45px] transition-colors duration-500 group-hover:bg-[#d2ad70]/12" />

                          <span className="relative flex items-start gap-4">
                            <span
                              className={[
                                "flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border transition-all duration-500",
                                isSelected
                                  ? "border-[#d2ad70] bg-[#d2ad70] text-[#302c28]"
                                  : "border-[#e4d8c5] bg-[#f8f1e6] text-[#99682d] group-hover:rotate-[-5deg] group-hover:border-[#d2ad70]",
                              ].join(" ")}
                            >
                              <Icon className="h-7 w-7" />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="flex items-center justify-between gap-3">
                                <span className="text-[21px] font-black leading-9 text-[#342f2b]">
                                  {item.label}
                                </span>

                                <span
                                  className={[
                                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                                    isSelected
                                      ? "border-[#a97331] bg-[#a97331] text-white"
                                      : "border-[#dcd3c7] bg-white text-transparent",
                                  ].join(" ")}
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </span>
                              </span>

                              <span className="mt-2 block text-[20px] font-medium leading-9 text-[#756e67]">
                                {item.hint}
                              </span>
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {errors.order_type && (
                    <FormError>{errors.order_type.message}</FormError>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <StepTitle
                    eyebrow={selectedOrderType.label}
                    title="ایده‌ات را توضیح بده و فایل‌ها را اضافه کن"
                    description="هرچه توضیحات دقیق‌تر باشد، بررسی اولیه سریع‌تر و پیشنهاد نهایی مناسب‌تر خواهد بود."
                  />

                  <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
                    <div>
                      <Field
                        label="شرح کامل درخواست"
                        hint="محصول، متن، رنگ، مناسبت، ابعاد، تعداد و زمان موردنظر را بنویس."
                        error={errors.description?.message}
                      >
                        <textarea
                          {...register("description")}
                          rows={12}
                          placeholder="مثلاً یک طرح مینیمال برای چاپ روی ماگ می‌خواهم. متن فارسی دارد، رنگ‌های کرم و طلایی باشد، برای هدیه تولد است و فایل لوگو را هم ارسال می‌کنم."
                          className={textareaClass(Boolean(errors.description))}
                        />
                      </Field>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-[20px] font-bold text-[#81786f]">
                          {(
                            watchedValues.description || ""
                          ).length.toLocaleString("fa-IR")}{" "}
                          کاراکتر
                        </span>
                        <span className="text-[20px] font-bold text-[#9a6a2d]">
                          حداقل ۲۰ کاراکتر
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[20px] font-black text-[#342f2b]">
                        فایل مرجع یا طرح
                      </p>
                      <p className="mt-2 text-[20px] font-medium leading-9 text-[#7c746c]">
                        آپلود فایل اختیاری است، اما به بررسی بهتر کمک می‌کند.
                      </p>

                      <div
                        onDragEnter={(event) => {
                          event.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={(event) => {
                          event.preventDefault();
                          setIsDragging(false);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          setIsDragging(false);
                          const file = event.dataTransfer.files.item(0);
                          if (file) void handleFile(file);
                        }}
                        className={[
                          "design-upload-zone mt-4 flex min-h-[330px] flex-col items-center justify-center rounded-[26px] border-2 border-dashed px-6 py-10 text-center transition-all duration-500",
                          isDragging
                            ? "scale-[1.01] border-[#a87331] bg-[#f4e6d2] shadow-[0_25px_60px_-38px_rgba(127,83,29,0.55)]"
                            : "border-[#d8bd91] bg-[#faf4ea] hover:border-[#b8843e] hover:bg-[#f7eddf]",
                        ].join(" ")}
                      >
                        <span className="design-upload-icon flex h-20 w-20 items-center justify-center rounded-[24px] border border-[#dfc69e] bg-white text-[#a16e2d] shadow-[0_18px_38px_-28px_rgba(85,57,24,0.55)]">
                          {isUploading ? (
                            <SpinnerIcon className="h-9 w-9 animate-spin" />
                          ) : (
                            <UploadIcon className="h-9 w-9" />
                          )}
                        </span>

                        <p className="mt-5 text-[22px] font-black leading-9 text-[#342f2b]">
                          {isUploading
                            ? "فایل در حال آپلود است..."
                            : isDragging
                              ? "فایل را همین‌جا رها کن"
                              : "فایل را بکش و اینجا رها کن"}
                        </p>

                        <p className="mt-2 text-[20px] font-bold leading-8 text-[#81786f]">
                          JPG، PNG، WebP، HEIC، PDF یا ZIP تا ۱۰ مگابایت
                        </p>

                        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                          <label className="inline-flex min-h-[56px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[17px] bg-[#302c28] px-5 text-[20px] font-black text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#9b692d]">
                            <FolderIcon className="h-6 w-6" />
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

                          <label className="inline-flex min-h-[56px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-[17px] border border-[#dfd5c7] bg-white px-5 text-[20px] font-black text-[#3e3833] transition-all duration-300 hover:-translate-y-1 hover:border-[#d2ad70] hover:bg-[#fffdf9]">
                            <CameraIcon className="h-6 w-6" />
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

                      {uploadError && <FormError>{uploadError}</FormError>}

                      {uploadedFile && (
                        <div className="design-file-card mt-5 grid gap-4 rounded-[22px] border border-[#dfd6ca] bg-white p-4 shadow-[0_18px_45px_-36px_rgba(49,42,34,0.35)] sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-center">
                          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[17px] bg-[#f6efe4] text-[20px] font-black text-[#9b682c]">
                            {previewUrl && isImageFile(uploadedFile) ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={previewUrl}
                                alt={uploadedFile.original_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FileIcon className="h-10 w-10" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[20px] font-black text-[#342f2b]">
                              {uploadedFile.original_name}
                            </p>
                            <p className="mt-2 text-[20px] font-bold text-[#7e766e]">
                              {formatFileSize(uploadedFile.size)}
                            </p>
                            <p className="mt-1 text-[20px] font-bold text-emerald-700">
                              فایل با موفقیت آپلود شد
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={removeUploadedFile}
                            className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-[15px] border border-red-100 bg-red-50 px-4 text-[20px] font-black text-red-600 transition hover:bg-red-100"
                          >
                            <TrashIcon className="h-5 w-5" />
                            حذف
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <StepTitle
                    eyebrow="راه ارتباطی"
                    title="اطلاعات تماس برای پیگیری درخواست"
                    description="پس از ثبت، تیم طراحی از همین اطلاعات برای هماهنگی جزئیات سفارش استفاده می‌کند."
                  />

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <Field
                      label="نام و نام خانوادگی"
                      hint="نام فردی که سفارش را پیگیری می‌کند."
                      error={errors.contact_name?.message}
                    >
                      <div className="relative">
                        <UserIcon className="pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#a17136]" />
                        <input
                          {...register("contact_name")}
                          className={inputClass(
                            Boolean(errors.contact_name),
                            "pr-14",
                          )}
                          placeholder="نام و نام خانوادگی"
                          autoComplete="name"
                        />
                      </div>
                    </Field>

                    <Field
                      label="شماره تماس"
                      hint="شماره‌ای که در دسترس باشد."
                      error={errors.contact_phone?.message}
                    >
                      <div className="relative">
                        <PhoneIcon className="pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#a17136]" />
                        <input
                          {...register("contact_phone")}
                          inputMode="tel"
                          dir="ltr"
                          className={inputClass(
                            Boolean(errors.contact_phone),
                            "pr-14 text-left",
                          )}
                          placeholder="0912 000 0000"
                          autoComplete="tel"
                        />
                      </div>
                    </Field>

                    <Field
                      label="ایمیل (اختیاری)"
                      hint="برای دریافت نسخه نوشتاری پیگیری یا پاسخ‌ها."
                      error={errors.contact_email?.message}
                      className="md:col-span-2"
                    >
                      <div className="relative">
                        <MailIcon className="pointer-events-none absolute right-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#a17136]" />
                        <input
                          {...register("contact_email")}
                          inputMode="email"
                          dir="ltr"
                          className={inputClass(
                            Boolean(errors.contact_email),
                            "pr-14 text-left",
                          )}
                          placeholder="name@example.com"
                          autoComplete="email"
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="mt-7 rounded-[24px] border border-[#e4d5bc] bg-[#faf3e8] p-5">
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white text-[#9b692d] shadow-sm">
                        <ShieldIcon className="h-6 w-6" />
                      </span>
                      <div>
                        <p className="text-[20px] font-black text-[#3a342f]">
                          اطلاعات فقط برای پیگیری همین درخواست استفاده می‌شود
                        </p>
                        <p className="mt-2 text-[20px] font-medium leading-9 text-[#786f66]">
                          شماره تماس و ایمیل در صفحه عمومی نمایش داده نمی‌شوند و
                          فقط در اختیار تیم پشتیبانی و طراحی هستند.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <StepTitle
                    eyebrow="مرور نهایی"
                    title="درخواستت آماده ثبت است"
                    description="اطلاعات زیر را بررسی کن. برای اصلاح هر بخش می‌توانی از دکمه ویرایش همان قسمت استفاده کنی."
                  />

                  <div className="mt-8 grid gap-4">
                    <ReviewSection
                      icon={GridIcon}
                      title="نوع سفارش"
                      onEdit={() => setStep(0)}
                    >
                      <ReviewRow
                        label="خدمت انتخاب‌شده"
                        value={selectedOrderType.label}
                      />
                      {selectedProduct && (
                        <ReviewRow
                          label="محصول مرتبط"
                          value={selectedProduct.title}
                        />
                      )}
                    </ReviewSection>

                    <ReviewSection
                      icon={FileIcon}
                      title="جزئیات و فایل"
                      onEdit={() => setStep(1)}
                    >
                      <ReviewRow
                        label="شرح نیاز"
                        value={getValues("description")}
                      />
                      <ReviewRow
                        label="فایل پیوست"
                        value={uploadedFile?.original_name || "بدون فایل"}
                      />
                    </ReviewSection>

                    <ReviewSection
                      icon={UserIcon}
                      title="اطلاعات تماس"
                      onEdit={() => setStep(2)}
                    >
                      <ReviewRow
                        label="نام"
                        value={getValues("contact_name")}
                      />
                      <ReviewRow
                        label="شماره تماس"
                        value={getValues("contact_phone")}
                      />
                      <ReviewRow
                        label="ایمیل"
                        value={getValues("contact_email") || "ثبت نشده"}
                      />
                    </ReviewSection>
                  </div>

                  {submitError && <FormError>{submitError}</FormError>}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 z-20 border-t border-[#e8e0d6] bg-white/95 px-5 py-5 backdrop-blur-xl sm:px-8">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 0 || isSubmitting}
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[18px] border border-[#ddd5ca] bg-white px-7 text-[20px] font-black text-[#6e665e] outline-none transition-all duration-300 hover:border-[#d2ad70] hover:bg-[#f8f1e7] hover:text-[#342f2b] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <ArrowRightIcon className="h-6 w-6" />
                  مرحله قبل
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/products"
                    className="inline-flex min-h-[58px] items-center justify-center rounded-[18px] border border-[#e1d9ce] bg-[#fbfaf7] px-6 text-[20px] font-black text-[#6a625b] transition-all duration-300 hover:border-[#d2ad70] hover:bg-white"
                  >
                    بازگشت به محصولات
                  </Link>

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => void goNext()}
                      disabled={isUploading}
                      className="design-primary-button group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-[18px] bg-[#302c28] px-8 text-[20px] font-black text-white shadow-[0_20px_40px_-26px_rgba(48,44,40,0.7)] outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#a16c2d] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      ادامه و ذخیره
                      <ArrowLeftIcon className="h-6 w-6 transition-transform duration-300 group-hover:-translate-x-1" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || isUploading}
                      className="design-primary-button group inline-flex min-h-[58px] items-center justify-center gap-3 rounded-[18px] bg-[#d2ad70] px-8 text-[20px] font-black text-[#302c28] shadow-[0_20px_40px_-25px_rgba(184,132,62,0.6)] outline-none transition-all duration-300 hover:-translate-y-1 hover:bg-[#e2bb78] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                      {isSubmitting ? (
                        <>
                          <SpinnerIcon className="h-6 w-6 animate-spin" />
                          در حال ثبت درخواست...
                        </>
                      ) : (
                        <>
                          <SendIcon className="h-6 w-6" />
                          ثبت نهایی درخواست
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      <style jsx global>{`
        .design-request-page {
          isolation: isolate;
        }

        .design-request-grid {
          background-image: linear-gradient(
              rgba(139, 96, 43, 0.08) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(139, 96, 43, 0.08) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, black, transparent 92%);
        }

        .design-progress-bar {
          transition: width 650ms cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 0 22px rgba(210, 173, 112, 0.4);
        }

        .design-step-panel {
          animation: design-step-enter 520ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .design-upload-zone {
          position: relative;
          overflow: hidden;
        }

        .design-upload-zone::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            110deg,
            transparent 25%,
            rgba(255, 255, 255, 0.55),
            transparent 75%
          );
          transform: translateX(120%);
          transition: transform 900ms ease;
        }

        .design-upload-zone:hover::after {
          transform: translateX(-120%);
        }

        .design-upload-icon {
          animation: design-upload-float 4.4s ease-in-out infinite;
        }

        .design-file-card {
          animation: design-file-enter 480ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .design-hero-visual {
          animation: design-hero-float 7s ease-in-out infinite;
        }

        .design-hero-badge {
          animation: design-badge-float 4.8s ease-in-out infinite;
        }

        @keyframes design-step-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.992);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes design-upload-float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-7px) rotate(-3deg);
          }
        }

        @keyframes design-file-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes design-hero-float {
          0%,
          100% {
            transform: translateY(0) rotate(0);
          }
          50% {
            transform: translateY(-7px) rotate(-0.6deg);
          }
        }

        @keyframes design-badge-float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .design-request-page *,
          .design-request-page *::before,
          .design-request-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}

function DesignHero({ selectedProduct }: { selectedProduct: Product | null }) {
  return (
    <section className="relative overflow-hidden border-b border-[#e3dacd] bg-[#f2eee6]">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="design-request-grid absolute inset-0 opacity-70" />
        <span className="absolute -right-52 -top-56 h-[620px] w-[620px] rounded-full bg-[#d2ad70]/20 blur-[120px]" />
        <span className="absolute -bottom-72 -left-40 h-[580px] w-[580px] rounded-full bg-white/80 blur-[115px]" />
        <span className="absolute left-[44%] top-20 h-4 w-4 rotate-45 rounded-[4px] border border-[#b58442]/45" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1560px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(410px,0.92fr)] lg:px-8 lg:py-20">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex min-h-[52px] items-center gap-3 rounded-full border border-[#d7bd92] bg-white/75 px-5 text-[20px] font-black text-[#8d5e25] shadow-[0_12px_30px_-24px_rgba(80,55,24,0.5)] backdrop-blur-md">
              <SparklesIcon className="h-6 w-6" />
              سفارش طراحی اختصاصی
            </span>

            <span className="inline-flex min-h-[52px] items-center gap-3 rounded-full border border-[#ddd4c8] bg-white/55 px-5 text-[20px] font-black text-[#6f675f] backdrop-blur-md">
              <ClockIcon className="h-6 w-6 text-[#9a6a2f]" />
              ثبت درخواست در چند دقیقه
            </span>
          </div>

          <h1 className="mt-7 max-w-4xl text-[38px] font-black leading-[1.55] text-[#302c28] sm:text-[48px] lg:text-[58px]">
            ایده‌ات را تعریف کن؛
            <span className="mx-2 text-[#a87331]">ما مسیر اجرا</span>
            را برایت روشن می‌کنیم.
          </h1>

          <p className="mt-6 max-w-3xl text-[21px] font-medium leading-[2] text-[#716a63] sm:text-[22px]">
            نوع سفارش را انتخاب کن، توضیحات و فایل مرجع را بفرست و اطلاعات تماس
            را وارد کن. پیش‌نویس فرم خودکار ذخیره می‌شود و بعد از ثبت، کد پیگیری
            دریافت می‌کنی.
          </p>

          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            <HeroBenefit icon={SaveIcon} title="ذخیره خودکار" />
            <HeroBenefit icon={UploadIcon} title="آپلود فایل" />
            <HeroBenefit icon={CheckCircleIcon} title="کد پیگیری" />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#design-request-form"
              className="group inline-flex min-h-[62px] items-center justify-center gap-3 rounded-[19px] bg-[#302c28] px-8 text-[20px] font-black text-white shadow-[0_22px_45px_-28px_rgba(48,44,40,0.72)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#9b692d]"
            >
              شروع ثبت درخواست
              <ArrowDownIcon className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-1" />
            </a>

            <Link
              href="/portfolio"
              className="inline-flex min-h-[62px] items-center justify-center gap-3 rounded-[19px] border border-[#d8cab7] bg-white/75 px-8 text-[20px] font-black text-[#3c3631] transition-all duration-300 hover:-translate-y-1 hover:border-[#d2ad70] hover:bg-white"
            >
              مشاهده نمونه‌کارها
              <GalleryIcon className="h-6 w-6 text-[#9a692d]" />
            </Link>
          </div>
        </div>

        <div className="design-hero-visual relative mx-auto w-full max-w-[600px]">
          <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-white/70 p-4 shadow-[0_38px_90px_-52px_rgba(49,42,34,0.65)] backdrop-blur-xl">
            <span className="pointer-events-none absolute inset-4 rounded-[27px] border border-[#d2ad70]/24" />

            <div className="relative min-h-[450px] overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#e8dccb,#f9f5ee)] p-6 sm:min-h-[510px] sm:p-8">
              <span className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#d2ad70]/28 blur-[75px]" />
              <span className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-white/75 blur-[70px]" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <span className="design-hero-badge inline-flex min-h-[50px] items-center gap-2 rounded-full border border-white/70 bg-white/80 px-5 text-[20px] font-black text-[#875a22] shadow-[0_14px_30px_-24px_rgba(60,44,26,0.55)] backdrop-blur-md">
                    <PaletteIcon className="h-6 w-6" />
                    طراحی متناسب با ایده تو
                  </span>

                  <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#302c28] text-[#e5bd79] shadow-[0_18px_35px_-24px_rgba(48,44,40,0.7)]">
                    <SparklesIcon className="h-7 w-7" />
                  </span>
                </div>

                <div className="my-8 grid gap-4 sm:grid-cols-2">
                  <VisualCard
                    icon={MessageIcon}
                    title="ایده و توضیحات"
                    text="نیازت را ساده و روشن بنویس"
                  />
                  <VisualCard
                    icon={UploadIcon}
                    title="فایل مرجع"
                    text="عکس، PDF یا ZIP اضافه کن"
                  />
                  <VisualCard
                    icon={UserIcon}
                    title="اطلاعات تماس"
                    text="راه ارتباط برای هماهنگی"
                  />
                  <VisualCard
                    icon={CheckCircleIcon}
                    title="ثبت و پیگیری"
                    text="کد درخواست را دریافت کن"
                  />
                </div>

                <div className="rounded-[24px] border border-white/75 bg-white/82 p-5 shadow-[0_20px_45px_-34px_rgba(49,42,34,0.5)] backdrop-blur-xl">
                  <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-[#f5ead9] text-[#99662a]">
                      <PackageIcon className="h-7 w-7" />
                    </span>
                    <div>
                      <p className="text-[20px] font-black text-[#342f2b]">
                        {selectedProduct
                          ? "سفارش برای محصول انتخاب‌شده"
                          : "برای هر ایده و هر محصول"}
                      </p>
                      <p className="mt-2 text-[20px] font-bold leading-8 text-[#776f67]">
                        {selectedProduct
                          ? selectedProduct.title
                          : "ماگ، پوشاک، هدیه، چاپ سازمانی یا یک ایده کاملاً متفاوت"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroBenefit({
  icon: Icon,
  title,
}: {
  icon: (props: IconProps) => ReactNode;
  title: string;
}) {
  return (
    <div className="flex min-h-[70px] items-center gap-3 rounded-[20px] border border-[#e2d8ca] bg-white/72 px-4 backdrop-blur-md">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f5ead9] text-[#976327]">
        <Icon className="h-6 w-6" />
      </span>
      <span className="text-[20px] font-black text-[#3d3732]">{title}</span>
    </div>
  );
}

function VisualCard({
  icon: Icon,
  title,
  text,
}: {
  icon: (props: IconProps) => ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="group rounded-[22px] border border-white/70 bg-white/72 p-4 shadow-[0_18px_38px_-32px_rgba(49,42,34,0.42)] backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:bg-white/90">
      <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#302c28] text-[#e5bd79] transition-transform duration-500 group-hover:rotate-[-5deg]">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-4 text-[20px] font-black text-[#342f2b]">{title}</p>
      <p className="mt-2 text-[20px] font-bold leading-8 text-[#7b736b]">
        {text}
      </p>
    </div>
  );
}

function StepTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-12 rounded-full bg-[#c8954c]" />
        <p className="text-[20px] font-black text-[#a16c2a]">{eyebrow}</p>
      </div>
      <h2 className="mt-3 text-[30px] font-black leading-[1.55] text-[#302c28] sm:text-[38px]">
        {title}
      </h2>
      <p className="mt-3 max-w-4xl text-[20px] font-medium leading-9 text-[#746d66]">
        {description}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[20px] font-black text-[#342f2b]">{label}</span>
      {hint && (
        <span className="mt-1 block text-[20px] font-medium leading-8 text-[#817970]">
          {hint}
        </span>
      )}
      <div className="mt-3">{children}</div>
      {error && <FormError>{error}</FormError>}
    </label>
  );
}

function FormError({ children }: { children: ReactNode }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-[16px] border border-red-100 bg-red-50 p-4 text-[20px] font-bold leading-8 text-red-700">
      <AlertIcon className="mt-0.5 h-6 w-6 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function inputClass(hasError: boolean, extra = "") {
  return `h-[62px] w-full rounded-[18px] border bg-white px-5 text-[20px] font-bold text-[#342f2b] outline-none transition-all duration-300 placeholder:text-[20px] placeholder:font-medium placeholder:text-[#aaa198] focus:ring-4 ${extra} ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-[#ddd5ca] focus:border-[#c8954c] focus:ring-[#c8954c]/12"
  }`;
}

function textareaClass(hasError: boolean) {
  return `w-full resize-none rounded-[22px] border bg-white px-5 py-4 text-[20px] font-medium leading-10 text-[#342f2b] outline-none transition-all duration-300 placeholder:text-[20px] placeholder:font-medium placeholder:leading-9 placeholder:text-[#aaa198] focus:ring-4 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-[#ddd5ca] focus:border-[#c8954c] focus:ring-[#c8954c]/12"
  }`;
}

function ReviewSection({
  icon: Icon,
  title,
  onEdit,
  children,
}: {
  icon: (props: IconProps) => ReactNode;
  title: string;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#e1d8cc] bg-[#fcfaf6]">
      <div className="flex items-center justify-between gap-4 border-b border-[#e9e1d7] bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f5ead9] text-[#99672b]">
            <Icon className="h-6 w-6" />
          </span>
          <h3 className="text-[21px] font-black text-[#342f2b]">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[14px] border border-[#e0d6c8] bg-[#faf7f2] px-4 text-[20px] font-black text-[#76552c] transition hover:border-[#d2ad70] hover:bg-[#f5ead9]"
        >
          <EditIcon className="h-5 w-5" />
          ویرایش
        </button>
      </div>
      <div className="grid gap-3 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#e7dfd5] bg-white p-4">
      <p className="text-[20px] font-black text-[#8a6b43]">{label}</p>
      <p className="mt-2 whitespace-pre-line break-words text-[20px] font-bold leading-9 text-[#342f2b]">
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
    <main className="design-request-page min-h-screen overflow-hidden bg-[#fbfaf7]">
      <section className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
        <span className="pointer-events-none absolute left-1/2 top-12 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#d2ad70]/16 blur-[110px]" />

        <div className="relative overflow-hidden rounded-[36px] border border-[#e0d4c3] bg-white p-6 shadow-[0_38px_95px_-55px_rgba(49,42,34,0.6)] sm:p-10">
          <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_18px_40px_-28px_rgba(16,120,80,0.45)]">
            <CheckIcon className="h-12 w-12" />
          </span>

          <p className="mt-7 text-[20px] font-black text-[#a16c2a]">
            ثبت موفق درخواست
          </p>
          <h1 className="mt-3 text-[34px] font-black leading-[1.55] text-[#302c28] sm:text-[44px]">
            درخواست طراحی با موفقیت ثبت شد
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-[21px] font-medium leading-10 text-[#746d66]">
            کد درخواست{" "}
            <strong className="font-black text-[#302c28]">
              #{request.id.toLocaleString("fa-IR")}
            </strong>{" "}
            با وضعیت «{request.status_label}» ثبت شد. این کد را برای پیگیری نگه
            دار.
          </p>

          <div className="mt-8 grid gap-3 rounded-[26px] border border-[#e3dad0] bg-[#faf7f2] p-5 text-right sm:p-6">
            <ReviewRow label="نوع سفارش" value={request.order_type_label} />
            <ReviewRow label="شماره تماس" value={request.contact_phone} />
            <ReviewRow
              label="فایل"
              value={
                uploadedFile?.original_name ||
                request.uploaded_file?.original_name ||
                "بدون فایل"
              }
            />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/account/design-requests"
              className="inline-flex min-h-[60px] items-center justify-center gap-2 rounded-[18px] bg-[#302c28] px-7 text-[20px] font-black text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#9b692d]"
            >
              مشاهده درخواست‌های من
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <Link
              href="/products"
              className="inline-flex min-h-[60px] items-center justify-center rounded-[18px] border border-[#ddd5ca] bg-white px-7 text-[20px] font-black text-[#342f2b] transition-all duration-300 hover:-translate-y-1 hover:border-[#d2ad70] hover:bg-[#f8f1e7]"
            >
              مشاهده محصولات
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SparklesIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3-1.2 3.3a5 5 0 0 1-3 3L4.5 10.5l3.3 1.2a5 5 0 0 1 3 3L12 18l1.2-3.3a5 5 0 0 1 3-3l3.3-1.2-3.3-1.2a5 5 0 0 1-3-3L12 3Z" />
      <path d="m5 3-.4 1.1a2 2 0 0 1-1.2 1.2L2.3 5.7l1.1.4a2 2 0 0 1 1.2 1.2L5 8.4l.4-1.1a2 2 0 0 1 1.2-1.2l1.1-.4-1.1-.4a2 2 0 0 1-1.2-1.2L5 3Z" />
    </svg>
  );
}

function PrintIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 8V3h10v5" />
      <path d="M6 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v7H6z" />
      <path d="M18 11h.01" />
    </svg>
  );
}

function PaletteIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0 7-7c0-2.2-4-4-9-4Z" />
      <circle cx="7.5" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="6.8" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="6.5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="17" cy="9" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GiftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 9h18v4H3z" />
      <path d="M5 13h14v8H5z" />
      <path d="M12 9v12" />
      <path d="M12 9H8.5A2.5 2.5 0 1 1 11 6.5V9Z" />
      <path d="M12 9h3.5A2.5 2.5 0 1 0 13 6.5V9Z" />
    </svg>
  );
}

function FaceIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10h.01M15.5 10h.01M8.5 15c1.6 1.2 5.4 1.2 7 0" />
      <path d="M8 5.5c2.8 1.8 5.8 1.8 8.5-.4" />
    </svg>
  );
}

function MessageIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

function GridIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function FileIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h6M9 17h4" />
    </svg>
  );
}

function UserIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

function CheckCircleIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.6 2.6L16.5 9" />
    </svg>
  );
}

function RouteIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="5" r="2" />
      <path d="M8 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3h1" />
    </svg>
  );
}

function CheckIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18.5 9A7 7 0 0 0 6.7 6.7L4 9M5.5 15A7 7 0 0 0 17.3 17.3L20 15" />
    </svg>
  );
}

function PackageIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4.5 7.8 7.5 4.3 7.5-4.3M12 12v9" />
    </svg>
  );
}

function SaveIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 3h12l2 2v16H5z" />
      <path d="M8 3v6h8V3M8 17h8" />
    </svg>
  );
}

function UploadIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 15v5h16v-5" />
    </svg>
  );
}

function FolderIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 6h7l2 2h9v11H3z" />
    </svg>
  );
}

function CameraIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h4l2-3h4l2 3h4v13H4z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function SpinnerIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3a9 9 0 1 1-9 9" />
    </svg>
  );
}

function TrashIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function PhoneIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6.5 3h3l1.5 4-2 1.5a15 15 0 0 0 6.5 6.5l1.5-2 4 1.5v3a3 3 0 0 1-3 3C10 20.5 3.5 14 3.5 6a3 3 0 0 1 3-3Z" />
    </svg>
  );
}

function MailIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function EditIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m4 20 4.5-1 10-10-3.5-3.5-10 10z" />
      <path d="m13.5 6.5 3.5 3.5" />
    </svg>
  );
}

function AlertIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

function ArrowLeftIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ArrowDownIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

function SendIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m3 11 18-8-8 18-2-7z" />
      <path d="m11 14 4-4" />
    </svg>
  );
}

function ClockIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function GalleryIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 15-5-5L5 20" />
    </svg>
  );
}
