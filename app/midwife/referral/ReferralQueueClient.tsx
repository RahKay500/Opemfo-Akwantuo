"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import { SearchIcon, PlusIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import type { MidwifeReferralListItem } from "@/lib/queries/midwife-referrals";
import type { Priority, ReferralStatus } from "@prisma/client";

const FILTERS = ["All", "Critical", "High", "Medium", "Low"] as const;

const PRIORITY_BORDER: Record<Priority, string> = {
  CRITICAL: "border-critical",
  HIGH: "border-high",
  MEDIUM: "border-medium",
  LOW: "border-low",
};

const PRIORITY_PILL: Record<Priority, string> = {
  CRITICAL: "bg-critical-bg text-critical",
  HIGH: "bg-high-bg text-high",
  MEDIUM: "bg-medium-bg text-medium",
  LOW: "bg-low-bg text-low",
};

const STATUS_STYLE: Record<ReferralStatus, { bg: string; text: string; label: string }> = {
  SENT: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Pending" },
  ACKNOWLEDGED: { bg: "bg-lilac-light", text: "text-lilac-deeper", label: "In Transit" },
  PATIENT_ARRIVED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Accepted" },
  COMPLETED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Completed" },
  CANCELLED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Cancelled" },
};

function sentLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const datePart = isToday ? "Today" : d.toLocaleDateString("en-GH", { day: "numeric", month: "short" });
  const timePart = d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} · ${timePart}`;
}

export default function ReferralQueueClient({ referrals }: { referrals: MidwifeReferralListItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = referrals.filter((r) => {
    if (query && !r.patientName.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter !== "All" && r.priority !== filter.toUpperCase()) return false;
    return true;
  });

  return (
    <>
      {/* Mobile: search + filter pills + card list, unchanged. */}
      <div className="lg:hidden">
        <div className="-mt-5 px-5">
          <div className="flex h-[52px] items-center gap-2.5 rounded-input bg-white px-4 shadow-[0px_4px_8px_rgba(0,0,0,0.08)]">
            <SearchIcon className="size-[18px] text-text-secondary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search referrals..."
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
            <p className="py-8 text-center font-body text-sm text-text-secondary">No referrals match this filter.</p>
          )}
          {filtered.map((r) => {
            const status = STATUS_STYLE[r.status];
            return (
              <div key={r.id} className={cn("rounded-card border-l-4 bg-white py-4 pl-5 pr-4 shadow-card", PRIORITY_BORDER[r.priority])}>
                <div className="flex items-center justify-between">
                  <p className="font-heading text-base font-bold text-text-primary">{r.patientName}</p>
                  <PriorityBadge priority={r.priority} className="px-2.5 py-1 text-xs" />
                </div>
                <p className="mt-1 font-body text-xs text-text-secondary">→ {r.toFacilityName}</p>
                <p className="mt-1.5 font-body text-[13px] text-text-primary">{r.reason}</p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className={cn("rounded-badge px-2.5 py-1 font-body text-xs font-medium", status.bg, status.text)}>
                    {status.label}
                  </span>
                  <span className="font-body text-[11px] text-[#9CA3AF]">{formatRelativeTime(r.sentAt)}</span>
                </div>
                <Link
                  href={`/midwife/patients/${r.patientId}`}
                  className="mt-3 flex h-[38px] items-center justify-center rounded-input border-[1.5px] border-lilac-dark font-body text-[13px] font-medium text-lilac-deeper"
                >
                  View details
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Recent Referrals table. */}
      <div className="hidden px-5 pb-8 pt-5 lg:block">
        <div className="flex justify-end">
          <Link
            href="/midwife/patients"
            className="flex items-center gap-1.5 rounded-button bg-lilac-mid px-5 py-3 font-heading text-sm font-bold text-lilac-deeper"
          >
            <PlusIcon className="size-4" />
            New Referral
          </Link>
        </div>

        <div className="mt-5 overflow-x-auto rounded-card bg-white shadow-card">
          <div className="px-6 pt-6">
            <h2 className="font-heading text-lg font-bold text-text-primary">Recent Referrals</h2>
          </div>
          <table className="mt-4 w-full">
            <thead>
              <tr className="border-b border-border-color text-left">
                <th className="px-6 py-3 font-body text-xs font-medium text-text-secondary">Ref ID</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Patient</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Reason</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Priority</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Hospital</th>
                <th className="px-3 py-3 font-body text-xs font-medium text-text-secondary">Sent</th>
                <th className="px-6 py-3 font-body text-xs font-medium text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center font-body text-sm text-text-secondary">
                    No referrals yet.
                  </td>
                </tr>
              )}
              {referrals.map((r) => {
                const status = STATUS_STYLE[r.status];
                return (
                  <tr
                    key={r.id}
                    onClick={() => router.push(`/midwife/patients/${r.patientId}`)}
                    className="cursor-pointer border-b border-border-color last:border-b-0 hover:bg-surface/60"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 font-body text-sm text-text-secondary">{r.refId}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-heading text-sm font-bold text-text-primary">{r.patientName}</td>
                    <td className="px-3 py-3.5 font-body text-sm text-text-primary">{r.reason}</td>
                    <td className="px-3 py-3.5">
                      <span className={cn("inline-block rounded-badge px-2.5 py-1 font-body text-xs font-medium", PRIORITY_PILL[r.priority])}>
                        {r.priority.charAt(0) + r.priority.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 font-body text-sm text-text-primary">{r.toFacilityName}</td>
                    <td className="px-3 py-3.5 font-body text-sm text-text-primary">{sentLabel(r.sentAt)}</td>
                    <td className="px-6 py-3.5">
                      <span className={cn("inline-block rounded-badge px-2.5 py-1 font-body text-xs font-medium", status.bg, status.text)}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="h-2" />
        </div>
      </div>
    </>
  );
}
