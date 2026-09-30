"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import PriorityBadge from "@/components/ui/PriorityBadge";
import IntakeSummary, { type IntakeSummaryData } from "@/components/records/IntakeSummary";
import RequestLabTestSheet from "@/components/ui/RequestLabTestSheet";
import { LabIcon, MessageIcon } from "@/components/ui/icons";
import type { DoctorInboxStatus } from "@/lib/queries/doctor-inbox";
import type { Priority, ReferralStatus, VisitType } from "@prisma/client";

const TABS = ["Overview", "Intake", "Vitals", "Vaccinations", "Visits", "Referrals", "Delivery"] as const;

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

export interface DoctorRecordVaccination {
  id: string;
  type: string;
  doseNumber: number;
  dateGiven: string;
  batchNumber: string | null;
}

export interface DoctorRecordIptpDose {
  id: string;
  doseNumber: number;
  dateGiven: string;
}

export interface DoctorRecordDelivery {
  dateOfDelivery: string | null;
  typeOfDelivery: string | null;
  durationOfLabourHours: number | null;
  durationOfLabourMinutes: number | null;
  estimatedBloodLossMl: number | null;
  statePerineum: string | null;
  birthAttendant: string | null;
  babySex: string | null;
  babyBirthWeightKg: number | null;
  babyCondition: string | null;
}

export default function DoctorRecordClient({
  patientId,
  patientName,
  shareId,
  status: initialStatus,
  sharedByName,
  reason,
  expiresAt,
  visits,
  referrals,
  vaccinations,
  iptpDoses,
  deliveryRecord,
  intake,
  midwifeNextVisitDate,
  nextVisitOverride: initialNextVisitOverride,
  nextVisitOverrideByName: initialNextVisitOverrideByName,
}: {
  patientId: string;
  patientName: string;
  shareId: string;
  status: DoctorInboxStatus;
  sharedByName: string;
  reason: string | null;
  expiresAt: string;
  visits: DoctorRecordVisit[];
  referrals: DoctorRecordReferral[];
  vaccinations: DoctorRecordVaccination[];
  iptpDoses: DoctorRecordIptpDose[];
  deliveryRecord: DoctorRecordDelivery | null;
  intake: IntakeSummaryData;
  midwifeNextVisitDate: string | null;
  nextVisitOverride: string | null;
  nextVisitOverrideByName: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [status, setStatus] = useState(initialStatus);
  const [submitting, setSubmitting] = useState(false);
  const [labSheetOpen, setLabSheetOpen] = useState(false);
  const [nextVisitOverride, setNextVisitOverride] = useState(initialNextVisitOverride);
  const [nextVisitOverrideByName, setNextVisitOverrideByName] = useState(initialNextVisitOverrideByName);
  const [overrideEditing, setOverrideEditing] = useState(false);
  const [overrideDate, setOverrideDate] = useState(initialNextVisitOverride?.slice(0, 10) ?? "");
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [messaging, setMessaging] = useState(false);

  async function handleMessage() {
    setMessaging(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/doctor/messages/${data.conversationId}`);
      }
    } finally {
      setMessaging(false);
    }
  }

  async function saveOverride(date: string | null) {
    setOverrideSubmitting(true);
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}/next-visit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextVisitDate: date }),
      });
      if (res.ok) {
        setNextVisitOverride(date ? new Date(date).toISOString() : null);
        setNextVisitOverrideByName(date ? "you" : null);
        setOverrideEditing(false);
        router.refresh();
      }
    } finally {
      setOverrideSubmitting(false);
    }
  }

  const latestVisit = visits[0] ?? null;
  const activeFlag = latestVisit?.flagged ? latestVisit : null;

  const vaccinationRows = [
    ...vaccinations.map((v) => ({
      id: v.id,
      badge: v.type === "TD" ? "Td" : v.type,
      title: `Dose ${v.doseNumber}${v.batchNumber ? ` · Batch ${v.batchNumber}` : ""}`,
      dateGiven: v.dateGiven,
    })),
    ...iptpDoses.map((d) => ({
      id: d.id,
      badge: "IPTp",
      title: `Dose ${d.doseNumber}`,
      dateGiven: d.dateGiven,
    })),
  ].sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime());

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
            <button
              type="button"
              onClick={() => setLabSheetOpen(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-input border-[1.5px] border-border-color font-body text-sm font-bold text-text-primary"
            >
              <LabIcon className="size-4" />
              Request Lab Test
            </button>

            <button
              type="button"
              onClick={handleMessage}
              disabled={messaging}
              className="flex h-12 items-center justify-center gap-2 rounded-input border-[1.5px] border-border-color font-body text-sm font-bold text-text-primary disabled:opacity-60"
            >
              <MessageIcon className="size-4" />
              {messaging ? "Opening…" : "Message"}
            </button>

            <div className="rounded-card bg-white p-4 border border-border-color">
              <div className="flex items-center justify-between">
                <p className="font-body text-xs font-medium text-text-secondary">Next Visit</p>
                {!overrideEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideDate(nextVisitOverride?.slice(0, 10) ?? midwifeNextVisitDate?.slice(0, 10) ?? "");
                      setOverrideEditing(true);
                    }}
                    className="font-body text-xs font-medium text-pink-deep"
                  >
                    {nextVisitOverride ? "Change" : "Override"}
                  </button>
                )}
              </div>

              {overrideEditing ? (
                <div className="mt-2 flex flex-col gap-2.5">
                  <input
                    type="date"
                    value={overrideDate}
                    onChange={(e) => setOverrideDate(e.target.value)}
                    className="h-11 w-full rounded-input border-[1.5px] border-border-color px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOverrideEditing(false)}
                      className="h-10 flex-1 rounded-input border-[1.5px] border-border-color font-body text-xs font-bold text-text-primary"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => saveOverride(overrideDate || null)}
                      disabled={overrideSubmitting || !overrideDate}
                      className="h-10 flex-1 rounded-input bg-primary font-body text-xs font-bold text-white disabled:opacity-60"
                    >
                      {overrideSubmitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-1 font-heading text-base font-bold text-text-primary">
                    {nextVisitOverride
                      ? formatDate(nextVisitOverride)
                      : midwifeNextVisitDate
                        ? formatDate(midwifeNextVisitDate)
                        : "Not set"}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-text-secondary">
                    {nextVisitOverride
                      ? `Overridden by ${nextVisitOverrideByName === "you" ? "you" : nextVisitOverrideByName}`
                      : midwifeNextVisitDate
                        ? "Set by the midwife"
                        : "No visit scheduled yet"}
                  </p>
                  {nextVisitOverride && (
                    <button
                      type="button"
                      onClick={() => saveOverride(null)}
                      disabled={overrideSubmitting}
                      className="mt-2 font-body text-xs font-medium text-text-secondary underline disabled:opacity-60"
                    >
                      Clear override
                    </button>
                  )}
                </>
              )}
            </div>

            {latestVisit && (
              <div className="flex rounded-card bg-white p-4 border border-border-color">
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

        {tab === "Intake" && <IntakeSummary data={intake} />}

        {tab === "Vitals" && (
          <div className="flex flex-col gap-2.5">
            {visits.length === 0 && <p className="font-body text-sm text-text-secondary">No vitals recorded yet.</p>}
            {visits.map((v) => (
              <div key={v.id} className="rounded-card bg-white p-4 border border-border-color">
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

        {tab === "Vaccinations" && (
          <div className="flex flex-col gap-2.5">
            {vaccinationRows.length === 0 && (
              <p className="font-body text-sm text-text-secondary">No vaccinations recorded yet.</p>
            )}
            {vaccinationRows.map((v) => (
              <div key={v.id} className="rounded-card bg-white p-4 border border-border-color">
                <div className="flex items-center justify-between">
                  <span className="rounded-badge bg-lilac-light px-2.5 py-1 font-body text-xs font-medium text-lilac-deeper">
                    {v.badge}
                  </span>
                  <p className="font-body text-xs text-text-secondary">{formatDate(v.dateGiven)}</p>
                </div>
                <p className="mt-2 font-heading text-[15px] font-bold text-text-primary">{v.title}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "Delivery" && (
          <div className="flex flex-col gap-2.5">
            {!deliveryRecord && <p className="font-body text-sm text-text-secondary">No delivery record yet.</p>}
            {deliveryRecord && (
              <div className="rounded-card bg-white p-4 border border-border-color">
                <div className="flex items-center justify-between">
                  <p className="font-heading text-[15px] font-bold text-text-primary">
                    {deliveryRecord.typeOfDelivery ?? "Delivery"}
                  </p>
                  <p className="font-body text-xs text-text-secondary">
                    {deliveryRecord.dateOfDelivery ? formatDate(deliveryRecord.dateOfDelivery) : "—"}
                  </p>
                </div>
                <p className="mt-2 font-body text-xs text-text-secondary">
                  {[
                    deliveryRecord.durationOfLabourHours != null || deliveryRecord.durationOfLabourMinutes != null
                      ? `Labour ${deliveryRecord.durationOfLabourHours ?? 0}h ${deliveryRecord.durationOfLabourMinutes ?? 0}m`
                      : null,
                    deliveryRecord.estimatedBloodLossMl ? `Blood loss ${deliveryRecord.estimatedBloodLossMl}ml` : null,
                    deliveryRecord.statePerineum ? `Perineum: ${deliveryRecord.statePerineum}` : null,
                    deliveryRecord.birthAttendant ? `Attendant: ${deliveryRecord.birthAttendant}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="mt-1 font-body text-xs text-text-secondary">
                  {[
                    deliveryRecord.babySex ? `Baby: ${deliveryRecord.babySex}` : null,
                    deliveryRecord.babyBirthWeightKg ? `${deliveryRecord.babyBirthWeightKg}kg` : null,
                    deliveryRecord.babyCondition,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "Visits" && (
          <div className="flex flex-col gap-2.5">
            {visits.length === 0 && <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>}
            {visits.map((v) => (
              <div key={v.id} className="rounded-card bg-white p-4 border border-border-color">
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
              <div key={r.id} className="rounded-card bg-white p-4 border border-border-color">
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
        <div className="fixed inset-x-0 bottom-20 z-20 mx-auto flex w-full max-w-[430px] border-t border-border-color bg-white px-5 pb-4 pt-4 lg:inset-x-auto lg:bottom-0 lg:left-60 lg:right-0 lg:max-w-3xl">
          <button
            type="button"
            onClick={handleMarkReviewed}
            disabled={submitting}
            className="flex h-[52px] flex-1 items-center justify-center rounded-input bg-primary font-heading text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Mark as Reviewed"}
          </button>
        </div>
      )}

      <RequestLabTestSheet
        patientId={patientId}
        patientName={patientName}
        open={labSheetOpen}
        onClose={() => setLabSheetOpen(false)}
      />
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
