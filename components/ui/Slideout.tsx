"use client";

import { useEffect, type ReactNode } from "react";
import { XIcon } from "./icons";

// Application Components → Slideout menus, "_Slide out menu header"
// primitive (node 1239:120673, Tabs=False/True) + the "Slide out menu"
// shell it lives in (node 1240:137582) — pulled from the Figma design
// system ("gfgfg" in the Figma MCP). Only the shared shell + header are
// implemented; the ~20 "Type=" content templates (Filters, Payment
// details, Team members, Notification settings, A.I. assistant, etc.)
// are app-specific screens, not primitives, same reasoning as Modal and
// BottomSheet. A right-edge panel: overlay, optional square featured-icon
// slot, title + supportingText, close X, optional footer actions row.
export interface SlideoutProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function Slideout({ open, onClose, title, description, icon, children, footer, className }: SlideoutProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-gray-900/70" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex h-full w-full max-w-[480px] flex-col bg-white shadow-lg ${className ?? ""}`}
      >
        <div className="flex items-start gap-4 border-b border-gray-200 p-6">
          {icon && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-600">
              {icon}
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="font-heading text-lg font-semibold text-gray-900">{title}</p>
            {description && <p className="font-body text-sm text-gray-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
          >
            <XIcon className="size-5" />
          </button>
        </div>
        {children && <div className="flex-1 overflow-y-auto p-6">{children}</div>}
        {footer && <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">{footer}</div>}
      </div>
    </div>
  );
}
