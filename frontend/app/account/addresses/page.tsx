"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
  type CustomerAddress,
} from "@/lib/account-api";

const schema = z.object({
  title: z.string().trim().min(2, "عنوان آدرس را وارد کنید."),
  receiver_name: z.string().trim().min(2, "نام گیرنده را وارد کنید."),
  phone: z.string().trim().min(8, "شماره تماس معتبر وارد کنید."),
  province: z.string().trim().min(2, "استان را وارد کنید."),
  city: z.string().trim().min(2, "شهر را وارد کنید."),
  address: z.string().trim().min(10, "آدرس کامل‌تر وارد کنید."),
  postal_code: z.string().trim().min(10, "کد پستی را وارد کنید."),
  plaque: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  is_default: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  title: "",
  receiver_name: "",
  phone: "",
  province: "",
  city: "",
  address: "",
  postal_code: "",
  plaque: "",
  unit: "",
  notes: "",
  is_default: false,
};

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  async function loadAddresses() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getAddresses();
      setAddresses(data.addresses);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadAddresses();
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  function startEdit(address: CustomerAddress) {
    setEditingAddress(address);
    reset({
      title: address.title,
      receiver_name: address.receiver_name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      address: address.address,
      postal_code: address.postal_code,
      plaque: address.plaque || "",
      unit: address.unit || "",
      notes: address.notes || "",
      is_default: address.is_default,
    });
  }

  function clearForm() {
    setEditingAddress(null);
    reset(emptyValues);
  }

  async function submit(values: FormValues) {
    setMessage("");
    setError("");
    try {
      const payload = { ...values, plaque: values.plaque || "", unit: values.unit || "", notes: values.notes || "" };
      if (editingAddress) {
        await updateAddress(editingAddress.id, payload);
        setMessage("آدرس به‌روزرسانی شد.");
      } else {
        await createAddress(payload);
        setMessage("آدرس ذخیره شد.");
      }
      clearForm();
      await loadAddresses();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  async function removeAddress(id: number) {
    setMessage("");
    setError("");
    try {
      await deleteAddress(id);
      setMessage("آدرس حذف شد.");
      await loadAddresses();
    } catch (removeError) {
      setError(getApiErrorMessage(removeError));
    }
  }

  async function makeDefault(id: number) {
    setMessage("");
    setError("");
    try {
      await setDefaultAddress(id);
      setMessage("آدرس پیش‌فرض شد.");
      await loadAddresses();
    } catch (defaultError) {
      setError(getApiErrorMessage(defaultError));
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-[var(--dark)]">آدرس‌های ذخیره‌شده</h2>
        {isLoading ? (
          <div className="mt-6 grid gap-4">{Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-xl bg-gray-100" />)}</div>
        ) : addresses.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center font-bold text-gray-600">هنوز آدرسی ذخیره نشده است.</div>
        ) : (
          <div className="mt-6 grid gap-4">
            {addresses.map((address) => (
              <article key={address.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black text-[var(--dark)]">{address.title}</h3>
                      {address.is_default && <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-black text-green-700">پیش‌فرض</span>}
                    </div>
                    <p className="mt-2 text-sm font-bold text-gray-600">{address.receiver_name}، {address.phone}</p>
                    <p className="mt-2 text-sm leading-7 text-gray-600">{address.province}، {address.city}، {address.address}</p>
                    <p className="mt-2 text-xs font-bold text-gray-500">کد پستی: {address.postal_code}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!address.is_default && <ActionButton onClick={() => void makeDefault(address.id)}>پیش‌فرض</ActionButton>}
                    <ActionButton onClick={() => startEdit(address)}>ویرایش</ActionButton>
                    <ActionButton danger onClick={() => void removeAddress(address.id)}>حذف</ActionButton>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-[var(--dark)]">{editingAddress ? "ویرایش آدرس" : "آدرس جدید"}</h2>
          {editingAddress && <button type="button" onClick={clearForm} className="text-xs font-black text-gray-500">لغو</button>}
        </div>
        {message && <Alert variant="success" className="mt-5">{message}</Alert>}
        {error && <Alert variant="error" className="mt-5">{error}</Alert>}
        <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-4">
          <Input id="title" label="عنوان" error={errors.title?.message} {...register("title")} />
          <Input id="receiver_name" label="گیرنده" error={errors.receiver_name?.message} {...register("receiver_name")} />
          <Input id="phone" label="شماره تماس" inputMode="tel" error={errors.phone?.message} {...register("phone")} />
          <Input id="province" label="استان" error={errors.province?.message} {...register("province")} />
          <Input id="city" label="شهر" error={errors.city?.message} {...register("city")} />
          <label className="block">
            <span className="text-sm font-black text-[var(--dark)]">آدرس کامل</span>
            <textarea rows={3} className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-pink-100" {...register("address")} />
            {errors.address?.message && <span className="mt-2 block text-xs font-bold text-red-600">{errors.address.message}</span>}
          </label>
          <Input id="postal_code" label="کد پستی" inputMode="numeric" error={errors.postal_code?.message} {...register("postal_code")} />
          <Input id="plaque" label="پلاک" error={errors.plaque?.message} {...register("plaque")} />
          <Input id="unit" label="واحد" error={errors.unit?.message} {...register("unit")} />
          <label className="flex items-center gap-3 text-sm font-black text-[var(--dark)]">
            <input type="checkbox" className="h-5 w-5 rounded border-gray-300" {...register("is_default")} />
            آدرس پیش‌فرض باشد
          </label>
          <Button type="submit" isLoading={isSubmitting}>{editingAddress ? "ذخیره ویرایش" : "ذخیره آدرس"}</Button>
        </form>
      </aside>
    </div>
  );
}

function ActionButton({ children, danger, onClick }: { children: ReactNode; danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl border px-4 text-xs font-black ${danger ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-white text-[var(--dark)]"}`}
    >
      {children}
    </button>
  );
}
