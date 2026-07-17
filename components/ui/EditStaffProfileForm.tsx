"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/ui/icons";

interface StaffProfileFormData {
  name: string;
  staffId: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  serviceStartDate: string;
  specialty?: string;
}

export default function EditStaffProfileForm({
  initial,
  backHref,
  apiPath,
  showSpecialty,
}: {
  initial: StaffProfileFormData;
  backHref: string;
  apiPath: string;
  showSpecialty?: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof StaffProfileFormData>(key: K, value: StaffProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          staffId: form.staffId || undefined,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender || undefined,
          email: form.email || undefined,
          serviceStartDate: form.serviceStartDate || undefined,
          specialty: showSpecialty ? form.specialty || undefined : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8] lg:items-center lg:bg-[#F6F1F8] lg:py-10">
      <div className="flex w-full items-center gap-2 bg-white px-4 pb-3.5 pt-[50px] shadow-[0px_1px_3px_0px_rgba(110,46,148,0.12)] lg:max-w-xl lg:rounded-card lg:pt-6 lg:shadow-card">
        <Link href={backHref} className="flex size-7 items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Edit Profile</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="font-body text-sm font-semibold text-lilac-deeper disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex w-full flex-col lg:max-w-xl lg:rounded-card lg:bg-white lg:shadow-card">
        <div className="flex flex-col items-center gap-2.5 pb-2 pt-6">
          <div className="flex size-24 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-[32px] font-bold text-lilac-deeper">{initials(form.name)}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-3">
          <Field label="Full name">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </Field>

          {showSpecialty && (
            <Field label="Specialty / Title">
              <input
                value={form.specialty ?? ""}
                onChange={(e) => update("specialty", e.target.value)}
                placeholder="e.g. Consultant Gynaecologist & Obstetrician"
                className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
          )}

          <Field label={showSpecialty ? "Medical Licence No." : "Staff ID"}>
            <input
              value={form.staffId}
              onChange={(e) => update("staffId", e.target.value)}
              placeholder={showSpecialty ? "e.g. GHS-MD-2010-0187" : "e.g. GHS-MW-2017-0044"}
              className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </Field>

          <Field label="Date of birth">
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </Field>

          <Field label="Gender">
            <select
              value={form.gender}
              onChange={(e) => update("gender", e.target.value)}
              className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
            >
              <option value="">Not recorded</option>
              <option value="FEMALE">Female</option>
              <option value="MALE">Male</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@ghs.gov.gh"
              className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </Field>

          <Field label="Service start date">
            <input
              type="date"
              value={form.serviceStartDate}
              onChange={(e) => update("serviceStartDate", e.target.value)}
              className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </Field>

          {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="mt-1 h-14 w-full rounded-card bg-lilac-dark font-heading text-[17px] font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-body text-sm font-medium text-[#374151]">{label}</p>
      {children}
    </div>
  );
}
