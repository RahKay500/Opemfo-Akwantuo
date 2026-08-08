"use client";

import type { ReactNode } from "react";
import Avatar, { type AvatarProps } from "./Avatar";
import { DotsVerticalIcon } from "./icons";

// Application Components → Card headers, "Card header" component, pulled
// from the Figma design system ("gfgfg" in the Figma MCP), node 1211:169
// (Avatar=True/False, Breakpoint=Desktop/Mobile). Title (text-lg
// semibold) + optional badge pill + optional supporting text + optional
// leading Avatar (reuses the app's own Avatar primitive rather than
// duplicating avatar markup) + actions slot + optional "..." dropdown
// icon button + optional divider. The dropdown here is a static button —
// wiring an actual open/close menu is left to the consumer (e.g. pairing
// it with a future Dropdown/Command menu primitive), matching how other
// primitives in this batch expose the interactive surface without owning
// app-specific menu content.
export interface CardHeaderProps {
  title: string;
  badge?: string;
  supportingText?: string;
  avatar?: AvatarProps;
  actions?: ReactNode;
  onMoreClick?: () => void;
  divider?: boolean;
  className?: string;
}

export default function CardHeader({
  title,
  badge,
  supportingText,
  avatar,
  actions,
  onMoreClick,
  divider = true,
  className,
}: CardHeaderProps) {
  return (
    <div className={`flex w-full flex-col gap-5 bg-white ${className ?? ""}`}>
      <div className="flex w-full items-start gap-4 px-6 pt-5">
        {avatar && <Avatar {...avatar} />}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <div className="flex items-center gap-2">
            <p className="truncate font-heading text-lg font-semibold text-gray-900">{title}</p>
            {badge && (
              <span className="shrink-0 rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 font-body text-xs font-medium text-brand-700">
                {badge}
              </span>
            )}
          </div>
          {supportingText && (
            <p className="truncate font-body text-sm text-gray-600">{supportingText}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
        {onMoreClick && (
          <button
            type="button"
            onClick={onMoreClick}
            aria-label="More options"
            className="shrink-0 rounded-sm p-1 text-gray-500 hover:bg-gray-50"
          >
            <DotsVerticalIcon className="size-5" />
          </button>
        )}
      </div>
      {divider && <div className="h-px w-full bg-gray-200" />}
    </div>
  );
}
