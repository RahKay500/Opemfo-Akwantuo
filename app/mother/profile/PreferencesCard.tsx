"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Preferences {
  notifyAppointments: boolean;
  notifyReferralUpdates: boolean;
  notifyEducationalContent: boolean;
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-6 w-11 shrink-0 items-center rounded-badge px-0.5 transition-colors",
        on ? "justify-end bg-lilac-mid" : "justify-start bg-lilac-light"
      )}
    >
      <span className={cn("size-5 rounded-badge", on ? "bg-[#6A1F8A]" : "bg-[#9CA3AF]")} />
    </button>
  );
}

export default function PreferencesCard({ initial }: { initial: Preferences }) {
  const [prefs, setPrefs] = useState(initial);

  async function update(key: keyof Preferences) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await fetch("/api/mother/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  const ROWS: { key: keyof Preferences; label: string }[] = [
    { key: "notifyAppointments", label: "Appointment reminders" },
    { key: "notifyReferralUpdates", label: "Referral updates" },
    { key: "notifyEducationalContent", label: "Educational content" },
  ];

  return (
    <div className="rounded-card bg-white p-5 shadow-card">
      <p className="font-heading text-base font-bold text-text-primary">Preferences</p>
      <div className="mt-3 flex flex-col">
        {ROWS.map((row, i) => (
          <div
            key={row.key}
            className={cn("flex h-14 items-center justify-between", i < ROWS.length - 1 && "border-b border-border-color")}
          >
            <p className="font-body text-sm text-text-primary">{row.label}</p>
            <Toggle on={prefs[row.key]} onClick={() => update(row.key)} />
          </div>
        ))}
      </div>
    </div>
  );
}
