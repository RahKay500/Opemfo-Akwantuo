"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatRelativeTime } from "@/lib/utils";
import { SearchIcon, PlusIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import type { MidwifePatientListItem, PatientStatus } from "@/lib/queries/midwife-patients";

const FILTERS = ["All", "Normal", "Flagged", "Critical"] as const;

const VISIT_TYPE_BADGE: Record<string, string> = {
  ANTENATAL: "bg-lilac-light text-lilac-deeper",
  POSTNATAL: "bg-pink-light text-pink-deep",
};

const STATUS_STYLES: Record<PatientStatus, string> = {
  NORMAL: "bg-low-bg text-low",
  FLAGGED: "bg-high-bg text-high",
  CRITICAL: "bg-critical-bg text-critical",
  EMERGENCY: "bg-critical-bg text-critical",
};
const STATUS_LABELS: Record<PatientStatus, string> = {
  NORMAL: "Normal",
  FLAGGED: "Flagged",
  CRITICAL: "Critical",
  EMERGENCY: "Emergency",
};

function shortDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("en-GH", { day: "numeric", month: "short" });
}

export default function PatientListClient({ patients }: { patients: MidwifePatientListItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "Normal") return p.status === "NORMAL";
    if (filter === "Flagged") return p.status === "FLAGGED";
    if (filter === "Critical") return p.status === "CRITICAL" || p.status === "EMERGENCY";
    return true;
  });

  return (
    <>
      <div className="px-5 pt-4 lg:flex lg:items-center lg:justify-between lg:gap-4 lg:px-5 lg:pt-6">
        <div className="lg:flex lg:flex-1 lg:items-center lg:gap-3">
          <div className="flex h-[52px] items-center gap-2.5 rounded-input border-[1.5px] border-border-color bg-white px-4 lg:max-w-md lg:flex-1">
            <SearchIcon className="size-4 text-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients..."
              className="flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-[#9CA3AF]"
            />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:mt-0 lg:pb-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "shrink-0 rounded-badge border-[1.5px] px-4 py-1.5 font-body text-[13px] font-medium",
                  filter === f
                    ? "border-lilac-mid bg-lilac-light text-lilac-deeper"
                    : "border-border-color bg-white text-text-secondary"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/midwife/register"
          className="mt-3 hidden shrink-0 items-center gap-1.5 rounded-button bg-lilac-mid px-5 py-3 font-heading text-sm font-bold text-lilac-deeper lg:mt-0 lg:flex"
        >
          <PlusIcon className="size-4" />
          Register New Patient
        </Link>
      </div>

      {/* Mobile: card list, unchanged. */}
      <div className="flex flex-col gap-2.5 px-5 pb-8 pt-4 lg:hidden">
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary">No patients match this filter.</p>
        )}
        {filtered.map((patient) => (
          <Link
            key={patient.id}
            href={`/midwife/patients/${patient.id}`}
            className={cn(
              "rounded-card bg-white p-4 shadow-card",
              patient.flagged &&
                (patient.flagPriority === "CRITICAL"
                  ? "border-l-4 border-critical"
                  : patient.flagPriority === "HIGH"
                    ? "border-l-4 border-high"
                    : patient.flagPriority === "MEDIUM"
                      ? "border-l-4 border-medium"
                      : "border-l-4 border-low")
            )}
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-lilac-light">
                <span className="font-heading text-sm font-bold text-lilac-deeper">{patient.initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading text-[15px] font-bold text-text-primary">{patient.name}</p>
                  {patient.flagged ? (
                    <PriorityBadge priority={patient.flagPriority ?? "LOW"} className="px-2.5 py-0.5 text-[11px]" />
                  ) : patient.visitType ? (
                    <span
                      className={cn(
                        "rounded-badge px-2.5 py-0.5 font-body text-[11px] font-medium",
                        VISIT_TYPE_BADGE[patient.visitType]
                      )}
                    >
                      {patient.visitType === "ANTENATAL" ? "Antenatal" : "Postnatal"}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 font-body text-xs text-text-secondary">
                  {[patient.weekOrDay, patient.lastVisitAt ? `Last visit ${formatRelativeTime(patient.lastVisitAt)}` : "No visits yet"]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>
            {patient.flagBanner && (
              <div className="mt-2.5 rounded-[8px] bg-critical-bg px-2.5 py-1.5">
                <p className="font-body text-xs text-critical">{patient.flagBanner}</p>
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Desktop: full data table. */}
      <div className="hidden px-5 pb-8 pt-5 lg:block">
        <div className="overflow-x-auto rounded-card bg-white shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color text-left">
                <th className="px-6 py-3 font-body text-xs font-medium text-text-secondary">Name</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Phone</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Age</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Weeks</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Last Visit</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Next Visit</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Status</th>
                <th className="px-6 py-3 font-body text-xs font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center font-body text-sm text-text-secondary">
                    No patients match this filter.
                  </td>
                </tr>
              )}
              {filtered.map((patient) => (
                <tr key={patient.id} className="border-b border-border-color last:border-b-0">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-badge bg-lilac-light">
                        <span className="font-heading text-xs font-bold text-lilac-deeper">{patient.initials}</span>
                      </div>
                      <p className="font-heading text-sm font-bold text-text-primary">{patient.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 font-body text-sm text-text-primary">{patient.phone}</td>
                  <td className="px-3 py-3.5 font-body text-sm text-text-primary">{patient.age} yrs</td>
                  <td className="px-3 py-3.5 font-body text-sm text-text-primary">
                    {patient.week != null ? `Wk ${patient.week}` : "—"}
                  </td>
                  <td className="px-3 py-3.5 font-body text-sm text-text-primary">{shortDate(patient.lastVisitAt)}</td>
                  <td className="px-3 py-3.5 font-body text-sm text-text-primary">{shortDate(patient.nextVisitAt)}</td>
                  <td className="px-3 py-3.5">
                    <span
                      className={cn(
                        "inline-block rounded-badge px-2.5 py-1 font-body text-xs font-medium",
                        STATUS_STYLES[patient.status]
                      )}
                    >
                      {STATUS_LABELS[patient.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex gap-2">
                      <Link
                        href={`/midwife/patients/${patient.id}`}
                        className="rounded-input bg-lilac-light px-3 py-1.5 font-body text-xs font-medium text-lilac-deeper"
                      >
                        View
                      </Link>
                      <Link
                        href={`/midwife/patients/${patient.id}/vitals`}
                        className="rounded-input bg-low-bg px-3 py-1.5 font-body text-xs font-medium text-low"
                      >
                        Vitals
                      </Link>
                      <Link
                        href={`/midwife/patients/${patient.id}/refer`}
                        className="rounded-input bg-high-bg px-3 py-1.5 font-body text-xs font-medium text-high"
                      >
                        Refer
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
