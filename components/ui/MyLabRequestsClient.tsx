"use client";

import { useState } from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/utils";
import type { MyLabRequestItem } from "@/lib/queries/my-lab-requests";
import type { LabRequestStatus } from "@prisma/client";

const FILTERS = ["All", "Pending", "Ready"] as const;

const STATUS_STYLE: Record<LabRequestStatus, { bg: string; text: string; label: string }> = {
  REQUESTED: { bg: "bg-lilac-light", text: "text-lilac-deeper", label: "Requested" },
  IN_PROGRESS: { bg: "bg-high-bg", text: "text-high", label: "In Progress" },
  READY: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Ready" },
  CANCELLED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Cancelled" },
};

function matchesFilter(status: LabRequestStatus, filter: (typeof FILTERS)[number]): boolean {
  if (filter === "All") return true;
  if (filter === "Pending") return status === "REQUESTED" || status === "IN_PROGRESS";
  return status === "READY";
}

export default function MyLabRequestsClient({
  requests,
  patientHrefBase,
}: {
  requests: MyLabRequestItem[];
  patientHrefBase: string;
}) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const filtered = requests.filter((r) => matchesFilter(r.status, filter));

  return (
    <>
      <div className="flex gap-2 px-5 pb-1 pt-5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-badge border-[1.5px] px-3.5 py-1.5 font-body text-sm font-medium",
              filter === f ? "border-primary bg-lilac-light text-lilac-deeper" : "border-border-color text-text-secondary"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary">No lab requests here yet.</p>
        )}
        {filtered.map((r) => {
          const style = STATUS_STYLE[r.status];
          return (
            <Link
              key={r.id}
              href={`${patientHrefBase}/${r.patientId}`}
              className="rounded-card border border-border-color bg-white py-4 pl-5 pr-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-heading text-base font-bold text-text-primary">{r.patientName}</p>
                <span className={cn("rounded-badge px-2.5 py-1 font-body text-xs font-medium", style.bg, style.text)}>
                  {style.label}
                </span>
              </div>
              <p className="mt-1.5 font-body text-[13px] text-text-primary">{r.testType}</p>
              <p className="mt-1 font-body text-xs text-text-secondary">Requested {formatDate(r.requestedAt)}</p>
              {r.eta && r.status === "IN_PROGRESS" && <p className="mt-1 font-body text-xs text-high">ETA: {r.eta}</p>}
              {r.status === "READY" && (
                <div className="mt-2 rounded-card bg-[#F8FAFC] p-3">
                  <p className="font-body text-xs font-medium text-text-secondary">Result</p>
                  <p className="mt-0.5 font-body text-sm text-text-primary">{r.result}</p>
                  {r.isAbnormal && <p className="mt-1 font-body text-xs font-bold text-critical">Flagged abnormal</p>}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
