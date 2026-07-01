"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import {
  AdminCategory,
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminProductCategories,
  updateAdminCategory,
} from "@/lib/admin-api";

type CategoryFormValues = {
  title: string;
  slug: string;
  description: string;
  parent: string;
  sort_order: string;
  is_active: boolean;
};

const defaultValues: CategoryFormValues = {
  title: "",
  slug: "",
  description: "",
  parent: "",
  sort_order: "0",
  is_active: true,
};

const inputClass =
  "min-h-11 rounded-md border border-[#D5DAE1] bg-white px-3 py-2 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

const orderingOptions = [
  { value: "sort_order", label: "ترتیب نمایش" },
  { value: "title", label: "نام دسته" },
  { value: "-updated_at", label: "آخرین تغییر" },
  { value: "-created_at", label: "جدیدترین" },
];

const numberFormatter = new Intl.NumberFormat("fa-IR");

function getInitialValues(category: AdminCategory | null): CategoryFormValues {
  if (!category) return defaultValues;

  return {
    title: category.title,
    slug: category.slug,
    description: category.description || "",
    parent: category.parent ? String(category.parent) : "",
    sort_order: String(category.sort_order),
    is_active: category.is_active,
  };
}

function CategoryImage({ category }: { category: AdminCategory }) {
  if (!category.image_url) {
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-[#D5DAE1] bg-[#F8FAFC] text-xs font-black text-[#697586]">
        بدون
      </div>
    );
  }

  return (
    <Image
      src={category.image_url}
      alt={category.title}
      width={48}
      height={48}
      unoptimized
      className="h-12 w-12 rounded-md border border-[#D5DAE1] object-cover"
    />
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={[
        "inline-flex rounded-md px-2.5 py-1 text-xs font-black",
        isActive ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#EEF1F4] text-[#697586]",
      ].join(" ")}
    >
      {isActive ? "فعال" : "غیرفعال"}
    </span>
  );
}

function CategoryForm({
  editingCategory,
  parentOptions,
  onCancelEdit,
}: {
  editingCategory: AdminCategory | null;
  parentOptions: Array<{ id: number; title: string }>;
  onCancelEdit: () => void;
}) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<CategoryFormValues>(getInitialValues(editingCategory));
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = new FormData();
      payload.append("title", values.title);
      payload.append("slug", values.slug);
      payload.append("description", values.description);
      payload.append("parent", values.parent);
      payload.append("sort_order", values.sort_order || "0");
      payload.append("is_active", String(values.is_active));
      if (image) payload.append("image", image);

      if (editingCategory) {
        return updateAdminCategory(editingCategory.id, payload);
      }

      return createAdminCategory(payload);
    },
    onSuccess: async () => {
      setValues(defaultValues);
      setImage(null);
      setError(null);
      onCancelEdit();
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
    },
    onError: (mutationError) => {
      setError(getApiErrorMessage(mutationError));
    },
  });

  function updateValue(field: keyof CategoryFormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!values.title.trim()) {
      setError("نام دسته‌بندی را وارد کن.");
      return;
    }

    if (Number(values.sort_order) < 0) {
      setError("ترتیب نمایش نمی‌تواند منفی باشد.");
      return;
    }

    saveMutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#A15C38]">
            {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}
          </p>
          <h2 className="mt-2 text-xl font-black text-[#1F2933]">
            اطلاعات دسته
          </h2>
        </div>
        {editingCategory && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
          >
            انصراف
          </button>
        )}
      </div>

      {error && (
        <div className="mt-5 rounded-md border border-[#F3B1A6] bg-[#FEF3F2] p-3 text-sm font-bold text-[#B42318]">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">نام دسته‌بندی</span>
          <input
            value={values.title}
            onChange={(event) => updateValue("title", event.target.value)}
            className={inputClass}
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">Slug</span>
          <input
            value={values.slug}
            onChange={(event) => updateValue("slug", event.target.value)}
            className={inputClass}
            placeholder="در صورت خالی بودن خودکار ساخته می‌شود"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">توضیح کوتاه</span>
          <textarea
            value={values.description}
            onChange={(event) => updateValue("description", event.target.value)}
            className={`${inputClass} min-h-24`}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">دسته والد</span>
          <select
            value={values.parent}
            onChange={(event) => updateValue("parent", event.target.value)}
            className={inputClass}
          >
            <option value="">بدون والد</option>
            {parentOptions
              .filter((category) => category.id !== editingCategory?.id)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">ترتیب نمایش</span>
          <input
            type="number"
            min="0"
            value={values.sort_order}
            onChange={(event) => updateValue("sort_order", event.target.value)}
            className={inputClass}
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">وضعیت</span>
          <select
            value={values.is_active ? "true" : "false"}
            onChange={(event) => updateValue("is_active", event.target.value === "true")}
            className={inputClass}
          >
            <option value="true">فعال</option>
            <option value="false">غیرفعال</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-[#364152]">تصویر دسته‌بندی</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event: ChangeEvent<HTMLInputElement>) => setImage(event.target.files?.[0] || null)}
            className={`${inputClass} file:ml-3 file:rounded-md file:border-0 file:bg-[#EEF1F4] file:px-3 file:py-1 file:text-sm file:font-black file:text-[#364152]`}
          />
        </label>

        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="inline-flex h-11 items-center justify-center rounded-md bg-[#1F2933] px-4 text-sm font-black text-white transition hover:bg-[#111827] disabled:opacity-60"
        >
          {saveMutation.isPending ? "در حال ذخیره" : editingCategory ? "ذخیره تغییرات" : "افزودن دسته"}
        </button>
      </div>
    </form>
  );
}

export default function AdminCategoriesClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<"true" | "false" | "">("");
  const [ordering, setOrdering] = useState("sort_order");
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories", page, search, isActive, ordering],
    queryFn: async () => {
      const response = await getAdminCategories({ page, search, isActive, ordering });
      return response.data;
    },
  });

  const parentOptionsQuery = useQuery({
    queryKey: ["admin-product-categories"],
    queryFn: async () => {
      const response = await getAdminProductCategories();
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => deleteAdminCategory(categoryId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-product-categories"] });
    },
  });

  const totalPages = useMemo(() => {
    if (!categoriesQuery.data?.count) return 1;
    return Math.max(1, Math.ceil(categoriesQuery.data.count / 10));
  }, [categoriesQuery.data?.count]);

  function resetPage(next: () => void) {
    setPage(1);
    next();
  }

  function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`دسته‌بندی «${category.title}» حذف شود؟`);
    if (confirmed) deleteMutation.mutate(category.id);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div>
            <p className="text-sm font-black text-[#A15C38]">مدیریت دسته‌بندی‌ها</p>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
              ساختار دسته‌های فروشگاه
            </h2>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1.3fr_1fr_1fr]">
            <input
              value={search}
              onChange={(event) => resetPage(() => setSearch(event.target.value))}
              placeholder="جستجو با نام، slug یا توضیح"
              className={inputClass}
            />
            <select
              value={isActive}
              onChange={(event) => resetPage(() => setIsActive(event.target.value as typeof isActive))}
              className={inputClass}
            >
              <option value="">همه وضعیت‌ها</option>
              <option value="true">فعال</option>
              <option value="false">غیرفعال</option>
            </select>
            <select
              value={ordering}
              onChange={(event) => resetPage(() => setOrdering(event.target.value))}
              className={inputClass}
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {deleteMutation.error && (
          <div className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
            {getApiErrorMessage(deleteMutation.error)}
          </div>
        )}

        {categoriesQuery.isLoading ? (
          <div className="h-96 animate-pulse rounded-lg bg-white" />
        ) : categoriesQuery.isError ? (
          <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
            <p className="text-sm font-black text-[#B42318]">خطا در دریافت دسته‌بندی‌ها</p>
            <p className="mt-2 text-sm font-medium text-[#697586]">
              {getApiErrorMessage(categoriesQuery.error)}
            </p>
          </section>
        ) : categoriesQuery.data?.results.length === 0 ? (
          <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center">
            <p className="text-base font-black text-[#1F2933]">دسته‌بندی پیدا نشد.</p>
          </section>
        ) : (
          <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                  <tr>
                    <th className="w-20 px-4 py-3">تصویر</th>
                    <th className="min-w-56 px-4 py-3">نام</th>
                    <th className="px-4 py-3">والد</th>
                    <th className="px-4 py-3">ترتیب</th>
                    <th className="px-4 py-3">محصول</th>
                    <th className="px-4 py-3">زیرمجموعه</th>
                    <th className="px-4 py-3">وضعیت</th>
                    <th className="min-w-56 px-4 py-3">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {categoriesQuery.data?.results.map((category) => {
                    const parentTitle =
                      parentOptionsQuery.data?.find((item) => item.id === category.parent)?.title || "-";

                    return (
                      <tr key={category.id} className="border-t border-[#E3E8EF]">
                        <td className="px-4 py-3">
                          <CategoryImage category={category} />
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-black text-[#1F2933]">{category.title}</p>
                          <p className="mt-1 text-xs font-bold text-[#697586]">{category.slug}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-[#364152]">{parentTitle}</td>
                        <td className="px-4 py-3 font-black text-[#1F2933]">
                          {numberFormatter.format(category.sort_order)}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#364152]">
                          {numberFormatter.format(category.product_count)}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#364152]">
                          {numberFormatter.format(category.children_count)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge isActive={category.is_active} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCategory(category)}
                              className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
                            >
                              ویرایش
                            </button>
                            <button
                              type="button"
                              disabled={deleteMutation.isPending}
                              onClick={() => handleDelete(category)}
                              className="inline-flex h-9 items-center rounded-md border border-[#F3B1A6] bg-white px-3 text-xs font-black text-[#B42318] transition hover:bg-[#FEF3F2] disabled:opacity-50"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {categoriesQuery.data?.results.map((category) => (
                <article key={category.id} className="rounded-lg border border-[#E3E8EF] p-4">
                  <div className="flex gap-3">
                    <CategoryImage category={category} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-black text-[#1F2933]">{category.title}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">{category.slug}</p>
                    </div>
                    <StatusBadge isActive={category.is_active} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-black text-[#697586]">ترتیب</p>
                      <p className="mt-1 font-black text-[#1F2933]">{numberFormatter.format(category.sort_order)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#697586]">محصول</p>
                      <p className="mt-1 font-black text-[#1F2933]">{numberFormatter.format(category.product_count)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#697586]">زیرمجموعه</p>
                      <p className="mt-1 font-black text-[#1F2933]">{numberFormatter.format(category.children_count)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(category)}
                      className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
                    >
                      ویرایش
                    </button>
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => handleDelete(category)}
                      className="inline-flex h-9 items-center rounded-md border border-[#F3B1A6] bg-white px-3 text-xs font-black text-[#B42318] transition hover:bg-[#FEF3F2] disabled:opacity-50"
                    >
                      حذف
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="border-t border-[#E3E8EF] px-4 pb-5">
              <Pagination
                page={page}
                totalPages={totalPages}
                label="صفحه‌بندی دسته‌بندی‌ها"
                onPageChange={setPage}
              />
            </div>
          </section>
        )}
      </div>

      <CategoryForm
        key={editingCategory?.id || "new"}
        editingCategory={editingCategory}
        parentOptions={parentOptionsQuery.data || []}
        onCancelEdit={() => setEditingCategory(null)}
      />
    </div>
  );
}
