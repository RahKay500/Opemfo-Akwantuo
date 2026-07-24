"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/admin/FormField";
import { GHANA_REGIONS, GHANA_REGION_NAMES } from "@/lib/ghana-regions";

export default function ProfileForm({
  initialName,
  initialOrgName,
  initialDistrict,
  initialRegion,
  isPlatform,
}: {
  initialName: string | null;
  initialOrgName: string | null;
  initialDistrict: string | null;
  initialRegion: string | null;
  isPlatform: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName ?? "");
  const [orgName, setOrgName] = useState(initialOrgName ?? "");
  const [district, setDistrict] = useState(initialDistrict ?? "");
  const [region, setRegion] = useState(initialRegion ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          orgName: orgName.trim() || undefined,
          district: district.trim() || undefined,
          region: region.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-4 rounded-lg border border-[#E2E8F0] bg-white p-8">
      <h2 className="text-base font-semibold text-[#1A1A2E]">Profile</h2>
      <p className="text-sm text-[#6B7280]">Shown in the sidebar and page header while you&apos;re signed in.</p>

      <FormField label="Full name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. System Administrator"
          className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
        />
      </FormField>

      {isPlatform && (
        <>
          <FormField label="Organisation">
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Kwahu East District Health Directorate"
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
            />
          </FormField>

          <FormField label="Region">
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setDistrict("");
              }}
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3]"
            >
              <option value="">Select a region</option>
              {GHANA_REGION_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="District">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!region}
              className="h-10 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] disabled:bg-[#F8FAFC] disabled:text-[#9CA3AF]"
            >
              <option value="">{region ? "Select a district" : "Select a region first"}</option>
              {(GHANA_REGIONS[region] ?? []).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </FormField>
        </>
      )}

      {error && <p className="text-sm text-[#DC2626]">{error}</p>}
      {success && <p className="text-sm text-[#16A34A]">Profile updated.</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-[#1A1A2E] text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
