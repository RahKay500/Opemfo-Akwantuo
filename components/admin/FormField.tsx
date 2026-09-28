import type { ReactNode } from "react";

export default function FormField({
  label,
  error,
  children,
  required,
  hint,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#1A1A2E]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </label>
      {hint && <p className="text-xs text-[#6B7280]">{hint}</p>}
      {children}
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
