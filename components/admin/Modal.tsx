"use client";

import type { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Optional footer button row — keeps confirm/cancel markup out of each
  // caller's children instead of every delete/deactivate dialog hand-rolling
  // its own "mt-5 flex justify-end gap-2" footer.
  actions?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-6 py-4">
          <h2 className="text-base font-semibold text-[#1A1A2E]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-[#6B7280] hover:text-[#1A1A2E]"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
          {actions && <div className="mt-5 flex justify-end gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
