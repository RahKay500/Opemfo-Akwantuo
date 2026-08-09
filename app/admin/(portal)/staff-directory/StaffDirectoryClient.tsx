"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { deriveStaffStatus } from "@/lib/staff-status";
import Avatar from "@/components/ui/Avatar";

export interface StaffDirectoryRow {
  id: string;
  name: string;
  phone: string;
  role: "MIDWIFE" | "DOCTOR";
  facilityName: string;
  isActive: boolean;
  hasPassword: boolean;
}

const ROLE_LABELS: Record<StaffDirectoryRow["role"], string> = { MIDWIFE: "Midwife", DOCTOR: "Doctor" };

export default function StaffDirectoryClient({ staff }: { staff: StaffDirectoryRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.facilityName.toLowerCase().includes(q) ||
        s.phone.includes(query)
      );
    });
  }, [staff, query]);

  const columns: DataTableColumn<StaffDirectoryRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size="sm" background="#DBEAFE" textColor="#2663EB" textClassName="text-xs font-bold" />
          <span className="font-medium text-[#1A1A2E]">{r.name}</span>
        </div>
      ),
    },
    { key: "role", header: "Role", render: (r) => ROLE_LABELS[r.role] },
    { key: "facility", header: "Facility", render: (r) => r.facilityName },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={deriveStaffStatus(r.isActive, r.hasPassword)} />,
    },
  ];

  return (
    <>
      <div className="mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search staff or facilities..."
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:max-w-sm"
        />
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "Staff Member" : "Staff Members"}
      </p>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        emptyMessage="No staff match this search."
        onRowClick={(r) => router.push(`/admin/staff/${r.id}`)}
      />
    </>
  );
}
