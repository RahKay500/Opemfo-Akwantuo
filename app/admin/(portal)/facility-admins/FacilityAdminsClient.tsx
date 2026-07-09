"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";

export interface FacilityAdminRow {
  id: string;
  phone: string;
  facilityId: string | null;
  facilityName: string | null;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
}

export default function FacilityAdminsClient({ admins }: { admins: FacilityAdminRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (a.facilityName ?? "").toLowerCase().includes(q) || a.phone.includes(query);
    });
  }, [admins, query]);

  const columns: DataTableColumn<FacilityAdminRow>[] = [
    { key: "facility", header: "Facility", render: (r) => r.facilityName ?? "—" },
    { key: "phone", header: "Phone", render: (r) => r.phone },
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
          placeholder="Search by facility or phone..."
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:w-64"
        />
      </div>

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
