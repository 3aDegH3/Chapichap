"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import {
  AdminProduct,
  AdminProductCategory,
  createAdminProduct,
  deleteAdminProductImage,
  getAdminProduct,
  getAdminProductCategories,
  getAdminProductInventoryHistory,
  setAdminProductPrimaryImage,
  updateAdminProduct,
} from "@/lib/admin-api";
import { giftUsageOptions, productTypeOptions } from "@/lib/products-api";

type ProductFormValues = {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  price: string;
  discount_price: string;
  discount_starts_at: string;
  discount_ends_at: string;
  stock_quantity: string;
  unlimited_stock: boolean;
  low_stock_threshold: string;
  product_type: string;
  gift_usage: string;
  material: string;
  dimensions: string;
  preparation_time: string;
  print_file_guide: string;
  is_active: boolean;
};

const defaultValues: ProductFormValues = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  category: "",
  price: "",
  discount_price: "",
  discount_starts_at: "",
  discount_ends_at: "",
  stock_quantity: "0",
  unlimited_stock: false,
  low_stock_threshold: "5",
  product_type: "other",
  gift_usage: "personal",
  material: "",
  dimensions: "",
  preparation_time: "۲ تا ۴ روز کاری",
  print_file_guide: "",
  is_active: true,
};

const inputClass =
  "min-h-11 rounded-md border border-[#D5DAE1] bg-white px-3 py-2 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function getInitialValues(product?: AdminProduct): ProductFormValues {
  if (!product) return defaultValues;

  return {
    title: product.title,
    slug: product.slug,
    short_description: product.short_description || "",
    description: product.description || "",
    category: product.category ? String(product.category) : "",
    price: product.price,
    discount_price: product.discount_price || "",
    discount_starts_at: product.discount_starts_at ? product.discount_starts_at.slice(0, 16) : "",
    discount_ends_at: product.discount_ends_at ? product.discount_ends_at.slice(0, 16) : "",
    stock_quantity: String(product.stock_quantity),
    unlimited_stock: product.unlimited_stock,
    low_stock_threshold: String(product.low_stock_threshold),
    product_type: product.product_type,
    gift_usage: product.gift_usage,
    material: product.material || "",
    dimensions: product.dimensions || "",
    preparation_time: product.preparation_time || "",
    print_file_guide: product.print_file_guide || "",
    is_active: product.is_active,
  };
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black text-[#364152]">{label}</span>
      {children}
    </label>
  );
}

function ProductFormBody({
  productId,
  product,
  categories,
  initialValues,
}: {
  productId?: number;
  product?: AdminProduct;
  categories: AdminProductCategory[];
  initialValues: ProductFormValues;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(productId);

  const [values, setValues] = useState<ProductFormValues>(initialValues);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const inventoryHistoryQuery = useQuery({
    queryKey: ["admin-product-inventory-history", productId],
    enabled: isEdit && Boolean(productId),
    queryFn: async () => {
      const response = await getAdminProductInventoryHistory(productId as number);
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key === "category" && !value) return;
        payload.append(key, typeof value === "boolean" ? String(value) : value);
      });

      galleryImages.forEach((file) => payload.append("gallery_images", file));

      if (isEdit && productId) {
        return updateAdminProduct(productId, payload);
      }

      return createAdminProduct(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-product-inventory-history", productId] });
      router.push("/admin/products");
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const primaryImageMutation = useMutation({
    mutationFn: (imageId: number) => setAdminProductPrimaryImage(productId as number, imageId),
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) => deleteAdminProductImage(productId as number, imageId),
    onSuccess: async () => {
      setFormError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-product", productId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (error) => setFormError(getApiErrorMessage(error)),
  });

  function updateValue(field: keyof ProductFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    setGalleryImages(Array.from(event.target.files || []));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!values.title.trim()) {
      setFormError("نام محصول را وارد کن.");
      return;
    }

    if (
      Number(values.price) < 0 ||
      Number(values.stock_quantity) < 0 ||
      Number(values.low_stock_threshold) < 0 ||
      (values.discount_price && Number(values.discount_price) < 0)
    ) {
      setFormError("قیمت، تخفیف و موجودی نمی‌توانند منفی باشند.");
      return;
    }

    if (values.discount_price && Number(values.discount_price) > Number(values.price)) {
      setFormError("قیمت تخفیف نمی‌تواند بیشتر از قیمت اصلی باشد.");
      return;
    }

    saveMutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-[#A15C38]">
              {isEdit ? "ویرایش محصول" : "افزودن محصول"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
              اطلاعات پایه محصول
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products"
              className="inline-flex h-10 items-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4]"
            >
              بازگشت
            </Link>
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="inline-flex h-10 items-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827] disabled:opacity-60"
            >
              {saveMutation.isPending ? "در حال ذخیره" : "ذخیره محصول"}
            </button>
          </div>
        </div>

        {formError && (
          <div className="mt-5 rounded-md border border-[#F3B1A6] bg-[#FEF3F2] p-3 text-sm font-bold text-[#B42318]">
            {formError}
          </div>
        )}
      </section>

      <section className="grid gap-5 rounded-lg border border-[#D5DAE1] bg-white p-5 md:grid-cols-2">
        <Field label="نام محصول">
          <input
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <Field label="Slug">
          <input
            value={values.slug}
            onChange={(event) => updateValue("slug", event.target.value)}
            className={inputClass}
            placeholder="در صورت خالی بودن خودکار ساخته می‌شود"
          />
        </Field>

        <Field label="دسته‌بندی">
          <select
            value={values.category}
            onChange={(event) => updateValue("category", event.target.value)}
            className={inputClass}
          >
            <option value="">بدون دسته‌بندی</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </Field>

        <Field label="وضعیت انتشار">
          <select
            value={values.is_active ? "true" : "false"}
            onChange={(event) => updateValue("is_active", event.target.value === "true")}
            className={inputClass}
          >
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </Field>

        <Field label="قیمت اصلی">
          <input
            type="number"
            min="0"
            value={values.price}
            onChange={(event) => updateValue("price", event.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <Field label="قیمت تخفیف">
          <input
            type="number"
            min="0"
            value={values.discount_price}
            onChange={(event) => updateValue("discount_price", event.target.value)}
            className={inputClass}
            placeholder="اختیاری"
          />
        </Field>

        <Field label="شروع تخفیف">
          <input
            type="datetime-local"
            value={values.discount_starts_at}
            onChange={(event) => updateValue("discount_starts_at", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="پایان تخفیف">
          <input
            type="datetime-local"
            value={values.discount_ends_at}
            onChange={(event) => updateValue("discount_ends_at", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="موجودی">
          <input
            type="number"
            min="0"
            value={values.stock_quantity}
            onChange={(event) => updateValue("stock_quantity", event.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <Field label="حد هشدار موجودی">
          <input
            type="number"
            min="0"
            value={values.low_stock_threshold}
            onChange={(event) => updateValue("low_stock_threshold", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="وضعیت موجودی">
          <select
            value={values.unlimited_stock ? "true" : "false"}
            onChange={(event) => updateValue("unlimited_stock", event.target.value === "true")}
            className={inputClass}
          >
            <option value="false">محدود</option>
            <option value="true">نامحدود</option>
          </select>
        </Field>

        <Field label="نوع محصول">
          <select
            value={values.product_type}
            onChange={(event) => updateValue("product_type", event.target.value)}
            className={inputClass}
          >
            {productTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="کاربرد هدیه">
          <select
            value={values.gift_usage}
            onChange={(event) => updateValue("gift_usage", event.target.value)}
            className={inputClass}
          >
            {giftUsageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="جنس محصول">
          <input
            value={values.material}
            onChange={(event) => updateValue("material", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="ابعاد یا سایز">
          <input
            value={values.dimensions}
            onChange={(event) => updateValue("dimensions", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="زمان آماده‌سازی">
          <input
            value={values.preparation_time}
            onChange={(event) => updateValue("preparation_time", event.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="تصاویر محصول">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className={`${inputClass} file:ml-3 file:rounded-md file:border-0 file:bg-[#EEF1F4] file:px-3 file:py-1 file:text-sm file:font-black file:text-[#364152]`}
          />
          {galleryImages.length > 0 && (
            <span className="text-xs font-bold text-[#697586]">
              {galleryImages.length.toLocaleString("fa-IR")} تصویر انتخاب شده است.
            </span>
          )}
        </Field>

        <Field label="توضیح کوتاه">
          <textarea
            value={values.short_description}
            onChange={(event) => updateValue("short_description", event.target.value)}
            className={`${inputClass} min-h-28`}
          />
        </Field>

        <Field label="راهنمای فایل چاپ">
          <textarea
            value={values.print_file_guide}
            onChange={(event) => updateValue("print_file_guide", event.target.value)}
            className={`${inputClass} min-h-28`}
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="توضیحات کامل">
            <textarea
              value={values.description}
              onChange={(event) => updateValue("description", event.target.value)}
              className={`${inputClass} min-h-36`}
            />
          </Field>
        </div>
      </section>

      {isEdit && product && (
        <section className="rounded-lg border border-[#D5DAE1] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-[#1F2933]">گالری محصول</h3>
              <p className="mt-1 text-xs font-bold text-[#697586]">حداکثر ۸ تصویر؛ تصویر اصلی در فروشگاه نمایش داده می‌شود.</p>
            </div>
            <span className="text-xs font-black text-[#697586]">{product.gallery_images.length.toLocaleString("fa-IR")} تصویر</span>
          </div>
          {product.gallery_images.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-[#D5DAE1] bg-[#F8FAFC] p-5 text-center text-sm font-bold text-[#697586]">
              هنوز تصویری در گالری ثبت نشده است.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {product.gallery_images.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-lg border border-[#E3E8EF] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image_url} alt={item.alt_text || product.title} className="aspect-square w-full object-cover" />
                  <div className="p-3">
                    {item.is_primary ? (
                      <span className="inline-flex rounded-md bg-[#ECFDF3] px-2 py-1 text-xs font-black text-[#027A48]">تصویر اصلی</span>
                    ) : (
                      <button type="button" onClick={() => primaryImageMutation.mutate(item.id)} disabled={primaryImageMutation.isPending} className="h-8 rounded-md border border-[#D5DAE1] px-2 text-xs font-black text-[#364152] disabled:opacity-60">انتخاب به‌عنوان اصلی</button>
                    )}
                    <button type="button" onClick={() => window.confirm("این تصویر از گالری حذف شود؟") && deleteImageMutation.mutate(item.id)} disabled={deleteImageMutation.isPending} className="mt-2 block text-xs font-black text-[#B42318] disabled:opacity-60">حذف تصویر</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {isEdit && (
        <section className="rounded-lg border border-[#D5DAE1] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-black text-[#1F2933]">تاریخچه موجودی</h3>
            {inventoryHistoryQuery.isFetching && (
              <span className="text-xs font-black text-[#697586]">در حال دریافت</span>
            )}
          </div>

          {inventoryHistoryQuery.isError ? (
            <p className="mt-4 rounded-md border border-[#F3B1A6] bg-[#FEF3F2] p-3 text-sm font-bold text-[#B42318]">
              {getApiErrorMessage(inventoryHistoryQuery.error)}
            </p>
          ) : inventoryHistoryQuery.data?.results.length ? (
            <div className="mt-4 overflow-hidden rounded-md border border-[#E3E8EF]">
              {inventoryHistoryQuery.data.results.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 border-b border-[#E3E8EF] p-3 text-sm last:border-b-0 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-black text-[#1F2933]">{item.change_type_label}</p>
                    <p className="mt-1 font-bold text-[#697586]">
                      {item.previous_quantity.toLocaleString("fa-IR")} به{" "}
                      {item.new_quantity.toLocaleString("fa-IR")} · {item.changed_by_label}
                    </p>
                    {item.note && <p className="mt-1 text-xs font-bold text-[#697586]">{item.note}</p>}
                  </div>
                  <time className="text-xs font-black text-[#697586]">
                    {new Intl.DateTimeFormat("fa-IR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(item.created_at))}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-dashed border-[#D5DAE1] bg-[#F8FAFC] p-5 text-center text-sm font-bold text-[#697586]">
              هنوز تغییری برای موجودی ثبت نشده است.
            </p>
          )}
        </section>
      )}
    </form>
  );
}

export default function ProductFormClient({ productId }: { productId?: number }) {
  const isEdit = Boolean(productId);

  const categoriesQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: async () => {
      const response = await getAdminProductCategories();
      return response.data;
    },
  });

  const productQuery = useQuery({
    queryKey: ["admin-product", productId],
    enabled: isEdit && Number.isFinite(productId),
    queryFn: async () => {
      const response = await getAdminProduct(productId as number);
      return response.data;
    },
  });

  if (productQuery.isLoading || categoriesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-lg bg-white" />
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      </div>
    );
  }

  if (productQuery.isError) {
    return (
      <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
        <p className="text-sm font-black text-[#B42318]">خطا در دریافت محصول</p>
        <p className="mt-2 text-sm font-medium text-[#697586]">
          {getApiErrorMessage(productQuery.error)}
        </p>
      </section>
    );
  }

  if (categoriesQuery.isError) {
    return (
      <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
        <p className="text-sm font-black text-[#B42318]">خطا در دریافت دسته‌بندی‌ها</p>
        <p className="mt-2 text-sm font-medium text-[#697586]">
          {getApiErrorMessage(categoriesQuery.error)}
        </p>
      </section>
    );
  }

  return (
    <ProductFormBody
      key={productId || "new"}
      productId={productId}
      product={productQuery.data}
      categories={categoriesQuery.data || []}
      initialValues={getInitialValues(productQuery.data)}
    />
  );
}
