"use client";

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { formatLastLogin } from "@/lib/utils";

export interface AlertRow {
  id: string;
  patientName: string;
  facilityName: string;
  triggeredAt: string;
  resolvedAt: string | null;
  resolvedByName: string | null;
  isActive: boolean;
}

export default function AlertsClient({ alerts }: { alerts: AlertRow[] }) {
  const columns: DataTableColumn<AlertRow>[] = [
    { key: "patient", header: "Patient", render: (a) => a.patientName },
    { key: "facility", header: "Facility", render: (a) => a.facilityName },
    { key: "triggeredAt", header: "Triggered", render: (a) => formatLastLogin(a.triggeredAt) },
    {
      key: "status",
      header: "Status",
      render: (a) =>
        a.isActive ? (
          <span className="inline-block rounded-full bg-[#FEF2F2] px-2.5 py-1 text-xs font-medium text-[#DC2626]">
            Active
          </span>
        ) : (
          <span className="inline-block rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-medium text-[#16A34A]">
            Resolved
          </span>
        ),
    },
    {
      key: "resolved",
      header: "Resolved By",
      render: (a) => (a.resolvedByName ? `${a.resolvedByName} · ${formatLastLogin(a.resolvedAt!)}` : "—"),
    },
  ];

  const activeCount = alerts.filter((a) => a.isActive).length;

  return (
    <>
      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {alerts.length} {alerts.length === 1 ? "Alert" : "Alerts"}
        {activeCount > 0 && <span className="ml-2 font-normal text-[#DC2626]">{activeCount} active</span>}
      </p>

      <DataTable columns={columns} rows={alerts} rowKey={(a) => a.id} emptyMessage="No emergency alerts recorded." />
    </>
  );
}
