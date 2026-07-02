export default function AdminReply({ reply, repliedAt }: { reply: string; repliedAt?: string | null }) {
  if (!reply) return null;

  return (
    <div className="mt-5 rounded-2xl border-r-4 border-[#D2AD70] bg-[#F6F1E8] px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-black text-[#333230]">پاسخ چاپی چاپ</p>
        {repliedAt && (
          <time className="text-xs font-bold text-[#8B857D]">
            {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(repliedAt))}
          </time>
        )}
      </div>
      <p className="mt-2 whitespace-pre-line text-sm font-medium leading-8 text-[#6F6A63]">{reply}</p>
    </div>
  );
}

