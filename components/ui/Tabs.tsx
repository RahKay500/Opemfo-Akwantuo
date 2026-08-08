"use client";

// Application Components → Tabs, "Horizontal tabs" component, pulled
// from the Figma design system ("gfgfg" in the Figma MCP), node
// 1118:69893 (Type=Button brand/Button gray/Button border/Button
// minimal/Underline, Size=sm/md, Full width=True/False). Only
// "Underline" is implemented — a bottom-border-highlighted tab row with
// optional count badges — the most broadly reusable pattern and the one
// that matches how this app's existing hand-rolled tab bars already
// look (e.g. admin Settings' SettingsTabs.tsx). The filled-pill Button
// variants and the separate Vertical tabs frame on this Figma page are
// skipped as redundant with the already-built ButtonGroup primitive and
// NavItem, respectively.
export interface TabItem {
  key: string;
  label: string;
  badge?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeKey, onChange, className }: TabsProps) {
  return (
    <div className={`flex w-full items-start gap-3 border-b border-gray-200 ${className ?? ""}`}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            aria-current={isActive ? "true" : undefined}
            className={`flex h-9 items-center justify-center gap-2 px-1 pb-3 font-body text-md font-semibold ${
              isActive ? "border-b-2 border-brand-600 text-brand-700" : "text-gray-500"
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-sm font-medium ${
                  isActive ? "border-brand-200 bg-brand-50 text-brand-700" : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
