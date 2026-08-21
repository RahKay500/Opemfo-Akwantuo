"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Toggle from "@/components/ui/Toggle";

interface Preferences {
  notifyAppointments: boolean;
  notifyReferralUpdates: boolean;
  notifyEducationalContent: boolean;
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
    <div className="rounded-card bg-white p-5 border border-border-color">
      <p className="font-heading text-base font-bold text-text-primary">Preferences</p>
      <div className="mt-3 flex flex-col">
        {ROWS.map((row, i) => (
          <div
            key={row.key}
            className={cn("flex h-14 items-center justify-between", i < ROWS.length - 1 && "border-b border-border-color")}
          >
            <p className="font-body text-sm text-text-primary">{row.label}</p>
            <Toggle
              checked={prefs[row.key]}
              onChange={() => update(row.key)}
              size="md"
              aria-label={row.label}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
