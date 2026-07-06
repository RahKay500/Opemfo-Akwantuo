"use client";

import { formatDate } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";

export interface ActivityRow {
  id: string;
  name: string;
  role: string;
  facilityName: string | null;
  createdAt: string;
  isActive: boolean;
  hasPassword: boolean;
}

const COLUMNS: DataTableColumn<ActivityRow>[] = [
  { key: "name", header: "Name", render: (r) => r.name },
  { key: "role", header: "Role", render: (r) => (r.role === "MIDWIFE" ? "Midwife" : "Doctor") },
  { key: "facility", header: "Facility", render: (r) => r.facilityName ?? "—" },
  { key: "createdAt", header: "Created at", render: (r) => formatDate(r.createdAt) },
  {
    key: "status",
    header: "Status",
    render: (r) => <StatusBadge status={deriveStaffStatus(r.isActive, r.hasPassword)} />,
  },
];

export default function RecentActivityTable({ rows }: { rows: ActivityRow[] }) {
  return <DataTable columns={COLUMNS} rows={rows} rowKey={(r) => r.id} emptyMessage="No staff accounts created yet." />;
}
