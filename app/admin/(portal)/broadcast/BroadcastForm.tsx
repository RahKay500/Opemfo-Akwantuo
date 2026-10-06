"use client";

import { useState } from "react";
import FormField from "@/components/admin/FormField";

interface FacilityOption {
  id: string;
  name: string;
}

interface DistrictOption {
  id: string;
  name: string;
  facilities: FacilityOption[];
}

export interface RegionOption {
  id: string;
  name: string;
  districts: DistrictOption[];
}

type Audience = "ADMINS" | "STAFF" | "MOTHERS";
type Scope = "ALL" | "REGION" | "DISTRICT" | "FACILITY";
type StaffRole = "MIDWIFE" | "DOCTOR" | "LAB_TECHNICIAN";

const AUDIENCE_LABEL: Record<Audience, string> = {
  ADMINS: "Facility Admins",
  STAFF: "Staff (Midwives/Gynaecologists/Lab Technicians)",
  MOTHERS: "Mothers",
};

const STAFF_ROLE_LABEL: Record<StaffRole, string> = {
  MIDWIFE: "Midwife",
  DOCTOR: "Gynaecologist",
  LAB_TECHNICIAN: "Lab Technician",
};

export default function BroadcastForm({ regions }: { regions: RegionOption[] }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("ADMINS");
  const [scope, setScope] = useState<Scope>("ALL");
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [staffRoles, setStaffRoles] = useState<Set<StaffRole>>(new Set());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ recipientCount: number; audience: Audience } | null>(null);

  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedDistrict = selectedRegion?.districts.find((d) => d.id === districtId);

  function toggleStaffRole(role: StaffRole) {
    setStaffRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(null);

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Enter a title.";
    if (!message.trim()) errors.message = "Enter a message.";
    if (scope === "REGION" && !regionId) errors.regionId = "Select a region.";
    if (scope === "DISTRICT" && !districtId) errors.districtId = "Select a district.";
    if (scope === "FACILITY" && !facilityId) errors.facilityId = "Select a facility.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          audience,
          scope,
          regionId: scope === "REGION" || scope === "DISTRICT" || scope === "FACILITY" ? regionId || undefined : undefined,
          districtId: scope === "DISTRICT" || scope === "FACILITY" ? districtId || undefined : undefined,
          facilityId: scope === "FACILITY" ? facilityId : undefined,
          roles: audience === "STAFF" && staffRoles.size > 0 ? Array.from(staffRoles) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        if (typeof data.error === "object" && data.error?.fieldErrors) {
          const fe: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.error.fieldErrors)) {
            if (Array.isArray(v) && v[0]) fe[k] = v[0] as string;
          }
          setFieldErrors(fe);
        } else {
          setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        }
        return;
      }
      setSuccess({ recipientCount: data.data.recipientCount, audience });
      setTitle("");
      setMessage("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Audience" required>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value as Audience)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          {(Object.keys(AUDIENCE_LABEL) as Audience[]).map((a) => (
            <option key={a} value={a}>
              {AUDIENCE_LABEL[a]}
            </option>
          ))}
        </select>
      </FormField>

      {audience === "STAFF" && (
        <FormField label="Staff roles" hint="Leave all unchecked to include every staff role.">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(STAFF_ROLE_LABEL) as StaffRole[]).map((role) => (
              <label key={role} className="flex items-center gap-1.5 text-sm text-[#1A1A2E]">
                <input
                  type="checkbox"
                  checked={staffRoles.has(role)}
                  onChange={() => toggleStaffRole(role)}
                  className="size-4 rounded border-[#E2E8F0]"
                />
                {STAFF_ROLE_LABEL[role]}
              </label>
            ))}
          </div>
        </FormField>
      )}

      <FormField label="Reach" required>
        <select
          value={scope}
          onChange={(e) => {
            setScope(e.target.value as Scope);
            setRegionId("");
            setDistrictId("");
            setFacilityId("");
          }}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          <option value="ALL">Everyone in this audience</option>
          <option value="REGION">A region</option>
          <option value="DISTRICT">A district</option>
          <option value="FACILITY">A facility</option>
        </select>
      </FormField>

      {(scope === "REGION" || scope === "DISTRICT" || scope === "FACILITY") && (
        <FormField label="Region" required error={fieldErrors.regionId}>
          <select
            value={regionId}
            onChange={(e) => {
              setRegionId(e.target.value);
              setDistrictId("");
              setFacilityId("");
            }}
            className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
          >
            <option value="">Select a region</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {(scope === "DISTRICT" || scope === "FACILITY") && (
        <FormField label="District" required error={fieldErrors.districtId}>
          <select
            value={districtId}
            onChange={(e) => {
              setDistrictId(e.target.value);
              setFacilityId("");
            }}
            disabled={!regionId}
            className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] disabled:bg-[#F8FAFC] disabled:text-[#9CA3AF]"
          >
            <option value="">{regionId ? "Select a district" : "Select a region first"}</option>
            {(selectedRegion?.districts ?? []).map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      {scope === "FACILITY" && (
        <FormField label="Facility" required error={fieldErrors.facilityId}>
          <select
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
            disabled={!districtId}
            className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] disabled:bg-[#F8FAFC] disabled:text-[#9CA3AF]"
          >
            <option value="">{districtId ? "Select a facility" : "Select a district first"}</option>
            {(selectedDistrict?.facilities ?? []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </FormField>
      )}

      <FormField label="Title" required error={fieldErrors.title}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. MoH training this week"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Message" required error={fieldErrors.message}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Write the notice to send..."
          className="rounded-md border border-[#E2E8F0] px-3 py-2 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
      {success && (
        <p className="text-sm text-[#16A34A]">
          Sent to {success.recipientCount} {success.recipientCount === 1 ? "recipient" : "recipients"} (
          {AUDIENCE_LABEL[success.audience]}).
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-[#9F1AB1] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Sending…" : "Send Broadcast"}
      </button>
    </form>
  );
}
