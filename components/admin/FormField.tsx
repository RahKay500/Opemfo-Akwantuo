import type { ReactNode } from "react";

export default function FormField({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[#1A1A2E]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </label>
      {children}
      {error && <p className="text-xs text-[#DC2626]">{error}</p>}
    </div>
  );
}
