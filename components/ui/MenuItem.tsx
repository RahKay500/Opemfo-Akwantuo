"use client";

import type { ReactNode } from "react";

// Application Components → Command menus, "_Command dropdown menu item"
// primitive, pulled from the Figma design system ("gfgfg" in the Figma
// MCP), node 3307:404956 (Type=Default/Icon leading/Avatar leading/Dot
// leading, Text=Default/Stacked, Size=sm/md, State=Default/Hover/Focus).
// The full "Command bar" (⌘K-style search palette with sections, a
// scrollable results list, and a keyboard-navigation footer, node
// 3307:407570) is skipped entirely — this is a mobile-first app with no
// keyboard-driven power-user workflows, so a command palette doesn't fit
// any real interaction in it. The atomic row itself is genuinely
// reusable as a general dropdown/menu-item primitive (this app's
// existing RowActionsMenu/HeaderIdentityMenu hand-roll their own rows
// today), so that's what's built: label + optional supporting text
// (inline for compact rows, stacked below for icon-leading rows) +
// optional leading icon + optional trailing keyboard-shortcut badge.
export interface MenuItemProps {
  label: string;
  supportingText?: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick?: () => void;
  className?: string;
}

export default function MenuItem({ label, supportingText, icon, shortcut, onClick, className }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-gray-50 ${className ?? ""}`}
    >
      {icon && (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600">
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span className="truncate font-body text-sm font-medium text-gray-900">{label}</span>
        {supportingText && (
          <span className="truncate font-body text-sm text-gray-600">{supportingText}</span>
        )}
      </span>
      {shortcut && (
        <span className="shrink-0 rounded-xs border border-gray-200 bg-gray-50 px-1 py-0.5 font-body text-sm font-medium text-gray-600">
          {shortcut}
        </span>
      )}
    </button>
  );
}
