"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import RowActionsMenu, { RowActionItem } from "@/components/admin/RowActionsMenu";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import FormField from "@/components/admin/FormField";
import { deriveFacilityStatus } from "@/lib/staff-status";
import { facilityTypeLabel, digitsOnly } from "@/lib/utils";
import type { FacilityType } from "@prisma/client";
import Button from "@/components/ui/Button";
import DateSelectInput from "@/components/ui/DateSelectInput";

export interface RegionOption {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

export interface FacilityRow {
  id: string;
  name: string;
  type: FacilityType;
  districtId: string;
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
  // regionId only drives which districts the second select offers — the
  // district select is the only one actually submitted (see districtId).
  regionId: string;
  districtId: string;
  // Display-only fallback for the read-only "District / Region" field a
  // District/Regional Admin sees instead of the region/district selects
  // (they can't reassign a facility's jurisdiction) — the regions list
  // itself is only fetched for Platform, so this can't be derived from it.
  districtLabel: string;
  phone: string;
  openedAt: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  type: "CHPS",
  regionId: "",
  districtId: "",
  districtLabel: "",
  phone: "",
  openedAt: "",
};

export default function FacilitiesClient({
  facilities,
  regions,
  canCreate,
}: {
  facilities: FacilityRow[];
  regions: RegionOption[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
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
    const region = regions.find((r) => r.districts.some((d) => d.id === facility.districtId));
    setForm({
      name: facility.name,
      type: facility.type,
      regionId: region?.id ?? "",
      districtId: facility.districtId,
      districtLabel: `${facility.district}, ${facility.region}`,
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
    if (!form.name.trim() || !form.districtId) {
      setError("Fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/facilities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          districtId: form.districtId,
          phone: form.phone || undefined,
          openedAt: form.openedAt,
        }),
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
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          districtId: form.districtId,
          phone: form.phone || undefined,
          openedAt: form.openedAt,
        }),
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
      width: "220px",
      render: (r) => (
        <span className="inline-block rounded-full bg-[#FBE8FF] px-2.5 py-1 text-center text-xs font-medium text-[#9F1AB1]">
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
      width: "56px",
      render: (r) => (
        <RowActionsMenu>
          <RowActionItem href={`/admin/staff?facilityId=${r.id}`}>Staff</RowActionItem>
          <RowActionItem onClick={() => openEdit(r)}>Edit</RowActionItem>
          <RowActionItem
            onClick={() => (r.isActive ? setDeactivateTarget(r) : handleToggleActive(r))}
            tone="danger"
          >
            {r.isActive ? "Deactivate" : "Reactivate"}
          </RowActionItem>
        </RowActionsMenu>
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
        {canCreate && (
          <button
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM);
              setError(null);
              setAddOpen(true);
            }}
            className="h-10 shrink-0 rounded-md bg-[#9F1AB1] px-4 text-sm font-semibold text-white"
          >
            + Add Facility
          </button>
        )}
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "Facility" : "Facilities"}
      </p>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No facilities match this search." />

      <Modal
        open={addOpen}
        onClose={closeModals}
        title="Add Facility"
        actions={
          <>
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
          </>
        }
      >
        <FacilityForm form={form} setForm={setForm} error={error} regions={regions} canChangeDistrict />
      </Modal>

      <Modal
        open={editTarget !== null}
        onClose={closeModals}
        title="Edit Facility"
        actions={
          <>
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
          </>
        }
      >
        <FacilityForm form={form} setForm={setForm} error={error} regions={regions} canChangeDistrict={canCreate} />
      </Modal>

      <Modal
        open={deactivateTarget !== null}
        onClose={closeModals}
        title="Deactivate Facility"
        actions={
          <>
            <button type="button" onClick={closeModals} className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]">
              Cancel
            </button>
            <Button
              size="admin-sm"
              hierarchy="danger"
              onClick={() => deactivateTarget && handleToggleActive(deactivateTarget)}
              disabled={submitting}
            >
              {submitting ? "Deactivating…" : "Deactivate"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280]">
          Are you sure you want to deactivate <strong>{deactivateTarget?.name}</strong>? Staff at this facility will
          remain assigned, but the facility won&apos;t be selectable for new registrations.
        </p>
      </Modal>

    </>
  );
}

function FacilityForm({
  form,
  setForm,
  error,
  regions,
  canChangeDistrict,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  error: string | null;
  regions: RegionOption[];
  // A District/Regional Admin can view a facility's district/region but not
  // reassign it (server-side, that field is silently ignored for them
  // anyway — see app/api/admin/facilities/[id]/route.ts) — shown as plain
  // text instead of an editable select so the form doesn't imply a change
  // that won't take effect.
  canChangeDistrict: boolean;
}) {
  const selectedRegion = regions.find((r) => r.id === form.regionId);

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
      {canChangeDistrict ? (
        <>
          <FormField label="Region" required>
            <select
              value={form.regionId}
              onChange={(e) => setForm({ ...form, regionId: e.target.value, districtId: "" })}
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="District" required>
            <select
              value={form.districtId}
              onChange={(e) => setForm({ ...form, districtId: e.target.value })}
              disabled={!form.regionId}
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] disabled:bg-[#F8FAFC] disabled:text-[#9CA3AF]"
            >
              <option value="">{form.regionId ? "Select a district" : "Select a region first"}</option>
              {(selectedRegion?.districts ?? []).map((district) => (
                <option key={district.id} value={district.id}>
                  {district.name}
                </option>
              ))}
            </select>
          </FormField>
        </>
      ) : (
        <FormField label="District / Region">
          <p className="flex h-10 items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#6B7280]">
            {form.districtLabel || "—"}
          </p>
        </FormField>
      )}
      <FormField label="Phone">
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: digitsOnly(e.target.value) })}
          placeholder="Optional"
          inputMode="numeric"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>
      <FormField label="Opened">
        <DateSelectInput
          value={form.openedAt}
          onChange={(v) => setForm({ ...form, openedAt: v })}
          size="sm"
          max={new Date().toISOString().split("T")[0]}
          aria-label="Opened date"
        />
      </FormField>
      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
    </div>
  );
}
