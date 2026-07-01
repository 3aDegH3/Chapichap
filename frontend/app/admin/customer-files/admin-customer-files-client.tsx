"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Pagination from "@/components/ui/Pagination";
import { getApiErrorMessage } from "@/lib/api";
import { AdminCustomerFile, getAdminCustomerFileBlob, getAdminCustomerFiles } from "@/lib/admin-api";

const numberFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const inputClass =
  "h-11 rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none transition focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function formatFileSize(size: number) {
  if (size < 1024) return `${numberFormatter.format(size)} بایت`;
  if (size < 1024 * 1024) return `${numberFormatter.format(Math.round(size / 1024))} کیلوبایت`;
  return `${numberFormatter.format(Math.round((size / (1024 * 1024)) * 10) / 10)} مگابایت`;
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function sourceLabel(source: AdminCustomerFile["source"]) {
  return source === "design" ? "درخواست طراحی" : "پشتیبانی";
}

function RelatedLink({ file }: { file: AdminCustomerFile }) {
  if (file.order_id) {
    return (
      <Link href={`/admin/orders/${file.order_id}`} className="text-[#1F2933] underline-offset-4 hover:underline">
        {file.order_number}
      </Link>
    );
  }

  return <span>{file.related_label || "-"}</span>;
}

async function openCustomerFile(file: AdminCustomerFile, mode: "preview" | "download") {
  const response = await getAdminCustomerFileBlob(file, mode);
  const blobUrl = window.URL.createObjectURL(response.data);

  if (mode === "preview") {
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    return;
  }

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = file.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default function AdminCustomerFilesClient() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const filesQuery = useQuery({
    queryKey: ["admin-customer-files", page, search, source],
    queryFn: async () => {
      const response = await getAdminCustomerFiles({ page, search, source });
      return response.data;
    },
  });

  const totalPages = useMemo(() => {
    if (!filesQuery.data?.count) return 1;
    return Math.max(1, Math.ceil(filesQuery.data.count / 10));
  }, [filesQuery.data?.count]);

  function resetPageOnChange(handler: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setPage(1);
      handler(event);
    };
  }

  async function handleFileAction(file: AdminCustomerFile, mode: "preview" | "download") {
    try {
      setFileError(null);
      await openCustomerFile(file, mode);
    } catch (error) {
      setFileError(getApiErrorMessage(error));
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div>
          <p className="text-sm font-black text-[#A15C38]">مدیریت فایل‌های مشتریان</p>
          <h2 className="mt-2 text-2xl font-black text-[#1F2933]">
            فایل‌های ارسال‌شده به فروشگاه
          </h2>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
          <input
            value={search}
            onChange={resetPageOnChange((event) => setSearch(event.target.value))}
            placeholder="جستجو با نام فایل، مشتری، سفارش یا ارتباط"
            className={inputClass}
          />
          <select
            value={source}
            onChange={resetPageOnChange((event) => setSource(event.target.value))}
            className={inputClass}
          >
            <option value="">همه فایل‌ها</option>
            <option value="design">درخواست طراحی</option>
            <option value="support">پشتیبانی</option>
          </select>
          <button
            type="button"
            onClick={() => void filesQuery.refetch()}
            disabled={filesQuery.isFetching}
            className="inline-flex h-11 items-center justify-center rounded-md border border-[#D5DAE1] bg-white px-4 text-sm font-black text-[#364152] transition hover:bg-[#EEF1F4] disabled:opacity-60"
          >
            {filesQuery.isFetching ? "در حال دریافت" : "به‌روزرسانی"}
          </button>
        </div>
      </section>

      {fileError && (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">
          {fileError}
        </section>
      )}

      {filesQuery.isLoading ? (
        <div className="h-96 animate-pulse rounded-lg bg-white" />
      ) : filesQuery.isError ? (
        <section className="rounded-lg border border-[#F3B1A6] bg-white p-5">
          <p className="text-sm font-black text-[#B42318]">خطا در دریافت فایل‌ها</p>
          <p className="mt-2 text-sm font-medium text-[#697586]">
            {getApiErrorMessage(filesQuery.error)}
          </p>
        </section>
      ) : filesQuery.data?.results.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#D5DAE1] bg-white p-8 text-center">
          <p className="text-base font-black text-[#1F2933]">فایلی پیدا نشد.</p>
          <p className="mt-2 text-sm font-bold text-[#697586]">فیلترها را تغییر بده یا جستجو را پاک کن.</p>
        </section>
      ) : (
        <section className="rounded-lg border border-[#D5DAE1] bg-white shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-[#F8FAFC] text-right text-xs font-black text-[#697586]">
                <tr>
                  <th className="min-w-64 px-4 py-3">نام فایل</th>
                  <th className="px-4 py-3">نوع</th>
                  <th className="px-4 py-3">حجم</th>
                  <th className="px-4 py-3">تاریخ آپلود</th>
                  <th className="px-4 py-3">ارتباط</th>
                  <th className="px-4 py-3">آپلودکننده</th>
                  <th className="min-w-44 px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filesQuery.data?.results.map((file) => (
                  <tr key={`${file.source}-${file.id}`} className="border-t border-[#E3E8EF]">
                    <td className="px-4 py-3">
                      <p className="font-black text-[#1F2933]">{file.filename}</p>
                      <p className="mt-1 text-xs font-bold text-[#697586]">{sourceLabel(file.source)}</p>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{file.mime_type || "-"}</td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{formatFileSize(file.file_size)}</td>
                    <td className="px-4 py-3 font-bold text-[#697586]">{formatDate(file.created_at)}</td>
                    <td className="px-4 py-3 font-bold text-[#364152]">
                      <RelatedLink file={file} />
                    </td>
                    <td className="px-4 py-3 font-bold text-[#364152]">{file.uploaded_by_label || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {file.preview_url && (
                          <button
                            type="button"
                            onClick={() => void handleFileAction(file, "preview")}
                            className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152] transition hover:bg-[#EEF1F4]"
                          >
                            پیش‌نمایش
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => void handleFileAction(file, "download")}
                          className="inline-flex h-9 items-center rounded-md bg-[#1F2933] px-3 text-xs font-black text-white transition hover:bg-[#111827]"
                        >
                          دانلود
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {filesQuery.data?.results.map((file) => (
              <article key={`${file.source}-${file.id}`} className="rounded-lg border border-[#E3E8EF] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black text-[#1F2933]">{file.filename}</p>
                    <p className="mt-1 text-xs font-bold text-[#697586]">{sourceLabel(file.source)}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[#EEF1F4] px-2 py-1 text-xs font-black text-[#364152]">
                    {formatFileSize(file.file_size)}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <p className="font-bold text-[#364152]">ارتباط: <RelatedLink file={file} /></p>
                  <p className="font-bold text-[#697586]">{formatDate(file.created_at)}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {file.preview_url && (
                    <button type="button" onClick={() => void handleFileAction(file, "preview")} className="inline-flex h-9 items-center rounded-md border border-[#D5DAE1] bg-white px-3 text-xs font-black text-[#364152]">
                      پیش‌نمایش
                    </button>
                  )}
                  <button type="button" onClick={() => void handleFileAction(file, "download")} className="inline-flex h-9 items-center rounded-md bg-[#1F2933] px-3 text-xs font-black text-white">
                    دانلود
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="border-t border-[#E3E8EF] px-4 pb-5">
            <Pagination
              page={page}
              totalPages={totalPages}
              label="صفحه‌بندی فایل‌های مشتریان"
              onPageChange={setPage}
            />
          </div>
        </section>
      )}
    </div>
  );
}
