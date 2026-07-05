"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, ChevronRightIcon } from "@/components/ui/icons";
import type { Priority } from "@prisma/client";

const PRIORITY_STYLES: Record<Priority, { border: string; bg: string; text: string; label: string }> = {
  CRITICAL: { border: "border-critical", bg: "bg-critical-bg", text: "text-critical", label: "Critical Priority" },
  HIGH: { border: "border-high", bg: "bg-high-bg", text: "text-high", label: "High Priority" },
  MEDIUM: { border: "border-medium", bg: "bg-medium-bg", text: "text-medium", label: "Medium Priority" },
  LOW: { border: "border-low", bg: "bg-low-bg", text: "text-low", label: "Low Priority" },
};

const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

interface ToggleRow {
  key: "includeHistory" | "includeVitals" | "includeFlags";
  label: string;
}

const TOGGLES: ToggleRow[] = [
  { key: "includeHistory", label: "Full antenatal history" },
  { key: "includeVitals", label: "Current vitals" },
  { key: "includeFlags", label: "Flag history" },
];

export default function ReferralCreationForm({
  patientId,
  systemSuggestedPriority,
  suggestedReason,
  facilities,
}: {
  patientId: string;
  systemSuggestedPriority: Priority;
  suggestedReason: string;
  facilities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [overriding, setOverriding] = useState(false);
  const [priority, setPriority] = useState<Priority>(systemSuggestedPriority);
  const [overrideReason, setOverrideReason] = useState("");
  const [toFacilityId, setToFacilityId] = useState(facilities[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [transportMethod, setTransportMethod] = useState("");
  const [toggles, setToggles] = useState({ includeHistory: true, includeVitals: true, includeFlags: true });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const style = PRIORITY_STYLES[priority];

  async function handleSubmit() {
    setError(null);
    if (!toFacilityId) {
      setError("Choose a facility to refer to.");
      return;
    }
    if (!reason.trim()) {
      setError("Describe the reason for this referral.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          toFacilityId,
          priority,
          systemSuggestedPriority,
          nurseOverrideReason: priority !== systemSuggestedPriority ? overrideReason.trim() || undefined : undefined,
          reason: reason.trim(),
          additionalNotes: notes.trim() || undefined,
          transportMethod: transportMethod || undefined,
          ...toggles,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      router.push(`/midwife/patients/${patientId}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 px-6 pb-10 pt-6">
      <div>
        <p className="font-body text-[13px] font-medium text-text-secondary">System suggested priority</p>
        <div className={cn("mt-2 rounded-card border-l-4 py-[18px] pl-[22px] pr-[18px]", style.border, style.bg)}>
          <div className="flex items-center gap-2.5">
            <AlertTriangleIcon className={cn("size-6", style.text)} />
            <p className={cn("font-heading text-[19px] font-bold", style.text)}>{style.label}</p>
          </div>
          <p className="mt-2 font-body text-[13px] text-text-primary">{suggestedReason}</p>
          <button
            type="button"
            onClick={() => setOverriding((v) => !v)}
            className="mt-3 font-body text-[13px] font-medium text-pink-deep underline"
          >
            Override priority
          </button>

          {overriding && (
            <div className="mt-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2.5">
                {PRIORITIES.map((p) => {
                  const s = PRIORITY_STYLES[p];
                  const selected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "flex items-center justify-between rounded-input border-2 p-3.5 font-body text-[13px] font-medium",
                        selected ? cn(s.border, s.bg, s.text) : "border-border-color bg-white text-text-secondary"
                      )}
                    >
                      {p.charAt(0) + p.slice(1).toLowerCase()}
                      {selected && <ChevronRightIcon className="size-3.5 rotate-90" />}
                    </button>
                  );
                })}
              </div>
              <div>
                <label className="font-body text-xs font-medium text-text-secondary">
                  Reason for override (if changed)
                </label>
                <input
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Optional — explain your clinical reasoning"
                  className="mt-1.5 h-11 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-[13px] text-text-primary outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="font-body text-[13px] font-medium text-text-secondary">Refer to facility</label>
          <select
            value={toFacilityId}
            onChange={(e) => setToFacilityId(e.target.value)}
            className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
          >
            {facilities.length === 0 && <option value="">No facilities available</option>}
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-body text-[13px] font-medium text-text-secondary">Reason for referral</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Describe the clinical reason for this referral..."
            className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="font-body text-[13px] font-medium text-text-secondary">Additional notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional"
            className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-sm text-text-primary outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="font-body text-[13px] font-medium text-text-secondary">Transport</label>
          <select
            value={transportMethod}
            onChange={(e) => setTransportMethod(e.target.value)}
            className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
          >
            <option value="">Select transport urgency</option>
            <option value="Ambulance">Ambulance</option>
            <option value="Private vehicle">Private vehicle</option>
            <option value="Public transport">Public transport</option>
          </select>
        </div>
      </div>

      <div>
        <p className="font-heading text-[15px] font-bold text-text-primary">Attach to referral</p>
        <div className="mt-3 flex flex-col gap-3">
          {TOGGLES.map((t) => (
            <div key={t.key} className="flex items-center justify-between rounded-input bg-white px-4 py-3.5 shadow-card">
              <span className="font-body text-sm text-text-primary">{t.label}</span>
              <button
                type="button"
                onClick={() => setToggles((prev) => ({ ...prev, [t.key]: !prev[t.key] }))}
                className={cn(
                  "relative h-6 w-11 rounded-badge transition-colors",
                  toggles[t.key] ? "bg-primary" : "bg-border-color"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-badge transition-transform",
                    toggles[t.key] ? "translate-x-[22px] bg-lilac-deeper" : "translate-x-0.5 bg-[#9CA3AF]"
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

      <div className="flex flex-col items-center gap-2">
        <p className="font-body text-xs text-text-secondary">
          This will be sent as {priority.charAt(0) + priority.slice(1).toLowerCase()} priority
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={cn(
            "h-14 w-full rounded-card font-heading text-[17px] font-bold text-white disabled:opacity-60",
            priority === "CRITICAL" ? "bg-critical" : "bg-lilac-dark"
          )}
        >
          {submitting ? "Sending…" : "Send Referral"}
        </button>
      </div>
    </div>
  );
}
