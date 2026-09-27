"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import { formatLastLogin } from "@/lib/utils";
import { deriveStaffStatus } from "@/lib/staff-status";
import Avatar from "@/components/ui/Avatar";
import NewDistrictAdminForm, { type RegionOption } from "./NewDistrictAdminForm";

export interface DistrictAdminRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  districtId: string | null;
  districtName: string | null;
  regionName: string | null;
  isActive: boolean;
  hasPassword: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function DistrictAdminsClient({
  admins,
  regions,
}: {
  admins: DistrictAdminRow[];
  regions: RegionOption[];
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
        (a.districtName ?? "").toLowerCase().includes(q) ||
        (a.regionName ?? "").toLowerCase().includes(q) ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.phone ?? "").includes(query)
      );
    });
  }, [admins, query]);

  const columns: DataTableColumn<DistrictAdminRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            name={r.name ?? r.districtName ?? "?"}
            size="sm"
            background="#FBE8FF"
            textColor="#9F1AB1"
            textClassName="text-xs font-bold"
          />
          <span className="font-medium text-[#1A1A2E]">{r.name ?? "—"}</span>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (r) => r.email ?? "—" },
    { key: "phone", header: "Phone", render: (r) => r.phone ?? "—" },
    {
      key: "district",
      header: "District / Region",
      render: (r) => (r.districtName ? `${r.districtName}, ${r.regionName}` : "—"),
    },
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
          placeholder="Search admins, districts, or regions..."
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:flex-1"
        />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex h-10 shrink-0 items-center justify-center rounded-md bg-[#9F1AB1] px-4 text-sm font-semibold text-white"
        >
          + Add District Admin
        </button>
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "District Admin" : "District Admins"}
      </p>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(r) => r.id}
        emptyMessage="No District Admins match this search."
      />

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add District Admin">
        <NewDistrictAdminForm regions={regions} onCreated={() => router.refresh()} onClose={() => setAddOpen(false)} />
      </Modal>
    </>
  );
}
