"use client";

import type { ReactNode } from "react";
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XIcon } from "./icons";

// Application Components → Alerts & notifications, "Alert" component,
// pulled from the Figma design system ("gfgfg" in the Figma MCP), node
// 1130:81134 (Color=Default/Brand/Gray/Error/Warning/Success,
// Size=Floating/Full-width). Only "Floating" (the bordered, rounded
// card-style banner) is implemented — "Full-width" is a thinner bar
// variant for the same content, skipped as a minor layout variant not
// worth a second component. The sibling "Notification" family on this
// same Figma page (toast cards: Primary/Gray/Success/Warning/Error/No
// icon, Avatar, Image, Progress indicator) is skipped — this app has no
// toast/notification-queue system yet, and introducing one is a bigger
// architectural decision than a single primitive.
export type AlertColor = "default" | "brand" | "gray" | "error" | "warning" | "success";

export interface AlertProps {
  title: string;
  description?: string;
  color?: AlertColor;
  actions?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const COLOR_STYLES: Record<AlertColor, { icon: typeof InfoIcon; iconColor: string; ring: string }> = {
  default: { icon: InfoIcon, iconColor: "text-gray-500", ring: "border-gray-300" },
  brand: { icon: InfoIcon, iconColor: "text-brand-600", ring: "border-brand-300" },
  gray: { icon: InfoIcon, iconColor: "text-gray-500", ring: "border-gray-300" },
  error: { icon: AlertTriangleIcon, iconColor: "text-error-600", ring: "border-error-300" },
  warning: { icon: AlertTriangleIcon, iconColor: "text-warning-600", ring: "border-warning-300" },
  success: { icon: CheckCircleIcon, iconColor: "text-success-600", ring: "border-success-300" },
};

export default function Alert({ title, description, color = "default", actions, onClose, className }: AlertProps) {
  const { icon: Icon, iconColor } = COLOR_STYLES[color];

  return (
    <div className={`relative flex w-full items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-xs ${className ?? ""}`}>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-md border border-gray-300 ${iconColor}`}>
        <Icon className="size-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-col gap-1 pr-8">
          <p className="font-body text-sm font-semibold text-gray-700">{title}</p>
          {description && <p className="font-body text-sm text-gray-600">{description}</p>}
        </div>
        {actions && <div className="flex items-start gap-3">{actions}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="absolute right-1.5 top-1.5 flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
        >
          <XIcon className="size-5" />
        </button>
      )}
    </div>
  );
}
