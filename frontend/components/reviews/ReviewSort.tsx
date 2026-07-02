import { reviewSortOptions } from "@/lib/reviews-api";

export default function ReviewSort({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex items-center gap-3 text-sm font-black text-[#6F6A63]">
      مرتب‌سازی
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[#E3DED5] bg-white px-4 text-sm font-black text-[#333230] outline-none focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20"
      >
        {reviewSortOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

