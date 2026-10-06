"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/FormField";
import { digitsOnly, lettersOnly } from "@/lib/utils";

export default function NewStaffForm({ facilityId }: { facilityId?: string }) {
  const router = useRouter();
  const staffListHref = facilityId ? `/admin/staff?facilityId=${facilityId}` : "/admin/staff";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"MIDWIFE" | "DOCTOR" | "LAB_TECHNICIAN">("MIDWIFE");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ email: string; devLink?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Enter a full name.";
    if (!email.trim()) errors.email = "Enter an email address.";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim() || undefined,
          role,
          licenseNumber: licenseNumber || undefined,
          facilityId,
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
      setSuccess({ email: data.data.email, devLink: data.data.devLink });
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
        <p className="mt-2 text-lg font-semibold text-[#1A1A2E]">Activation email sent to {success.email}</p>
        <p className="mt-2 text-sm text-[#6B7280]">
          The staff member can click the link in that email to set their password and activate their account.
        </p>
        {success.devLink && (
          <p className="mt-3 break-all rounded-md bg-[#F8FAFC] px-3 py-2 text-sm text-[#1A1A2E]">
            Dev activation link (no email provider configured):{" "}
            <a href={success.devLink} className="font-medium text-[#9F1AB1] underline">
              {success.devLink}
            </a>
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(staffListHref)}
            className="rounded-md bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Staff
          </button>
          <button
            type="button"
            onClick={() => {
              setSuccess(null);
              setName("");
              setEmail("");
              setPhone("");
              setLicenseNumber("");
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
          onChange={(e) => setName(lettersOnly(e.target.value))}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Email" required error={fieldErrors.email}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. e.tetteh@ghs.gov.gh"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Phone number" error={fieldErrors.phone}>
        <input
          value={phone}
          onChange={(e) => setPhone(digitsOnly(e.target.value))}
          placeholder="024 123 4567"
          inputMode="numeric"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      <FormField label="Role" required>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "MIDWIFE" | "DOCTOR" | "LAB_TECHNICIAN")}
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        >
          <option value="MIDWIFE">Midwife</option>
          <option value="DOCTOR">Gynaecologist</option>
          <option value="LAB_TECHNICIAN">Lab Technician</option>
        </select>
      </FormField>

      <FormField label="Licence number">
        <input
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          placeholder="Optional — for future verification"
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
