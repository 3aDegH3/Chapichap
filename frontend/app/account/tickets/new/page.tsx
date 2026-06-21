"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api";
import { createTicket, getAccountOrders } from "@/lib/account-api";
import type { Order } from "@/lib/checkout-api";

const categories = [
  { value: "order", label: "پیگیری سفارش" },
  { value: "payment", label: "مشکل پرداخت" },
  { value: "address", label: "تغییر آدرس" },
  { value: "design_file", label: "مشکل فایل یا طرح" },
  { value: "cancel", label: "درخواست لغو" },
  { value: "return", label: "مرجوعی" },
  { value: "product", label: "سؤال محصول" },
  { value: "other", label: "سایر موارد" },
];

const priorities = [
  { value: "low", label: "کم" },
  { value: "normal", label: "معمولی" },
  { value: "high", label: "زیاد" },
  { value: "urgent", label: "فوری" },
];

const schema = z.object({
  subject: z.string().trim().min(3, "موضوع را وارد کنید."),
  category: z.string().min(1, "دسته‌بندی را انتخاب کنید."),
  priority: z.string().min(1, "اولویت را انتخاب کنید."),
  order: z.string().optional(),
  message: z.string().trim().min(10, "متن پیام را کامل‌تر وارد کنید."),
});

type FormValues = z.infer<typeof schema>;

export default function NewTicketPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      category: "order",
      priority: "normal",
      order: "",
      message: "",
    },
  });

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      try {
        const data = await getAccountOrders();
        if (mounted) setOrders(data.orders);
      } catch {
        if (mounted) setOrders([]);
      }
    }

    void loadOrders();

    return () => {
      mounted = false;
    };
  }, []);

  async function submit(values: FormValues) {
    setError("");

    try {
      const data = await createTicket({
        subject: values.subject,
        category: values.category,
        priority: values.priority,
        order: values.order ? Number(values.order) : null,
        message: values.message,
        files,
      });
      router.push(`/account/tickets/${data.ticket.id}`);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    }
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-[var(--secondary)]">پشتیبانی</p>
          <h2 className="mt-2 text-2xl font-black text-[var(--dark)]">ثبت تیکت جدید</h2>
        </div>
        <Link href="/account/tickets" className="text-sm font-black text-gray-500">
          بازگشت
        </Link>
      </div>

      {error && <Alert variant="error" className="mt-5">{error}</Alert>}

      <form onSubmit={handleSubmit(submit)} className="mt-6 grid gap-5">
        <Input id="subject" label="موضوع" error={errors.subject?.message} {...register("subject")} />

        <div className="grid gap-5 sm:grid-cols-3">
          <SelectField id="category" label="دسته‌بندی" error={errors.category?.message} register={register("category")}>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </SelectField>

          <SelectField id="priority" label="اولویت" error={errors.priority?.message} register={register("priority")}>
            {priorities.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </SelectField>

          <SelectField id="order" label="سفارش مرتبط" error={errors.order?.message} register={register("order")}>
            <option value="">بدون سفارش</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>{order.order_number}</option>
            ))}
          </SelectField>
        </div>

        <label className="block">
          <span className="text-sm font-black text-[var(--dark)]">پیام</span>
          <textarea
            rows={6}
            className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium leading-7 outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-pink-100"
            {...register("message")}
          />
          {errors.message?.message && <span className="mt-2 block text-xs font-bold text-red-600">{errors.message.message}</span>}
        </label>

        <label className="block rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
          <span className="block text-sm font-black text-[var(--dark)]">پیوست‌ها</span>
          <input
            type="file"
            multiple
            className="mt-3 block w-full text-sm font-bold text-gray-600"
            onChange={(event) => setFiles(Array.from(event.target.files || []))}
          />
          {files.length > 0 && (
            <div className="mt-3 grid gap-2 text-xs font-bold text-gray-600">
              {files.map((file) => (
                <span key={`${file.name}-${file.size}`}>{file.name}</span>
              ))}
            </div>
          )}
        </label>

        <Button type="submit" size="lg" isLoading={isSubmitting}>
          ثبت تیکت
        </Button>
      </form>
    </section>
  );
}

function SelectField({
  id,
  label,
  error,
  register,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-[var(--dark)]">{label}</span>
      <select
        id={id}
        className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-pink-100"
        {...register}
      >
        {children}
      </select>
      {error && <span className="mt-2 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}
