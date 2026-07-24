"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import { deriveFacilityStatus } from "@/lib/staff-status";
import { facilityTypeLabel } from "@/lib/utils";
import type { FacilityType } from "@prisma/client";

export interface FacilityRow {
  id: string;
  name: string;
  type: FacilityType;
  region: string;
  district: string;
  phone: string | null;
  isActive: boolean;
  staffCount: number;
  patientCount: number;
  adminName: string | null;
  openedAt: string | null;
}

const FACILITY_TYPE_OPTIONS: FacilityType[] = [
  "CHPS",
  "HEALTH_CENTRE",
  "DISTRICT_HOSPITAL",
  "REGIONAL_HOSPITAL",
  "TEACHING_HOSPITAL",
];

interface FormState {
  name: string;
  type: FacilityRow["type"];
  region: string;
  district: string;
  phone: string;
  openedAt: string;
}

const EMPTY_FORM: FormState = { name: "", type: "CHPS", region: "", district: "", phone: "", openedAt: "" };

export default function FacilitiesClient({ facilities }: { facilities: FacilityRow[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FacilityRow | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<FacilityRow | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return facilities;
    const q = query.toLowerCase();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.region.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q)
    );
  }, [facilities, query]);

  function openEdit(facility: FacilityRow) {
    setForm({
      name: facility.name,
      type: facility.type,
      region: facility.region,
      district: facility.district,
      phone: facility.phone ?? "",
      openedAt: facility.openedAt ? facility.openedAt.slice(0, 10) : "",
    });
    setEditTarget(facility);
    setError(null);
  }

  function closeModals() {
    setAddOpen(false);
    setEditTarget(null);
    setDeactivateTarget(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleCreate() {
    setError(null);
    if (!form.name.trim() || !form.region.trim() || !form.district.trim()) {
      setError("Fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      closeModals();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (!editTarget) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/facilities/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phone: form.phone || undefined }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      closeModals();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleActive(facility: FacilityRow) {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/facilities/${facility.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !facility.isActive }),
      });
      closeModals();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const columns: DataTableColumn<FacilityRow>[] = [
    { key: "name", header: "Facility", render: (r) => <span className="font-medium text-[#1A1A2E]">{r.name}</span> },
    {
      key: "type",
      header: "Type",
      render: (r) => (
        <span className="inline-block rounded-full bg-[#F3E8FB] px-2.5 py-1 text-center text-xs font-medium text-[#7C3AED]">
          {facilityTypeLabel(r.type)}
        </span>
      ),
    },
    { key: "location", header: "District / Region", render: (r) => `${r.district}, ${r.region}` },
    {
      key: "admin",
      header: "Facility Admin",
      render: (r) =>
        r.adminName ?? <span className="font-medium text-[#EA580C]">Unassigned</span>,
    },
    { key: "staffCount", header: "Staff", render: (r) => r.staffCount },
    { key: "patientCount", header: "Patients", render: (r) => r.patientCount },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={deriveFacilityStatus(r.isActive, r.staffCount)} />,
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-3">
          <Link href={`/admin/staff?facilityId=${r.id}`} className="text-sm font-medium text-[#7C3AED] underline">
            Staff
          </Link>
          <button type="button" onClick={() => openEdit(r)} className="text-sm font-medium text-[#1A1A2E] underline">
            Edit
          </button>
          <button
            type="button"
            onClick={() => (r.isActive ? setDeactivateTarget(r) : handleToggleActive(r))}
            className="text-sm font-medium text-[#DC2626] underline"
          >
            {r.isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search facilities..."
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:flex-1"
        />
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setError(null);
            setAddOpen(true);
          }}
          className="h-10 shrink-0 rounded-md bg-[#7C3AED] px-4 text-sm font-semibold text-white"
        >
          + Add Facility
        </button>
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "Facility" : "Facilities"}
      </p>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No facilities match this search." />

      <Modal open={addOpen} onClose={closeModals} title="Add Facility">
        <FacilityForm form={form} setForm={setForm} error={error} />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={closeModals} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={submitting}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Facility"}
          </button>
        </div>
      </Modal>

      <Modal open={editTarget !== null} onClose={closeModals} title="Edit Facility">
        <FacilityForm form={form} setForm={setForm} error={error} />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={closeModals} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </Modal>

      <Modal open={deactivateTarget !== null} onClose={closeModals} title="Deactivate Facility">
        <p className="text-sm text-[#6B7280]">
          Are you sure you want to deactivate <strong>{deactivateTarget?.name}</strong>? Staff at this facility will
          remain assigned, but the facility won&apos;t be selectable for new registrations.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={closeModals} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deactivateTarget && handleToggleActive(deactivateTarget)}
            disabled={submitting}
            className="rounded-md bg-[#DC2626] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Deactivating…" : "Deactivate"}
          </button>
        </div>
      </Modal>

    </>
  );
}

function FacilityForm({
  form,
  setForm,
  error,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormField label="Facility name" required>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>
      <FormField label="Type" required>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as FormState["type"] })}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          {FACILITY_TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {facilityTypeLabel(type)}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Region" required>
        <input
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>
      <FormField label="District" required>
        <input
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>
      <FormField label="Phone">
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Optional"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>
      <FormField label="Opened">
        <input
          type="date"
          value={form.openedAt}
          onChange={(e) => setForm({ ...form, openedAt: e.target.value })}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>
      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}
