"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import PriorityBadge from "@/components/ui/PriorityBadge";
import ShareRecordSheet from "@/components/ui/ShareRecordSheet";
import { ShareIcon } from "@/components/ui/icons";
import type { Priority, ReferralStatus, VisitType } from "@prisma/client";

const TABS = ["Overview", "Vitals", "Visits", "Referrals"] as const;

export interface PatientDetailVisit {
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

export interface PatientDetailReferral {
  id: string;
  hospitalName: string;
  status: ReferralStatus;
  priority: Priority;
  sentAt: string;
}

export default function PatientDetailClient({
  patientId,
  patientName,
  visits,
  referrals,
  doctors,
}: {
  patientId: string;
  patientName: string;
  visits: PatientDetailVisit[];
  referrals: PatientDetailReferral[];
  doctors: { id: string; name: string; facilityName: string }[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [shareOpen, setShareOpen] = useState(false);

  const latestVisit = visits[0] ?? null;
  const activeFlag = latestVisit?.flagged ? latestVisit : null;

  return (
    <>
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

      <div className="flex flex-col gap-4 px-5 pb-40 pt-5">
        {tab === "Overview" && (
          <>
            {latestVisit && (
              <div className="flex rounded-card bg-white p-4 shadow-card">
                <VitalCell emoji="🩸" label="BP" value={latestVisit.systolic && latestVisit.diastolic ? `${latestVisit.systolic}/${latestVisit.diastolic}` : "—"} danger={latestVisit.flagged} />
                <div className="w-px bg-border-color" />
                <VitalCell emoji="💓" label="Fetal HR" value={latestVisit.fetalHeartRate ? `${latestVisit.fetalHeartRate} bpm` : "—"} />
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
                  {activeFlag.systolic && activeFlag.diastolic ? ` — BP ${activeFlag.systolic}/${activeFlag.diastolic} mmHg.` : "."}{" "}
                  Immediate action required.
                </p>
              </div>
            )}

            {!latestVisit && (
              <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>
            )}
          </>
        )}

        {tab === "Vitals" && (
          <div className="flex flex-col gap-2.5">
            <Link
              href={`/midwife/patients/${patientId}/vitals`}
              className="flex h-12 items-center justify-center rounded-input bg-primary font-heading text-sm font-bold text-lilac-deeper"
            >
              + Log Vitals
            </Link>
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

      <div className="fixed inset-x-0 bottom-20 z-20 mx-auto flex w-full max-w-[430px] gap-3 border-t border-border-color bg-white px-5 pb-4 pt-4">
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-input border-[1.5px] border-pink-accent font-body text-xs font-medium text-pink-deep"
        >
          <ShareIcon className="size-3.5" />
          Share with Gynaecologist
        </button>
        <Link
          href={`/midwife/patients/${patientId}/refer`}
          className="flex h-[52px] flex-1 items-center justify-center rounded-input bg-primary font-heading text-xs font-bold text-lilac-deeper"
        >
          Create Referral
        </Link>
      </div>

      <ShareRecordSheet
        patientId={patientId}
        patientName={patientName}
        doctors={doctors}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
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
