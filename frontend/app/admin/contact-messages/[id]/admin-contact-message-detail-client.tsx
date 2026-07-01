"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, ReactNode, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getApiErrorMessage } from "@/lib/api";
import {
  AdminContactMessageInternalNote,
  AdminContactMessageStatus,
  createAdminContactMessageInternalNote,
  deleteAdminContactMessage,
  deleteAdminContactMessageInternalNote,
  getAdminContactMessage,
  getAdminContactMessageInternalNotes,
  updateAdminContactMessageInternalNote,
  updateAdminContactMessageStatus,
} from "@/lib/admin-api";

const statusOptions: Array<{ value: AdminContactMessageStatus; label: string }> = [
  { value: "new", label: "جدید" },
  { value: "read", label: "خوانده‌شده" },
  { value: "replied", label: "پاسخ داده‌شده" },
  { value: "closed", label: "بسته‌شده" },
];
const dateFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const inputClass = "h-11 w-full rounded-md border border-[#D5DAE1] bg-white px-3 text-sm font-bold text-[#1F2933] outline-none focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";
const textAreaClass = "min-h-28 w-full rounded-md border border-[#D5DAE1] bg-white px-3 py-3 text-sm font-bold text-[#1F2933] outline-none focus:border-[#CFA15F] focus:ring-2 focus:ring-[#CFA15F]/20";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
      <h3 className="text-base font-black text-[#1F2933]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function NoteItem({
  note,
  editing,
  editingText,
  onStartEdit,
  onTextChange,
  onSave,
  onCancel,
  onDelete,
}: {
  note: AdminContactMessageInternalNote;
  editing: boolean;
  editingText: string;
  onStartEdit: () => void;
  onTextChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="border-t border-[#E3E8EF] py-4 first:border-t-0 first:pt-0">
      {editing ? (
        <div className="space-y-3">
          <textarea value={editingText} onChange={(event) => onTextChange(event.target.value)} className={textAreaClass} />
          <div className="flex gap-2">
            <button type="button" onClick={onSave} className="h-9 rounded-md bg-[#1F2933] px-3 text-xs font-black text-white">ذخیره</button>
            <button type="button" onClick={onCancel} className="h-9 rounded-md bg-[#EEF1F4] px-3 text-xs font-black text-[#364152]">انصراف</button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm font-bold leading-7 text-[#364152]">{note.text}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-[#697586]">{note.author_label}، {dateFormatter.format(new Date(note.created_at))}</p>
            {note.can_edit && (
              <div className="flex gap-2">
                <button type="button" onClick={onStartEdit} className="text-xs font-black text-[#175CD3]">ویرایش</button>
                <button type="button" onClick={onDelete} className="text-xs font-black text-[#B42318]">حذف</button>
              </div>
            )}
          </div>
        </>
      )}
    </article>
  );
}

export default function AdminContactMessageDetailClient({ messageId }: { messageId: number }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AdminContactMessageStatus | null>(null);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useQuery({
    queryKey: ["admin-contact-message", messageId],
    queryFn: async () => (await getAdminContactMessage(messageId)).data,
  });
  const notesQuery = useQuery({
    queryKey: ["admin-contact-message-notes", messageId],
    queryFn: async () => (await getAdminContactMessageInternalNotes(messageId)).data,
  });

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["admin-contact-message", messageId] });
    await queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] });
    await queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
  }

  const statusMutation = useMutation({
    mutationFn: () => updateAdminContactMessageStatus(messageId, status || detailQuery.data?.status || "read"),
    onSuccess: async () => { setStatus(null); setError(null); await refresh(); },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const createNoteMutation = useMutation({
    mutationFn: () => createAdminContactMessageInternalNote(messageId, noteText),
    onSuccess: async () => { setNoteText(""); setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-contact-message-notes", messageId] }); await refresh(); },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const updateNoteMutation = useMutation({
    mutationFn: ({ noteId, text }: { noteId: number; text: string }) => updateAdminContactMessageInternalNote(messageId, noteId, text),
    onSuccess: async () => { setEditingNoteId(null); setEditingNoteText(""); setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-contact-message-notes", messageId] }); },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => deleteAdminContactMessageInternalNote(messageId, noteId),
    onSuccess: async () => { setError(null); await queryClient.invalidateQueries({ queryKey: ["admin-contact-message-notes", messageId] }); },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });
  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminContactMessage(messageId),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["admin-contact-messages"] }); router.replace("/admin/contact-messages"); },
    onError: (mutationError) => setError(getApiErrorMessage(mutationError)),
  });

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (noteText.trim()) createNoteMutation.mutate();
  }

  if (detailQuery.isLoading) return <div className="h-[520px] animate-pulse rounded-lg bg-white" />;
  if (detailQuery.isError || !detailQuery.data) {
    return <section className="rounded-lg border border-[#F3B1A6] bg-white p-5 text-sm font-bold text-[#B42318]">{getApiErrorMessage(detailQuery.error)}</section>;
  }

  const item = detailQuery.data;
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-[#D5DAE1] bg-white p-5 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.45)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href="/admin/contact-messages" className="text-sm font-black text-[#A15C38] underline-offset-4 hover:underline">بازگشت به پیام‌ها</Link>
            <h2 className="mt-2 text-2xl font-black text-[#1F2933]">{item.subject_label}</h2>
            <p className="mt-2 text-sm font-bold text-[#697586]">{item.full_name}، {dateFormatter.format(new Date(item.created_at))}</p>
          </div>
          <button
            type="button"
            onClick={() => window.confirm("این پیام به‌صورت نرم حذف شود؟") && deleteMutation.mutate()}
            className="h-10 rounded-md border border-[#F3B1A6] px-4 text-sm font-black text-[#B42318]"
          >
            حذف پیام
          </button>
        </div>
      </section>

      {error && <section className="rounded-lg border border-[#F3B1A6] bg-white p-4 text-sm font-bold text-[#B42318]">{error}</section>}

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <Panel title="متن کامل پیام">
            <p className="whitespace-pre-wrap text-sm font-bold leading-8 text-[#1F2933]">{item.message}</p>
          </Panel>
          <Panel title="یادداشت‌های داخلی">
            <form onSubmit={submitNote} className="space-y-3 border-b border-[#E3E8EF] pb-5">
              <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="یادداشت فقط برای مدیران" className={textAreaClass} />
              <button type="submit" disabled={!noteText.trim() || createNoteMutation.isPending} className="h-10 rounded-md bg-[#1F2933] px-4 text-sm font-black text-white disabled:opacity-60">ثبت یادداشت</button>
            </form>
            <div className="mt-5">
              {notesQuery.isLoading ? <div className="h-24 animate-pulse rounded-md bg-[#F8FAFC]" /> : notesQuery.data?.length ? notesQuery.data.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  editing={editingNoteId === note.id}
                  editingText={editingNoteText}
                  onStartEdit={() => { setEditingNoteId(note.id); setEditingNoteText(note.text); }}
                  onTextChange={setEditingNoteText}
                  onSave={() => editingNoteText.trim() && updateNoteMutation.mutate({ noteId: note.id, text: editingNoteText })}
                  onCancel={() => { setEditingNoteId(null); setEditingNoteText(""); }}
                  onDelete={() => window.confirm("این یادداشت حذف شود؟") && deleteNoteMutation.mutate(note.id)}
                />
              )) : <p className="text-sm font-bold text-[#697586]">یادداشتی ثبت نشده است.</p>}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="اطلاعات تماس">
            <dl className="space-y-4 text-sm">
              <div><dt className="text-xs font-black text-[#697586]">نام</dt><dd className="mt-1 font-black text-[#1F2933]">{item.full_name}</dd></div>
              <div><dt className="text-xs font-black text-[#697586]">شماره تماس</dt><dd className="mt-1 font-black text-[#1F2933]" dir="ltr">{item.phone}</dd></div>
              <div><dt className="text-xs font-black text-[#697586]">اجازه تماس</dt><dd className="mt-1 font-black text-[#1F2933]">{item.contact_permission ? "دارد" : "ندارد"}</dd></div>
            </dl>
          </Panel>
          <Panel title="وضعیت پیگیری">
            <form onSubmit={(event) => { event.preventDefault(); statusMutation.mutate(); }} className="space-y-3">
              <select value={status || item.status} onChange={(event) => setStatus(event.target.value as AdminContactMessageStatus)} className={inputClass}>
                {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <button type="submit" disabled={statusMutation.isPending} className="h-10 w-full rounded-md bg-[#A15C38] px-4 text-sm font-black text-white disabled:opacity-60">ثبت وضعیت</button>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
}
