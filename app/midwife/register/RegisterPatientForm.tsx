"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import DateSelectInput from "@/components/ui/DateSelectInput";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import GhanaCardInput from "@/components/ui/GhanaCardInput";
import { digitsOnly, lettersOnly } from "@/lib/utils";
import Field from "@/components/forms/patient-intake/Field";

const STEPS = ["Personal", "Family"] as const;
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Other"];
const EDUCATIONAL_LEVELS = ["None", "Primary", "JHS", "SHS", "Tertiary"];

export default function RegisterPatientForm({ facilityName }: { facilityName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [ghanaCardId, setGhanaCardId] = useState("");
  const [nationality, setNationality] = useState("Ghanaian");

  const [community, setCommunity] = useState("");
  const [nhisNumber, setNhisNumber] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [maritalStatusOther, setMaritalStatusOther] = useState("");
  const [educationalLevel, setEducationalLevel] = useState("");
  const [occupation, setOccupation] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [spousePhone, setSpousePhone] = useState("");
  const [spouseOccupation, setSpouseOccupation] = useState("");
  const [emergencyTransportPhone, setEmergencyTransportPhone] = useState("");

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
          nationality: nationality.trim() || undefined,
          community: community.trim() || undefined,
          nhisNumber: nhisNumber.trim() || undefined,
          maritalStatus: (maritalStatus === "Other" ? maritalStatusOther.trim() : maritalStatus) || undefined,
          educationalLevel: educationalLevel || undefined,
          occupation: occupation.trim() || undefined,
          spouseName: spouseName.trim() || undefined,
          spousePhone: spousePhone.trim() || undefined,
          spouseOccupation: spouseOccupation.trim() || undefined,
          emergencyTransportPhone: emergencyTransportPhone.trim() || undefined,
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
    <div className="flex flex-1 flex-col lg:px-5 lg:pb-10 lg:pt-6">
      <div className="lg:rounded-card lg:bg-white lg:p-8 lg:border border-border-color">
        <h2 className="hidden font-heading text-lg font-bold text-text-primary lg:block">Register New Patient</h2>

        <div className="flex items-center gap-1 overflow-x-auto px-6 pt-5 lg:px-0 lg:pt-0 lg:mt-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex shrink-0 items-center">
              {i > 0 && <div className={cn("h-0.5 w-4", i <= step ? "bg-primary" : "bg-border-color")} />}
              <button
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "shrink-0 rounded-badge border-[1.5px] px-3 py-2 font-body text-xs font-medium",
                  i === step
                    ? "border-primary bg-primary text-white"
                    : i < step
                      ? "border-primary bg-white text-lilac-deeper"
                      : "border-border-color bg-white text-text-secondary"
                )}
              >
                {label}
              </button>
            </div>
          ))}
        </div>

      <div className="flex flex-1 flex-col gap-4 px-6 pb-32 pt-6 lg:grid lg:grid-cols-2 lg:gap-x-4 lg:gap-y-4 lg:px-0 lg:pb-0 lg:pt-6">
        {step === 0 && (
          <>
            <Field label="Full Name">
              <Input inputSize="lg" value={name} onChange={(e) => setName(lettersOnly(e.target.value))} placeholder="Enter full name" />
            </Field>
            <Field label="Date of Birth">
              <DateSelectInput
                value={dateOfBirth}
                onChange={setDateOfBirth}
                max={new Date().toISOString().split("T")[0]}
                aria-label="Date of birth"
              />
            </Field>
            <Field label="Phone Number">
              <Input
                inputSize="lg"
                value={phone}
                onChange={(e) => setPhone(digitsOnly(e.target.value))}
                placeholder="024 123 4567"
                inputMode="numeric"
              />
            </Field>
            <Field label="Ghana Card ID">
              <GhanaCardInput value={ghanaCardId} onChange={setGhanaCardId} />
            </Field>
            <Field label="Nationality">
              <Input inputSize="lg" value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="e.g. Ghanaian" />
            </Field>
            <Field label="CHPS Zone" className="lg:col-span-2">
              <div className="flex h-14 w-full items-center rounded-input border-[1.5px] border-lilac-light bg-lilac-light px-[17.5px] font-body text-[15px] text-lilac-deeper">
                {facilityName}
              </div>
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Community">
              <Input inputSize="lg" value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="e.g. Asuom" />
            </Field>
            <Field label="NHIS Number">
              <Input inputSize="lg" value={nhisNumber} onChange={(e) => setNhisNumber(e.target.value)} placeholder="Optional" />
            </Field>
            <div className="flex gap-3 lg:col-span-2">
              <Field label="Marital Status" className="flex-1">
                <Select
                  selectSize="lg"
                  value={maritalStatus}
                  onChange={(e) => {
                    setMaritalStatus(e.target.value);
                    if (e.target.value !== "Other") setMaritalStatusOther("");
                  }}
                >
                  <option value="">Select</option>
                  {MARITAL_STATUSES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Educational Level" className="flex-1">
                <Select selectSize="lg" value={educationalLevel} onChange={(e) => setEducationalLevel(e.target.value)}>
                  <option value="">Select</option>
                  {EDUCATIONAL_LEVELS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            {maritalStatus === "Other" && (
              <Field label="Marital Status — please specify" className="lg:col-span-2">
                <Input
                  inputSize="lg"
                  value={maritalStatusOther}
                  onChange={(e) => setMaritalStatusOther(e.target.value)}
                  placeholder="e.g. Common-law"
                />
              </Field>
            )}
            <Field label="Occupation">
              <Input inputSize="lg" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="Optional" />
            </Field>
            {maritalStatus === "Married" && (
              <>
                <Field label="Spouse's Name">
                  <Input inputSize="lg" value={spouseName} onChange={(e) => setSpouseName(lettersOnly(e.target.value))} placeholder="Optional" />
                </Field>
                <div className="flex gap-3 lg:col-span-2">
                  <Field label="Spouse's Phone" className="flex-1">
                    <Input
                      inputSize="lg"
                      value={spousePhone}
                      onChange={(e) => setSpousePhone(digitsOnly(e.target.value))}
                      placeholder="024 123 4567"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Spouse's Occupation" className="flex-1">
                    <Input
                      inputSize="lg"
                      value={spouseOccupation}
                      onChange={(e) => setSpouseOccupation(e.target.value)}
                      placeholder="Optional"
                    />
                  </Field>
                </div>
              </>
            )}
            <Field label="Emergency Transport Phone" className="lg:col-span-2">
              <Input
                inputSize="lg"
                value={emergencyTransportPhone}
                onChange={(e) => setEmergencyTransportPhone(e.target.value)}
                placeholder="e.g. driver or ambulance contact"
              />
            </Field>
          </>
        )}

        {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}
      </div>

        {/* Desktop: inline action row inside the card, not fixed. */}
        <div className="mt-8 hidden gap-3 lg:flex">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-12 w-auto rounded-card border-[1.5px] border-border-color px-8 font-heading text-[15px] font-bold text-text-secondary"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleContinue}
              className="h-12 w-auto rounded-card bg-lilac-mid px-8 font-heading text-[15px] font-bold text-lilac-deeper"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-12 w-auto rounded-card bg-lilac-mid px-8 font-heading text-[15px] font-bold text-lilac-deeper disabled:opacity-60"
            >
              {submitting ? "Registering…" : "Register Patient"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile: fixed bottom action bar. */}
      <div className="fixed inset-x-0 bottom-20 z-20 mx-auto flex w-full max-w-[430px] gap-3 border-t border-border-color bg-white px-6 py-4 lg:hidden">
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
            className="h-14 flex-1 rounded-card bg-lilac-mid font-heading text-[15px] font-bold text-lilac-deeper"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="h-14 flex-1 rounded-card bg-lilac-mid font-heading text-[15px] font-bold text-lilac-deeper disabled:opacity-60"
          >
            {submitting ? "Registering…" : "Register Patient"}
          </button>
        )}
      </div>
    </div>
  );
}
