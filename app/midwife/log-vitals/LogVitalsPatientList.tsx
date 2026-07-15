"use client";

import { useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { SearchIcon, HeartRateIcon } from "@/components/ui/icons";
import type { MidwifePatientListItem } from "@/lib/queries/midwife-patients";

export default function LogVitalsPatientList({ patients }: { patients: MidwifePatientListItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = patients.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <>
      <div className="px-5 pt-1">
        <div className="flex h-[52px] items-center gap-2.5 rounded-input border-[1.5px] border-border-color bg-white px-4 lg:max-w-md">
          <SearchIcon className="size-4 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients..."
            className="flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 px-5 pb-8 pt-4 lg:grid-cols-3 lg:gap-4">
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary lg:col-span-3">
            No patients match this search.
          </p>
        )}
        {filtered.map((patient) => (
          <div key={patient.id} className="flex items-center gap-3 rounded-card bg-white p-4 shadow-card">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-lilac-light">
              <span className="font-heading text-sm font-bold text-lilac-deeper">{patient.initials}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[15px] font-bold text-text-primary">{patient.name}</p>
              <p className="mt-0.5 truncate font-body text-xs text-text-secondary">
                {[patient.weekOrDay, patient.lastVisitAt ? `Last visit ${formatRelativeTime(patient.lastVisitAt)}` : "No visits yet"]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Link
              href={`/midwife/patients/${patient.id}/vitals`}
              className="flex shrink-0 items-center gap-1.5 rounded-input bg-lilac-mid px-3.5 py-2 font-body text-xs font-bold text-lilac-deeper"
            >
              <HeartRateIcon className="size-3.5" />
              Log Vitals
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
