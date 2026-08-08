"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import { formatLastLogin } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";
import Avatar from "@/components/ui/Avatar";
import NewFacilityAdminForm from "./NewFacilityAdminForm";

export interface FacilityAdminRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  facilityId: string | null;
  facilityName: string | null;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function FacilityAdminsClient({
  admins,
  facilities,
}: {
  admins: FacilityAdminRow[];
  facilities: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    return admins.filter((a) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (a.name ?? "").toLowerCase().includes(q) ||
        (a.facilityName ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.phone ?? "").includes(query)
      );
    });
  }, [admins, query]);

  const columns: DataTableColumn<FacilityAdminRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            name={r.name ?? r.facilityName ?? "?"}
            size="sm"
            background="#F3E8FB"
            textColor="#7C3AED"
            textClassName="text-xs font-bold"
          />
          <span className="font-medium text-[#1A1A2E]">{r.name ?? "—"}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (r) => r.email ?? "—" },
    { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
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
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex h-10 shrink-0 items-center justify-center rounded-md bg-[#7C3AED] px-4 text-sm font-semibold text-white"
        >
          + Add Facility Admin
        </button>
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

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Facility Admin">
        <NewFacilityAdminForm
          facilities={facilities}
          onCreated={() => router.refresh()}
          onClose={() => setAddOpen(false)}
        />
      </Modal>
    </>
  );
}
