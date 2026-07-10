"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { initials } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/ui/icons";

interface ProfileFormData {
  name: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function EditProfileForm({ initial }: { initial: ProfileFormData }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/mother/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          dateOfBirth: form.dateOfBirth,
          bloodGroup: form.bloodGroup || undefined,
          emergencyContactName: form.emergencyContactName || undefined,
          emergencyContactPhone: form.emergencyContactPhone || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      router.push("/mother/profile");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-2 bg-white px-4 pb-3.5 pt-[50px] shadow-[0px_1px_3px_0px_rgba(110,46,148,0.12)]">
        <Link href="/mother/profile" className="flex size-7 items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Edit Profile</h1>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="font-body text-sm font-semibold text-pink-deep disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

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

        <Field label="Phone number">
          <div className="flex h-[54px] w-full items-center rounded-input border-[1.5px] border-border-color bg-[#F3F4F6] px-4 font-body text-[15px] text-text-secondary">
            {form.phone}
          </div>
        </Field>

        <Field label="Date of birth">
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </Field>

        <Field label="Blood group">
          <select
            value={form.bloodGroup}
            onChange={(e) => update("bloodGroup", e.target.value)}
            className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
          >
            <option value="">Not recorded</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Emergency contact name">
          <input
            value={form.emergencyContactName}
            onChange={(e) => update("emergencyContactName", e.target.value)}
            className="h-[54px] w-full rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-[15px] text-text-primary outline-none focus:border-primary"
          />
        </Field>

        <Field label="Emergency contact phone">
          <input
            value={form.emergencyContactPhone}
            onChange={(e) => update("emergencyContactPhone", e.target.value)}
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
