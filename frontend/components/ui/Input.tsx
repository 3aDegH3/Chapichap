import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-black text-[#333230]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-xl border border-[#E3DED5] bg-white px-4 text-sm font-medium text-[#333230] outline-none transition placeholder:text-gray-400 focus:border-[#D2AD70] focus:ring-4 focus:ring-[#D2AD70]/20",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      />

      {helperText && !error && (
        <p className="text-xs font-medium text-[#77736D]">{helperText}</p>
      )}

      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}
