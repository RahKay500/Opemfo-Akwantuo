"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";

export interface StaffRow {
  id: string;
  name: string;
  phone: string;
  role: "MIDWIFE" | "DOCTOR";
  facilityId: string | null;
  facilityName: string | null;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
}

export default function StaffClient({
  staff,
  facilities,
}: {
  staff: StaffRow[];
  facilities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | "MIDWIFE" | "DOCTOR">("All");
  const [facilityFilter, setFacilityFilter] = useState("All");

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (roleFilter !== "All" && s.role !== roleFilter) return false;
      if (facilityFilter !== "All" && s.facilityId !== facilityFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.phone.includes(query)) return false;
      }
      return true;
    });
  }, [staff, query, roleFilter, facilityFilter]);

  const columns: DataTableColumn<StaffRow>[] = [
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    { key: "role", header: "Role", render: (r) => (r.role === "MIDWIFE" ? "Midwife" : "Doctor") },
    { key: "facility", header: "Facility", render: (r) => r.facilityName ?? "—" },
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
          <option value="DOCTOR">Doctor</option>
        </select>
        <select
          value={facilityFilter}
          onChange={(e) => setFacilityFilter(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          <option value="All">All facilities</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
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
