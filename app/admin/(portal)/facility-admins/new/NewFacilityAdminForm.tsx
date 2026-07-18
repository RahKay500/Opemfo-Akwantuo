"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/FormField";

export default function NewFacilityAdminForm({ facilities }: { facilities: { id: string; name: string }[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [facilityId, setFacilityId] = useState(facilities[0]?.id ?? "");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ phone: string; devOtp?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Enter a full name.";
    if (!phone.trim()) errors.phone = "Enter a phone number.";
    if (!facilityId) errors.facilityId = "Select a facility.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/facility-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: email.trim() || undefined, phone, facilityId }),
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
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md rounded-lg border border-[#E2E8F0] bg-white p-8">
        <p className="text-sm font-medium text-[#16A34A]">Account created</p>
        <p className="mt-2 text-lg font-semibold text-[#1A1A2E]">OTP sent to {success.phone}</p>
        <p className="mt-2 text-sm text-[#6B7280]">
          The Facility Admin can now open the admin portal and use this phone number to activate their account.
        </p>
        {success.devOtp && (
          <p className="mt-3 rounded-md bg-[#F8FAFC] px-3 py-2 text-sm text-[#1A1A2E]">
            Dev OTP (no SMS provider configured): <strong>{success.devOtp}</strong>
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/facility-admins")}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Facility Admins
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
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4 rounded-lg border border-[#E2E8F0] bg-white p-8">
      <FormField label="Full name" required error={fieldErrors.name}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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

      <FormField label="Phone number" required error={fieldErrors.phone}>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 123 4567"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Facility" required error={fieldErrors.facilityId}>
        <select
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          {facilities.length === 0 && <option value="">No active facilities</option>}
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </FormField>

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}

      <button
        type="submit"
        disabled={submitting || facilities.length === 0}
        className="mt-2 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Creating…" : "Create Account"}
      </button>
    </form>
  );
}
