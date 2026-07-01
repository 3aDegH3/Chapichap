"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import {
  AdminManager,
  ManageableAdminRole,
  getAdminManagers,
  grantAdminManagerAccess,
  updateAdminManager,
} from "@/lib/admin-api";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" });
const inputClass = "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";
const roleOptions: Array<{ value: ManageableAdminRole; label: string }> = [
  { value: "order_manager", label: "مدیر سفارش‌ها" },
  { value: "product_manager", label: "مدیر محصولات" },
  { value: "support", label: "پشتیبانی" },
];

function ManagerControls({ manager, onChanged, onError }: { manager: AdminManager; onChanged: () => Promise<void>; onError: (message: string) => void }) {
  const [role, setRole] = useState<string>(manager.admin_role);
  const [isActive, setIsActive] = useState(manager.is_active);
  const mutation = useMutation({
    mutationFn: (payload: { admin_role?: ManageableAdminRole | ""; is_active?: boolean }) => updateAdminManager(manager.id, payload),
    onSuccess: async () => { await onChanged(); },
    onError: (error) => onError(getApiErrorMessage(error)),
  });

  if (!manager.can_edit) {
    return <span className="text-xs font-bold text-[#697586]">مدیریت از Django Admin</span>;
  }

  return (
    <div className="flex min-w-64 flex-wrap items-center gap-2">
      <select value={role} onChange={(event) => setRole(event.target.value)} className={`${inputClass} min-w-36 flex-1`}>
        {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <label className="inline-flex h-11 items-center gap-2 rounded-md border border-[#D5DAE1] px-3 text-xs font-black text-[#364152]">
        <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> فعال
      </label>
      <button type="button" onClick={() => mutation.mutate({ admin_role: role as ManageableAdminRole, is_active: isActive })} disabled={mutation.isPending} className="h-10 rounded-md bg-[#1F2933] px-3 text-xs font-black text-white disabled:opacity-60">ذخیره</button>
      <button type="button" onClick={() => window.confirm(`دسترسی ${manager.email} لغو شود؟`) && mutation.mutate({ admin_role: "", is_active: false })} disabled={mutation.isPending} className="h-10 rounded-md border border-[#F3B1A6] px-3 text-xs font-black text-[#B42318] disabled:opacity-60">لغو دسترسی</button>
    </div>
  );
}

export default function AdminSettingsClient() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState<ManageableAdminRole>("support");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const managersQuery = useQuery({
    queryKey: ["admin-managers", page, search, role, isActive],
    queryFn: async () => (await getAdminManagers({ page, search, role, isActive })).data,
  });
  const totalPages = useMemo(() => Math.max(1, Math.ceil((managersQuery.data?.count || 0) / 10)), [managersQuery.data?.count]);

  async function refreshManagers() {
    setError(null);
    setMessage("تغییرات دسترسی ذخیره شد.");
    await queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-activity-logs"] });
  }

  const grantMutation = useMutation({
    mutationFn: () => grantAdminManagerAccess(email.trim(), newRole),
    onSuccess: async () => {
      setEmail("");
      setMessage("دسترسی مدیریتی ثبت شد.");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-activity-logs"] });
    },
    onError: (mutationError) => { setMessage(null); setError(getApiErrorMessage(mutationError)); },
  });

  function updateFilter(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setPage(1); handler(event); };
  }

  function submitGrant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (email.trim()) grantMutation.mutate();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div><p className="text-sm font-black text-[#A15C38]">تنظیمات دسترسی</p><h2 className="mt-2 text-2xl font-black text-[#1F2933]">مدیریت مدیران پنل</h2></div>
        <form onSubmit={submitGrant} className="mt-5 grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ایمیل حساب کاربری" className={inputClass} required />
          <select value={newRole} onChange={(event) => setNewRole(event.target.value as ManageableAdminRole)} className={inputClass}>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <button type="submit" disabled={grantMutation.isPending} className="h-11 rounded-md bg-[#A15C38] px-4 text-sm font-black text-white disabled:opacity-60">افزودن دسترسی</button>
        </form>
      </section>

      {message && <section className="rounded-lg border border-[#ABEFC6] bg-white p-4 text-sm font-bold text-[#027A48]">{message}</section>}
      {error && <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">{error}</section>}

      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5">
        <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <input value={search} onChange={updateFilter((event) => setSearch(event.target.value))} placeholder="نام، ایمیل یا شماره تماس" className={inputClass} />
          <select value={role} onChange={updateFilter((event) => setRole(event.target.value))} className={inputClass}><option value="">همه نقش‌ها</option><option value="super_admin">Super Admin</option>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={isActive} onChange={updateFilter((event) => setIsActive(event.target.value))} className={inputClass}><option value="">همه وضعیت‌ها</option><option value="true">فعال</option><option value="false">غیرفعال</option></select>
          <button type="button" onClick={() => { setPage(1); setSearch(""); setRole(""); setIsActive(""); }} className="h-11 rounded-md bg-[#EEF1F4] px-4 text-sm font-black text-[#364152]">پاک‌کردن</button>
        </div>
      </section>

      {managersQuery.isLoading ? <div className="h-96 animate-pulse rounded-lg bg-white" /> : managersQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">{getApiErrorMessage(managersQuery.error)}</section>
      ) : managersQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center text-sm font-black text-[#697586]">مدیری با این فیلترها پیدا نشد.</section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto xl:block"><table className="min-w-full text-sm"><thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]"><tr><th className="px-4 py-3">مدیر</th><th className="px-4 py-3">نقش</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">آخرین ورود</th><th className="px-4 py-3">مدیریت</th></tr></thead><tbody>{managersQuery.data?.results.map((manager) => <tr key={manager.id} className="border-t border-[#E3E8EF]"><td className="px-4 py-4"><p className="font-black text-[#1F2933]">{manager.full_name}</p><p className="mt-1 text-xs font-bold text-[#697586]">{manager.email}</p></td><td className="px-4 py-4 font-black text-[#364152]">{manager.admin_role_label}</td><td className="px-4 py-4"><span className={`rounded-md px-2 py-1 text-xs font-black ${manager.is_active ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{manager.is_active ? "فعال" : "غیرفعال"}</span></td><td className="px-4 py-4 font-bold text-[#697586]">{manager.last_login ? dateFormatter.format(new Date(manager.last_login)) : "-"}</td><td className="px-4 py-4"><ManagerControls manager={manager} onChanged={refreshManagers} onError={(value) => { setMessage(null); setError(value); }} /></td></tr>)}</tbody></table></div>
          <div className="grid gap-3 p-4 xl:hidden">{managersQuery.data?.results.map((manager) => <article key={manager.id} className="rounded-lg border border-[#E3E8EF] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-[#1F2933]">{manager.full_name}</p><p className="mt-1 text-xs font-bold text-[#697586]">{manager.email}</p></div><span className={`rounded-md px-2 py-1 text-xs font-black ${manager.is_active ? "bg-[#ECFDF3] text-[#027A48]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{manager.is_active ? "فعال" : "غیرفعال"}</span></div><p className="my-4 text-sm font-black text-[#364152]">{manager.admin_role_label}</p><ManagerControls manager={manager} onChanged={refreshManagers} onError={(value) => { setMessage(null); setError(value); }} /></article>)}</div>
          <div className="border-t border-[#E3E8EF] px-4 pb-5"><Pagination page={page} totalPages={totalPages} label="صفحه‌بندی مدیران" onPageChange={setPage} /></div>
        </section>
      )}
    </div>
  );
}
