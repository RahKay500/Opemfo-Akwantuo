"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { key: "profile", label: "Profile" },
  { key: "password", label: "Change Password" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsTabs({
  profile,
  password,
  accent,
}: {
  profile: ReactNode;
  password: ReactNode;
  accent: string;
}) {
  const [active, setActive] = useState<TabKey>("profile");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex w-fit gap-1 rounded-lg border border-[#E2E8F0] bg-white p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className="rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={
              active === tab.key
                ? { backgroundColor: accent, color: "#FFFFFF" }
                : { color: "#6B7280" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "profile" ? profile : password}
    </div>
  );
}
