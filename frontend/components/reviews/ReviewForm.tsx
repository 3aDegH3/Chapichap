"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import RatingStars from "@/components/reviews/RatingStars";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api";
import { createProductReview, getReviewEligibility } from "@/lib/reviews-api";

const schema = z.object({
  rating: z.number().min(1, "امتیاز را انتخاب کنید.").max(5),
  title: z.string().max(150, "عنوان نظر حداکثر ۱۵۰ کاراکتر است."),
  body: z.string().trim().min(10, "متن نظر باید حداقل ۱۰ کاراکتر باشد.").max(2000, "متن نظر حداکثر ۲۰۰۰ کاراکتر است."),
});

type FormValues = z.infer<typeof schema>;

export default function ReviewForm({
  productId,
  productSlug,
  onSuccess,
}: {
  productId: number;
  productSlug: string;
  onSuccess: (message: string) => void | Promise<void>;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const eligibilityQuery = useQuery({
    queryKey: ["review-eligibility", productSlug],
    queryFn: () => getReviewEligibility(productSlug),
    enabled: isAuthenticated,
    retry: false,
  });
  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, title: "", body: "" },
  });

  const bodyLength = (useWatch({ control, name: "body" }) || "").length;

  if (isLoading) return <div className="h-64 animate-pulse rounded-2xl bg-[#F2EEE6]" />;

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-[#D2AD70]/45 bg-[#F6F1E8] p-6 text-center">
        <h3 className="text-lg font-black text-[#333230]">تجربه‌ات را با دیگران به اشتراک بگذار</h3>
        <p className="mt-3 text-sm font-medium leading-8 text-[#6F6A63]">برای ثبت امتیاز و نظر ابتدا وارد حساب کاربری شو.</p>
        <Link
          href={`/login?next=${encodeURIComponent(`/products/${productSlug}#reviews`)}`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#333230] px-6 text-sm font-black text-white"
        >
          ورود به حساب
        </Link>
      </div>
    );
  }

  if (eligibilityQuery.data && !eligibilityQuery.data.can_review) {
    return (
      <div className="rounded-2xl border border-[#E3DED5] bg-[#FAFAF8] p-6">
        <h3 className="font-black text-[#333230]">نظر شما قبلاً ثبت شده است</h3>
        <p className="mt-2 text-sm font-medium leading-7 text-[#77736D]">
          می‌توانی نظر ثبت‌شده را از بخش «نظرات من» ویرایش یا حذف کنی.
        </p>
        <Link href="/account/reviews" className="mt-4 inline-flex text-sm font-black text-[#B2894C]">مدیریت نظرات من</Link>
      </div>
    );
  }

  async function submit(values: FormValues) {
    try {
      const response = await createProductReview(productId, {
        ...values,
        order_item_id: eligibilityQuery.data?.eligible_order_item?.id,
      });
      reset();
      await onSuccess(response.message);
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);
      if (fieldErrors.rating) setError("rating", { message: fieldErrors.rating });
      if (fieldErrors.title) setError("title", { message: fieldErrors.title });
      if (fieldErrors.body) setError("body", { message: fieldErrors.body });
      setError("root", { message: getApiErrorMessage(error) });
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="rounded-2xl border border-[#E3DED5] bg-white p-6">
      <h3 className="text-xl font-black text-[#333230]">ثبت نظر برای این محصول</h3>
      {eligibilityQuery.data?.eligible_order_item && (
        <p className="mt-2 rounded-xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
          نظر شما برای سفارش {eligibilityQuery.data.eligible_order_item.order_number} با نشان خریدار تأییدشده منتشر می‌شود.
        </p>
      )}

      <div className="mt-5">
        <span className="block text-sm font-black text-[#333230]">امتیاز شما</span>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <div className="mt-2"><RatingStars value={field.value} onChange={field.onChange} size="lg" /></div>
          )}
        />
        {errors.rating && <p className="mt-2 text-xs font-bold text-red-600">{errors.rating.message}</p>}
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-black text-[#333230]">عنوان نظر <span className="font-medium text-[#8B857D]">(اختیاری)</span></span>
        <input
          {...register("title")}
          className="mt-2 h-12 w-full rounded-xl border border-[#E3DED5] bg-white px-4 text-sm outline-none focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
          placeholder="مثلاً کیفیت چاپ عالی بود"
        />
        {errors.title && <span className="mt-2 block text-xs font-bold text-red-600">{errors.title.message}</span>}
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-black text-[#333230]">متن نظر</span>
        <textarea
          {...register("body")}
          rows={5}
          className="mt-2 w-full resize-y rounded-xl border border-[#E3DED5] bg-white px-4 py-3 text-sm leading-8 outline-none focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
          placeholder="تجربه‌ات از کیفیت محصول، چاپ و بسته‌بندی را بنویس..."
        />
        <span className="mt-1 flex justify-between gap-3 text-xs font-bold text-[#8B857D]">
          <span>{errors.body?.message}</span>
          <span>{bodyLength.toLocaleString("fa-IR")} / ۲۰۰۰</span>
        </span>
      </label>

      {errors.root?.message && (
        <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errors.root.message}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-[#D2AD70] px-7 text-sm font-black text-[#333230] transition hover:bg-[#B2894C] disabled:opacity-60"
      >
        {isSubmitting ? "در حال ثبت..." : "ثبت نظر"}
      </button>
    </form>
  );
}
