"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";

export interface StaffRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: "MIDWIFE" | "DOCTOR" | "LAB_TECHNICIAN";
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
}

const ROLE_LABEL: Record<StaffRow["role"], string> = {
  MIDWIFE: "Midwife",
  DOCTOR: "Gynaecologist",
  LAB_TECHNICIAN: "Lab Technician",
};

export default function StaffClient({ staff }: { staff: StaffRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [roleFilter, setRoleFilter] = useState<"All" | "MIDWIFE" | "DOCTOR" | "LAB_TECHNICIAN">("All");

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (roleFilter !== "All" && s.role !== roleFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (
          !s.name.toLowerCase().includes(q) &&
          !(s.email ?? "").toLowerCase().includes(q) &&
          !(s.phone ?? "").includes(query)
        )
          return false;
      }
      return true;
    });
  }, [staff, query, roleFilter]);

  const columns: DataTableColumn<StaffRow>[] = [
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "email", header: "Email", render: (r) => r.email ?? "—" },
    { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
    { key: "role", header: "Role", render: (r) => ROLE_LABEL[r.role] },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={deriveStaffStatus(r.isActive, r.hasPassword)} />,
    },
    { key: "createdAt", header: "Created at", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone..."
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:w-64"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          <option value="All">All roles</option>
          <option value="MIDWIFE">Midwife</option>
          <option value="DOCTOR">Gynaecologist</option>
          <option value="LAB_TECHNICIAN">Lab Technician</option>
        </select>
      </div>

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
