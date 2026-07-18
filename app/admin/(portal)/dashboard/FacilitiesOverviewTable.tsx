"use client";

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { facilityTypeLabel } from "@/lib/utils";
import { deriveFacilityStatus } from "@/lib/staff-status";

export interface FacilityOverviewRow {
  id: string;
  name: string;
  type: "CHPS" | "DISTRICT_HOSPITAL" | "TEACHING_HOSPITAL";
  adminName: string | null;
  staffCount: number;
  patientCount: number;
  isActive: boolean;
}

export default function FacilitiesOverviewTable({ facilities }: { facilities: FacilityOverviewRow[] }) {
  const columns: DataTableColumn<FacilityOverviewRow>[] = [
    { key: "name", header: "Facility", render: (r) => r.name },
    { key: "type", header: "Type", render: (r) => facilityTypeLabel(r.type) },
    { key: "admin", header: "Admin", render: (r) => r.adminName ?? "Unassigned" },
    { key: "staff", header: "Staff", render: (r) => r.staffCount },
    { key: "patients", header: "Patients", render: (r) => r.patientCount },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={deriveFacilityStatus(r.isActive, r.staffCount)} />,
    },
  ];

  return <DataTable columns={columns} rows={facilities} rowKey={(r) => r.id} emptyMessage="No facilities yet." />;
}
