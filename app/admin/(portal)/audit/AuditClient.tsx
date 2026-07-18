"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
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
  const router = useRouter();
  const [actionFilter, setActionFilter] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClearAll() {
    setClearing(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/audit", { method: "DELETE" });
      const json = await res.json();
      if (!json.success) {
        setError(typeof json.error === "string" ? json.error : "Something went wrong.");
        return;
      }
      setClearOpen(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setClearing(false);
    }
  }

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
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
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
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:flex-none"
            />
            <span className="shrink-0 text-sm text-[#6B7280]">to</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:flex-none"
            />
          </div>
        </div>
        {logs.length > 0 && (
          <button
            type="button"
            onClick={() => setClearOpen(true)}
            className="h-10 shrink-0 rounded-md border border-[#DC2626] px-4 text-sm font-medium text-[#DC2626]"
          >
            Clear all
          </button>
        )}
      </div>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No audit entries match this filter." />

      <Modal open={clearOpen} onClose={() => setClearOpen(false)} title="Clear all audit logs">
        <p className="text-sm text-[#6B7280]">
          This permanently deletes every audit log entry you have access to — not just the ones matching your
          current filter. This <strong>cannot be undone</strong>. A single new entry will be logged noting that the
          log was cleared.
        </p>
        {error && <p className="mt-3 text-sm text-[#DC2626]">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={() => setClearOpen(false)} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            disabled={clearing}
            className="rounded-md bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {clearing ? "Clearing…" : "Clear All Permanently"}
          </button>
        </div>
      </Modal>
    </>
  );
}
