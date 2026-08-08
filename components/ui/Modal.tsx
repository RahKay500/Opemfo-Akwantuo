"use client";

import { useEffect, type ReactNode } from "react";
import { AlertTriangleIcon, CheckCircleIcon, XIcon } from "./icons";

// Application Components → Modals, "Modal" component, pulled from the
// Figma design system ("gfgfg" in the Figma MCP), node 4057:415205 — a
// huge template library (~60 "Type=" variants: Login, Sign up, Payment
// details, Calendar event, File upload, AI assistant, etc.) built from
// two shared primitives: "_Modal header" (node 4055:413620, featured
// icon + title + supportingText + close X + divider) and "_Modal
// actions" (node 4057:414352, a right-aligned or full-width button row).
// Only the shared shell + those two primitives are implemented — the ~60
// pre-populated content templates are app-specific screens, not
// primitives, and this app's existing modal-like flows (OTP entry,
// facility admin activation, delete confirmations) will compose their
// own body content into this shell rather than needing a matching
// pre-built template.
export type ModalVariant = "default" | "success" | "warning" | "destructive";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  variant?: ModalVariant;
  showIcon?: boolean;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const ICON_STYLES: Record<ModalVariant, { bg: string; fg: string; icon: typeof CheckCircleIcon }> = {
  default: { bg: "bg-brand-50", fg: "text-brand-600", icon: CheckCircleIcon },
  success: { bg: "bg-success-50", fg: "text-success-600", icon: CheckCircleIcon },
  warning: { bg: "bg-warning-50", fg: "text-warning-600", icon: AlertTriangleIcon },
  destructive: { bg: "bg-error-50", fg: "text-error-600", icon: AlertTriangleIcon },
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  variant = "default",
  showIcon = true,
  children,
  actions,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const { bg, fg, icon: Icon } = ICON_STYLES[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/70" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex w-full max-w-[400px] flex-col rounded-xl bg-white shadow-lg ${className ?? ""}`}
      >
        <div className="flex flex-col gap-4 px-6 pt-6">
          {showIcon && (
            <span className={`flex size-12 items-center justify-center rounded-full ${bg}`}>
              <Icon className={`size-6 ${fg}`} />
            </span>
          )}
          <div className="flex flex-col gap-0.5">
            <p className="font-heading text-md font-semibold text-gray-900">{title}</p>
            {description && <p className="font-body text-sm text-gray-600">{description}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
        >
          <XIcon className="size-6" />
        </button>
        {children && <div className="px-6 pt-5">{children}</div>}
        {actions && <div className="flex items-center justify-end gap-3 p-6">{actions}</div>}
        {!actions && <div className="h-6" />}
      </div>
    </div>
  );
}
