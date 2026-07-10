"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import DateOfBirthInput from "@/components/ui/DateOfBirthInput";

const STEPS = ["Personal", "Pregnancy", "Emergency"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELATIONS = ["Husband", "Mother", "Sister", "Father", "Other"];

export default function RegisterPatientForm({ facilityName }: { facilityName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [ghanaCardId, setGhanaCardId] = useState("");

  const [lmp, setLmp] = useState("");
  const [gravida, setGravida] = useState("");
  const [para, setPara] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [knownConditions, setKnownConditions] = useState("");

  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("");

  const edd = lmp ? new Date(new Date(lmp).getTime() + 280 * 24 * 60 * 60 * 1000) : null;

  function validateStep(): string | null {
    if (step === 0) {
      if (!name.trim()) return "Enter the patient's full name.";
      if (!dateOfBirth) return "Enter date of birth.";
      if (!phone.trim()) return "Enter a phone number.";
    }
    return null;
  }

  function handleContinue() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dateOfBirth,
          phone: phone.trim(),
          ghanaCardId: ghanaCardId.trim() || undefined,
          lmp: lmp || undefined,
          gravida: gravida ? Number(gravida) : undefined,
          para: para ? Number(para) : undefined,
          bloodGroup: bloodGroup || undefined,
          knownConditions: knownConditions.trim() || undefined,
          emergencyContactName: emergencyContactName.trim() || undefined,
          emergencyContactPhone: emergencyContactPhone.trim() || undefined,
          emergencyContactRelation: emergencyContactRelation || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      const { patient } = await res.json();
      router.push(`/midwife/patients/${patient.id}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-1 px-6 pt-5">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && <div className={cn("h-0.5 flex-1", i <= step ? "bg-primary" : "bg-border-color")} />}
              <div
                className={cn(
                  "rounded-badge border-[1.5px] px-4 py-2 font-body text-xs font-medium",
                  i === step
                    ? "border-primary bg-primary text-white"
                    : i < step
                      ? "border-primary bg-white text-lilac-deeper"
                      : "border-border-color bg-white text-text-secondary"
                )}
              >
                {label}
              </div>
              {i < STEPS.length - 1 && <div className={cn("h-0.5 flex-1", i < step ? "bg-primary" : "bg-border-color")} />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pb-32 pt-6">
        {step === 0 && (
          <>
            <Field label="Full Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="Date of Birth">
              <DateOfBirthInput
                value={dateOfBirth}
                onChange={setDateOfBirth}
                max={new Date().toISOString().split("T")[0]}
              />
            </Field>
            <Field label="Phone Number">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="024 123 4567"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="Ghana Card ID">
              <input
                value={ghanaCardId}
                onChange={(e) => setGhanaCardId(e.target.value)}
                placeholder="GHA-XXXXXXXXX-X"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="CHPS Zone">
              <div className="flex h-14 w-full items-center rounded-input border-[1.5px] border-lilac-light bg-lilac-light px-[17.5px] font-body text-[15px] text-lilac-deeper">
                {facilityName}
              </div>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Last Menstrual Period (LMP)">
              <input
                type="date"
                value={lmp}
                onChange={(e) => setLmp(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="Estimated Due Date (EDD)">
              <div className="flex h-14 w-full items-center rounded-input border-[1.5px] border-lilac-light bg-lilac-light px-[17.5px] font-body text-[15px] text-lilac-deeper">
                {edd ? edd.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" }) : "Enter LMP to calculate"}
              </div>
            </Field>
            <div className="flex gap-3">
              <Field label="Gravida" className="flex-1">
                <input
                  type="number"
                  value={gravida}
                  onChange={(e) => setGravida(e.target.value)}
                  placeholder="e.g. 2"
                  className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
                />
              </Field>
              <Field label="Para" className="flex-1">
                <input
                  type="number"
                  value={para}
                  onChange={(e) => setPara(e.target.value)}
                  placeholder="e.g. 1"
                  className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
                />
              </Field>
            </div>
            <Field label="Blood Group">
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Known Conditions">
              <textarea
                value={knownConditions}
                onChange={(e) => setKnownConditions(e.target.value)}
                rows={3}
                placeholder="Optional"
                className="w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-sm text-text-primary outline-none focus:border-primary"
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Emergency Contact Name">
              <input
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Enter full name"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="Emergency Contact Phone">
              <input
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="024 123 4567"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="Relationship">
              <select
                value={emergencyContactRelation}
                onChange={(e) => setEmergencyContactRelation(e.target.value)}
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              >
                <option value="">Select relationship</option>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-20 z-20 mx-auto flex w-full max-w-[430px] gap-3 border-t border-border-color bg-white px-6 py-4 lg:inset-x-auto lg:bottom-0 lg:left-60 lg:right-0 lg:max-w-3xl">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="h-14 flex-1 rounded-card border-[1.5px] border-border-color font-heading text-[15px] font-bold text-text-secondary"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleContinue}
            className="h-14 flex-1 rounded-card bg-primary font-heading text-[15px] font-bold text-white"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-14 flex-1 rounded-card bg-primary font-heading text-[15px] font-bold text-white disabled:opacity-60"
          >
            {submitting ? "Registering…" : "Register Patient"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
