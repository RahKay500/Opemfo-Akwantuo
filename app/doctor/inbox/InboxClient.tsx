"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatRelativeTime } from "@/lib/utils";
import { SearchIcon } from "@/components/ui/icons";
import type { DoctorInboxItem } from "@/lib/queries/doctor-inbox";

const FILTERS = ["All", "Active", "Expired"] as const;

export default function InboxClient({ shares }: { shares: DoctorInboxItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = shares.filter((s) => {
    if (query && !s.patientName.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "Active" && s.status !== "Active") return false;
    if (filter === "Expired" && s.status === "Active") return false;
    return true;
  });

  return (
    <>
      <div className="-mt-5 px-5">
        <div className="flex h-[52px] items-center gap-2.5 rounded-input bg-white px-4 shadow-[0px_4px_8px_rgba(0,0,0,0.08)]">
          <SearchIcon className="size-[18px] text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shared records..."
            className="flex-1 bg-transparent font-body text-sm text-text-primary outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 pb-1 pt-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-badge border-[1.5px] px-4 py-2 font-body text-[13px] font-medium",
              filter === f ? "border-primary bg-primary text-white" : "border-border-color bg-white text-text-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-5 pb-8 pt-5">
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary">No shared records match this filter.</p>
        )}
        {filtered.map((s) => (
          <div
            key={s.id}
            className={cn(
              "rounded-card border-l-4 bg-white py-4 pl-5 pr-4 shadow-card",
              s.flagged ? "border-critical" : "border-border-color"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-heading text-base font-bold text-text-primary">{s.patientName}</p>
              <span
                className={cn(
                  "rounded-badge px-2.5 py-1 font-body text-xs font-medium",
                  s.status === "Active"
                    ? "bg-[#F0FDF4] text-[#16A34A]"
                    : s.status === "Reviewed"
                      ? "bg-lilac-light text-lilac-deeper"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                )}
              >
                {s.status}
              </span>
            </div>
            <p className="mt-1 font-body text-xs text-text-secondary">
              Shared by {s.sharedByName} · {s.facilityName}
            </p>
            <p className="mt-1.5 font-body text-[13px] text-text-primary">{s.reason}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="font-body text-[11px] text-[#9CA3AF]">{formatRelativeTime(s.createdAt)}</span>
            </div>
            <Link
              href={`/doctor/patients/${s.patientId}`}
              className="mt-3 flex h-[38px] items-center justify-center rounded-input border-[1.5px] border-lilac-dark font-body text-[13px] font-medium text-lilac-deeper"
            >
              View details
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
