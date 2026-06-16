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
          className="block text-sm font-black text-[var(--dark)]"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={cn(
          "h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-[var(--dark)] outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] focus:ring-4 focus:ring-pink-100",
          error && "border-red-400 focus:border-red-500 focus:ring-red-100",
          className
        )}
        {...props}
      />

      {helperText && !error && (
        <p className="text-xs font-medium text-gray-500">{helperText}</p>
      )}

      {error && <p className="text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}