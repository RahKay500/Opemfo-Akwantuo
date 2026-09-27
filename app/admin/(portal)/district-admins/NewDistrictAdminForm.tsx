"use client";

import { useState } from "react";
import FormField from "@/components/admin/FormField";
import { digitsOnly, lettersOnly } from "@/lib/utils";

export interface RegionOption {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

export default function NewDistrictAdminForm({
  regions,
  onCreated,
  onClose,
}: {
  // Platform gets every region here; a Regional Admin gets exactly one
  // (their own) — see app/admin/(portal)/district-admins/page.tsx. A single
  // entry collapses the region picker to a fixed label instead of a select,
  // since there's nothing to actually choose from.
  regions: RegionOption[];
  onCreated?: () => void;
  onClose?: () => void;
}) {
  const lockedRegion = regions.length === 1 ? regions[0] : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regionId, setRegionId] = useState(lockedRegion?.id ?? "");
  const [districtId, setDistrictId] = useState(lockedRegion?.districts[0]?.id ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ phone: string; devOtp?: string } | null>(null);

  const selectedRegion = regions.find((r) => r.id === regionId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Enter a full name.";
    if (!phone.trim()) errors.phone = "Enter a phone number.";
    if (!districtId) errors.districtId = "Select a district.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/district-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim() || undefined, phone, districtId }),
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
      setSuccess({ phone: data.data.phone, devOtp: data.data.devOtp });
      onCreated?.();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div>
        <p className="text-sm font-medium text-[#16A34A]">Account created</p>
        <p className="mt-2 text-lg font-semibold text-[#1A1A2E]">OTP sent to {success.phone}</p>
        <p className="mt-2 text-sm text-[#6B7280]">
          The District Admin can now open the admin portal and use this phone number to activate their account.
        </p>
        {success.devOtp && (
          <p className="mt-3 rounded-md bg-[#F8FAFC] px-3 py-2 text-sm text-[#1A1A2E]">
            Dev OTP (no SMS provider configured): <strong>{success.devOtp}</strong>
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setName("");
              setEmail("");
              setPhone("");
            }}
            className="rounded-md border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#1A1A2E]"
          >
            Add another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormField label="Full name" required error={fieldErrors.name}>
        <input
          value={name}
          onChange={(e) => setName(lettersOnly(e.target.value))}
          placeholder="e.g. Emmanuel Tetteh"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Email" error={fieldErrors.email}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. e.tetteh@ghs.gov.gh"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {lockedRegion ? (
        <FormField label="Region">
          <p className="flex h-10 items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-sm text-[#6B7280]">
            {lockedRegion.name}
          </p>
        </FormField>
      ) : (
        <FormField label="Region" required>
          <select
            value={regionId}
            onChange={(e) => {
              setRegionId(e.target.value);
              setDistrictId("");
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

      <FormField label="District" required error={fieldErrors.districtId}>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          disabled={!lockedRegion && !regionId}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] disabled:bg-[#F8FAFC] disabled:text-[#9CA3AF]"
        >
          <option value="">{lockedRegion || regionId ? "Select a district" : "Select a region first"}</option>
          {(lockedRegion?.districts ?? selectedRegion?.districts ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Phone number" required error={fieldErrors.phone}>
        <input
          value={phone}
          onChange={(e) => setPhone(digitsOnly(e.target.value))}
          placeholder="024 123 4567"
          inputMode="numeric"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create Account"}
      </button>
    </form>
  );
}
