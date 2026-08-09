"use client";

import { useMemo, useState } from "react";
import type { Priority, ReferralStatus } from "@prisma/client";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Tabs from "@/components/ui/Tabs";
import { formatLastLogin } from "@/lib/utils";

export interface ReferralRow {
  id: string;
  patientName: string;
  fromFacilityName: string;
  toFacilityName: string;
  priority: Priority;
  status: ReferralStatus;
  sentAt: string;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICAL: "bg-[#FEF2F2] text-[#DC2626]",
  HIGH: "bg-[#FFF7ED] text-[#EA580C]",
  MEDIUM: "bg-[#FEFCE8] text-[#CA8A04]",
  LOW: "bg-[#F0FDF4] text-[#16A34A]",
};

const STATUS_STYLES: Record<ReferralStatus, { bg: string; text: string; label: string }> = {
  SENT: { bg: "bg-[#FFF7ED]", text: "text-[#EA580C]", label: "Sent" },
  ACKNOWLEDGED: { bg: "bg-[#FBE8FF]", text: "text-[#9F1AB1]", label: "Acknowledged" },
  PATIENT_ARRIVED: { bg: "bg-[#EFF6FF]", text: "text-[#2663EB]", label: "Patient Arrived" },
  COMPLETED: { bg: "bg-[#F0FDF4]", text: "text-[#16A34A]", label: "Completed" },
  CANCELLED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Cancelled" },
};

const FILTERS = ["All", "Sent", "Acknowledged", "Patient Arrived", "Completed", "Cancelled"] as const;

export default function ReferralsClient({ referrals }: { referrals: ReferralRow[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const filtered = useMemo(() => {
    if (filter === "All") return referrals;
    return referrals.filter((r) => STATUS_STYLES[r.status].label === filter);
  }, [referrals, filter]);

  const columns: DataTableColumn<ReferralRow>[] = [
    { key: "patient", header: "Patient", render: (r) => r.patientName },
    {
      key: "route",
      header: "From → To",
      render: (r) => (
        <span>
          {r.fromFacilityName} <span className="text-[#9CA3AF]">→</span> {r.toFacilityName}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (r) => (
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[r.priority]}`}>
          {r.priority.charAt(0) + r.priority.slice(1).toLowerCase()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[r.status].bg} ${STATUS_STYLES[r.status].text}`}
        >
          {STATUS_STYLES[r.status].label}
        </span>
      ),
    },
    { key: "sentAt", header: "Sent", render: (r) => formatLastLogin(r.sentAt) },
  ];

  return (
    <>
      <div className="mb-4">
        <Tabs
          tabs={FILTERS.map((f) => ({ key: f, label: f }))}
          activeKey={filter}
          onChange={(key) => setFilter(key as (typeof FILTERS)[number])}
          style="pill"
          pillActiveClassName="border-[#9F1AB1] bg-[#9F1AB1] text-white"
          pillInactiveClassName="border-[#E2E8F0] bg-white text-[#6B7280]"
        />
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "Referral" : "Referrals"}
      </p>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No referrals match this filter." />
    </>
  );
}
