"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import PriorityBadge from "@/components/ui/PriorityBadge";
import type { DoctorInboxStatus } from "@/lib/queries/doctor-inbox";
import type { Priority, ReferralStatus, VisitType } from "@prisma/client";

const TABS = ["Overview", "Vitals", "Visits", "Referrals"] as const;

// formatRelativeTime assumes a past date ("2 hours ago") — expiresAt is in
// the future, so it needs its own countdown phrasing.
function formatExpiryCountdown(expiresAt: string): string {
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "expired";
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

export interface DoctorRecordVisit {
  id: string;
  visitType: VisitType;
  gestationalAge: number | null;
  daysPostpartum: number | null;
  systolic: number | null;
  diastolic: number | null;
  fetalHeartRate: number | null;
  temperature: number | null;
  weight: number | null;
  flagged: boolean;
  flagReason: string | null;
  flagPriority: Priority | null;
  createdAt: string;
  nurseName: string;
}

export interface DoctorRecordReferral {
  id: string;
  hospitalName: string;
  status: ReferralStatus;
  priority: Priority;
  sentAt: string;
}

export default function DoctorRecordClient({
  shareId,
  status: initialStatus,
  sharedByName,
  reason,
  expiresAt,
  visits,
  referrals,
}: {
  shareId: string;
  status: DoctorInboxStatus;
  sharedByName: string;
  reason: string | null;
  expiresAt: string;
  visits: DoctorRecordVisit[];
  referrals: DoctorRecordReferral[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [status, setStatus] = useState(initialStatus);
  const [submitting, setSubmitting] = useState(false);

  const latestVisit = visits[0] ?? null;
  const activeFlag = latestVisit?.flagged ? latestVisit : null;

  async function handleMarkReviewed() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/referral-shares/${shareId}`, { method: "PATCH" });
      if (res.ok) {
        setStatus("Reviewed");
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 bg-white px-5 py-3">
        <div>
          <p className="font-body text-xs text-text-secondary">
            Shared by <span className="font-medium text-text-primary">{sharedByName}</span>
          </p>
          {reason && <p className="mt-0.5 font-body text-xs text-text-secondary">{reason}</p>}
        </div>
        <span
          className={cn(
            "shrink-0 rounded-badge px-2.5 py-1 font-body text-xs font-medium",
            status === "Active"
              ? "bg-[#F0FDF4] text-[#16A34A]"
              : status === "Reviewed"
                ? "bg-lilac-light text-lilac-deeper"
                : "bg-[#F3F4F6] text-[#6B7280]"
          )}
        >
          {status === "Active" ? `Expires ${formatExpiryCountdown(expiresAt)}` : status}
        </span>
      </div>

      <div className="flex border-b border-border-color bg-white">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 border-b-2 py-3 text-center font-body text-sm font-medium",
              tab === t ? "border-primary text-lilac-deeper" : "border-transparent text-text-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 px-5 pb-32 pt-5">
        {tab === "Overview" && (
          <>
            {latestVisit && (
              <div className="flex rounded-card bg-white p-4 shadow-card">
                <VitalCell
                  emoji="🩸"
                  label="BP"
                  value={latestVisit.systolic && latestVisit.diastolic ? `${latestVisit.systolic}/${latestVisit.diastolic}` : "—"}
                  danger={latestVisit.flagged}
                />
                <div className="w-px bg-border-color" />
                <VitalCell
                  emoji="💓"
                  label="Fetal HR"
                  value={latestVisit.fetalHeartRate ? `${latestVisit.fetalHeartRate} bpm` : "—"}
                />
                <div className="w-px bg-border-color" />
                <VitalCell emoji="🌡" label="Temp" value={latestVisit.temperature ? `${latestVisit.temperature}°C` : "—"} />
              </div>
            )}

            {activeFlag && (
              <div className="rounded-card border-l-4 border-critical bg-critical-bg py-4 pl-5 pr-4">
                <p className="font-body text-xs font-medium text-critical">Active Flag</p>
                <p className="mt-1 font-heading text-[15px] font-bold text-text-primary">
                  {activeFlag.flagReason ?? "Flagged reading"}
                </p>
                <p className="mt-1.5 font-body text-[13px] text-text-secondary">
                  Recorded {formatRelativeTime(activeFlag.createdAt)}
                  {activeFlag.systolic && activeFlag.diastolic
                    ? ` — BP ${activeFlag.systolic}/${activeFlag.diastolic} mmHg.`
                    : "."}
                </p>
              </div>
            )}

            {!latestVisit && <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>}
          </>
        )}

        {tab === "Vitals" && (
          <div className="flex flex-col gap-2.5">
            {visits.length === 0 && <p className="font-body text-sm text-text-secondary">No vitals recorded yet.</p>}
            {visits.map((v) => (
              <div key={v.id} className="rounded-card bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-sm font-bold text-text-primary">{formatDate(v.createdAt)}</p>
                  {v.flagged && <PriorityBadge priority={v.flagPriority ?? "LOW"} className="px-2.5 py-0.5 text-[11px]" />}
                </div>
                <p className="mt-1 font-body text-xs text-text-secondary">
                  {[
                    v.systolic && v.diastolic ? `BP ${v.systolic}/${v.diastolic}` : null,
                    v.fetalHeartRate ? `HR ${v.fetalHeartRate} bpm` : null,
                    v.temperature ? `Temp ${v.temperature}°C` : null,
                    v.weight ? `Weight ${v.weight}kg` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "Visits" && (
          <div className="flex flex-col gap-2.5">
            {visits.length === 0 && <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>}
            {visits.map((v) => (
              <div key={v.id} className="rounded-card bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="rounded-badge bg-lilac-light px-2.5 py-1 font-body text-xs font-medium text-lilac-deeper">
                    {v.visitType === "ANTENATAL" ? "Antenatal" : "Postnatal"}
                  </span>
                  <p className="font-body text-xs text-text-secondary">{formatDate(v.createdAt)}</p>
                </div>
                <p className="mt-2 font-heading text-[15px] font-bold text-text-primary">
                  {v.visitType === "ANTENATAL" ? `Week ${v.gestationalAge ?? "—"} visit` : `Day ${v.daysPostpartum ?? "—"} visit`}
                </p>
                <p className="mt-1 font-body text-xs text-text-secondary">Attended by {v.nurseName}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Referrals" && (
          <div className="flex flex-col gap-2.5">
            {referrals.length === 0 && <p className="font-body text-sm text-text-secondary">No referrals yet.</p>}
            {referrals.map((r) => (
              <div key={r.id} className="rounded-card bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-[15px] font-bold text-text-primary">{r.hospitalName}</p>
                  <PriorityBadge priority={r.priority} className="px-2.5 py-0.5 text-[11px]" />
                </div>
                <p className="mt-1 font-body text-xs text-text-secondary">
                  {formatDate(r.sentAt)} · {r.status.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {status === "Active" && (
        <div className="fixed inset-x-0 bottom-20 z-20 mx-auto flex w-full max-w-[430px] border-t border-border-color bg-white px-5 pb-4 pt-4">
          <button
            type="button"
            onClick={handleMarkReviewed}
            disabled={submitting}
            className="flex h-[52px] flex-1 items-center justify-center rounded-input bg-primary font-heading text-sm font-bold text-lilac-deeper disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Mark as Reviewed"}
          </button>
        </div>
      )}
    </>
  );
}

function VitalCell({ emoji, label, value, danger }: { emoji: string; label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-1">
      <span className="text-lg">{emoji}</span>
      <span className="font-body text-[11px] text-text-secondary">{label}</span>
      <span className={cn("font-heading text-sm font-bold", danger ? "text-critical" : "text-text-primary")}>{value}</span>
    </div>
  );
}
