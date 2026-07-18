"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatLastLogin, initials } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";

export interface FacilityAdminRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string;
  facilityId: string | null;
  facilityName: string | null;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function FacilityAdminsClient({ admins }: { admins: FacilityAdminRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (a.name ?? "").toLowerCase().includes(q) ||
        (a.facilityName ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        a.phone.includes(query)
      );
    });
  }, [admins, query]);

  const columns: DataTableColumn<FacilityAdminRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E8FB] text-xs font-bold text-[#7C3AED]">
            {initials(r.name ?? r.facilityName ?? "?")}
          </span>
          <span className="font-medium text-[#1A1A2E]">{r.name ?? "—"}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (r) => r.email ?? "—" },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    { key: "facility", header: "Assigned Facility", render: (r) => r.facilityName ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={deriveStaffStatus(r.isActive, r.hasPassword)} />,
    },
    { key: "lastLogin", header: "Last Login", render: (r) => (r.lastLoginAt ? formatLastLogin(r.lastLoginAt) : "Never") },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search admins or facilities..."
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:flex-1"
        />
        <Link
          href="/admin/facility-admins/new"
          className="flex h-10 shrink-0 items-center justify-center rounded-md bg-[#7C3AED] px-4 text-sm font-semibold text-white"
        >
          + Add Facility Admin
        </Link>
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "Facility Admin" : "Facility Admins"}
      </p>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        emptyMessage="No Facility Admins match this search."
        onRowClick={(r) => router.push(`/admin/facility-admins/${r.id}`)}
      />
    </>
  );
}
