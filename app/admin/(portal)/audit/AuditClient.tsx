"use client";

import { useMemo, useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/utils";

export interface AuditRow {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
}

export default function AuditClient({ logs, actions }: { logs: AuditRow[]; actions: string[] }) {
  const [actionFilter, setActionFilter] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (actionFilter !== "All" && l.action !== actionFilter) return false;
      const created = new Date(l.createdAt);
      if (from && created < new Date(from)) return false;
      if (to && created > new Date(`${to}T23:59:59`)) return false;
      return true;
    });
  }, [logs, actionFilter, from, to]);

  const columns: DataTableColumn<AuditRow>[] = [
    { key: "createdAt", header: "Timestamp", render: (r) => formatDate(r.createdAt) },
    { key: "actor", header: "Actor", render: (r) => r.actor },
    { key: "action", header: "Action", render: (r) => r.action.replace(/_/g, " ") },
    { key: "entity", header: "Entity", render: (r) => `${r.entityType} · ${r.entityId.slice(-8)}` },
  ];

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          <option value="All">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
        <span className="text-sm text-[#6B7280]">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No audit entries match this filter." />
    </>
  );
}
