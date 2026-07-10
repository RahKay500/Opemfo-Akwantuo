"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatRelativeTime } from "@/lib/utils";
import { SearchIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import type { MidwifePatientListItem } from "@/lib/queries/midwife-patients";

const FILTERS = ["All", "Flagged", "Antenatal", "Postnatal", "Referred"] as const;

const VISIT_TYPE_BADGE: Record<string, string> = {
  ANTENATAL: "bg-lilac-light text-lilac-deeper",
  POSTNATAL: "bg-pink-light text-pink-deep",
};

export default function PatientListClient({ patients }: { patients: MidwifePatientListItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "Flagged") return p.flagged;
    if (filter === "Antenatal") return p.visitType === "ANTENATAL";
    if (filter === "Postnatal") return p.visitType === "POSTNATAL";
    if (filter === "Referred") return p.hasActiveReferral;
    return true;
  });

  return (
    <>
      <div className="px-5 pt-4">
        <div className="flex h-[52px] items-center gap-2.5 rounded-input border-[1.5px] border-border-color bg-white px-4">
          <SearchIcon className="size-4 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients..."
            className="flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "shrink-0 rounded-badge border-[1.5px] px-4 py-1.5 font-body text-[13px] font-medium",
                f === "Flagged"
                  ? filter === f
                    ? "border-critical bg-critical-bg text-critical"
                    : "border-critical-bg bg-critical-bg text-critical"
                  : filter === f
                    ? "border-primary bg-primary text-white"
                    : "border-border-color bg-white text-text-secondary"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-8 pt-4">
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
    </>
  );
}
