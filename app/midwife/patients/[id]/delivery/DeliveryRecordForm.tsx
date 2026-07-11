"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = ["Delivery Details", "Baby & Discharge"] as const;
const DELIVERY_TYPES = ["Normal", "Vacuum", "Caesarean Section", "Other"];
const PERINEUM_STATES = ["Intact", "Tear", "Episiotomy"];

export interface DeliveryRecordInitial {
  weeksOfPregnancy: number | null;
  dateOfDelivery: string | null;
  timeOfDelivery: string | null;
  timeOfPlacentaDelivery: string | null;
  durationOfLabourHours: number | null;
  durationOfLabourMinutes: number | null;
  typeOfDelivery: string | null;
  indicationForVacuumOrCs: string | null;
  anesthesia: string | null;
  estimatedBloodLossMl: number | null;
  bloodTransfusion: boolean | null;
  statePlacentaMembranes: string | null;
  manualRemovalOfPlacenta: boolean | null;
  statePerineum: string | null;
  labourDeliveryComplications: string | null;
  birthAttendant: string | null;
  placeOfDelivery: string | null;
  breastfedWithin30Min: boolean | null;
  skinToSkinContact: boolean | null;
  babySex: string | null;
  babyBirthWeightKg: number | null;
  babyCondition: string | null;
}

function toStr(v: number | string | null | undefined): string {
  return v == null ? "" : String(v);
}

export default function DeliveryRecordForm({
  patientId,
  initial,
}: {
  patientId: string;
  initial: DeliveryRecordInitial | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [weeksOfPregnancy, setWeeksOfPregnancy] = useState(toStr(initial?.weeksOfPregnancy));
  const [dateOfDelivery, setDateOfDelivery] = useState(initial?.dateOfDelivery ?? "");
  const [timeOfDelivery, setTimeOfDelivery] = useState(initial?.timeOfDelivery ?? "");
  const [timeOfPlacentaDelivery, setTimeOfPlacentaDelivery] = useState(initial?.timeOfPlacentaDelivery ?? "");
  const [durationOfLabourHours, setDurationOfLabourHours] = useState(toStr(initial?.durationOfLabourHours));
  const [durationOfLabourMinutes, setDurationOfLabourMinutes] = useState(toStr(initial?.durationOfLabourMinutes));
  const [typeOfDelivery, setTypeOfDelivery] = useState(initial?.typeOfDelivery ?? "");
  const [indicationForVacuumOrCs, setIndicationForVacuumOrCs] = useState(initial?.indicationForVacuumOrCs ?? "");
  const [anesthesia, setAnesthesia] = useState(initial?.anesthesia ?? "");
  const [estimatedBloodLossMl, setEstimatedBloodLossMl] = useState(toStr(initial?.estimatedBloodLossMl));
  const [bloodTransfusion, setBloodTransfusion] = useState<boolean | null>(initial?.bloodTransfusion ?? null);
  const [statePlacentaMembranes, setStatePlacentaMembranes] = useState(initial?.statePlacentaMembranes ?? "");
  const [manualRemovalOfPlacenta, setManualRemovalOfPlacenta] = useState<boolean | null>(
    initial?.manualRemovalOfPlacenta ?? null
  );
  const [statePerineum, setStatePerineum] = useState(initial?.statePerineum ?? "");
  const [labourDeliveryComplications, setLabourDeliveryComplications] = useState(
    initial?.labourDeliveryComplications ?? ""
  );
  const [birthAttendant, setBirthAttendant] = useState(initial?.birthAttendant ?? "");
  const [placeOfDelivery, setPlaceOfDelivery] = useState(initial?.placeOfDelivery ?? "");

  const [babySex, setBabySex] = useState(initial?.babySex ?? "");
  const [babyBirthWeightKg, setBabyBirthWeightKg] = useState(toStr(initial?.babyBirthWeightKg));
  const [babyCondition, setBabyCondition] = useState(initial?.babyCondition ?? "");
  const [breastfedWithin30Min, setBreastfedWithin30Min] = useState<boolean | null>(
    initial?.breastfedWithin30Min ?? null
  );
  const [skinToSkinContact, setSkinToSkinContact] = useState<boolean | null>(initial?.skinToSkinContact ?? null);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weeksOfPregnancy: weeksOfPregnancy ? Number(weeksOfPregnancy) : undefined,
          dateOfDelivery: dateOfDelivery || undefined,
          timeOfDelivery: timeOfDelivery.trim() || undefined,
          timeOfPlacentaDelivery: timeOfPlacentaDelivery.trim() || undefined,
          durationOfLabourHours: durationOfLabourHours ? Number(durationOfLabourHours) : undefined,
          durationOfLabourMinutes: durationOfLabourMinutes ? Number(durationOfLabourMinutes) : undefined,
          typeOfDelivery: typeOfDelivery || undefined,
          indicationForVacuumOrCs: indicationForVacuumOrCs.trim() || undefined,
          anesthesia: anesthesia.trim() || undefined,
          estimatedBloodLossMl: estimatedBloodLossMl ? Number(estimatedBloodLossMl) : undefined,
          bloodTransfusion: bloodTransfusion ?? undefined,
          statePlacentaMembranes: statePlacentaMembranes.trim() || undefined,
          manualRemovalOfPlacenta: manualRemovalOfPlacenta ?? undefined,
          statePerineum: statePerineum || undefined,
          labourDeliveryComplications: labourDeliveryComplications.trim() || undefined,
          birthAttendant: birthAttendant.trim() || undefined,
          placeOfDelivery: placeOfDelivery.trim() || undefined,
          breastfedWithin30Min: breastfedWithin30Min ?? undefined,
          skinToSkinContact: skinToSkinContact ?? undefined,
          babySex: babySex || undefined,
          babyBirthWeightKg: babyBirthWeightKg ? Number(babyBirthWeightKg) : undefined,
          babyCondition: babyCondition.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      router.push(`/midwife/patients/${patientId}`);
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
            <Field label="Weeks of Pregnancy">
              <input
                type="number"
                value={weeksOfPregnancy}
                onChange={(e) => setWeeksOfPregnancy(e.target.value)}
                placeholder="e.g. 39"
                className={inputClass}
              />
            </Field>
            <Field label="Date of Delivery">
              <input
                type="date"
                value={dateOfDelivery}
                onChange={(e) => setDateOfDelivery(e.target.value)}
                className={inputClass}
              />
            </Field>
            <div className="flex gap-3">
              <Field label="Time of Delivery" className="flex-1">
                <input
                  type="time"
                  value={timeOfDelivery}
                  onChange={(e) => setTimeOfDelivery(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Time of Placenta Delivery" className="flex-1">
                <input
                  type="time"
                  value={timeOfPlacentaDelivery}
                  onChange={(e) => setTimeOfPlacentaDelivery(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex gap-3">
              <Field label="Duration of Labour (hrs)" className="flex-1">
                <input
                  type="number"
                  value={durationOfLabourHours}
                  onChange={(e) => setDurationOfLabourHours(e.target.value)}
                  placeholder="e.g. 8"
                  className={inputClass}
                />
              </Field>
              <Field label="Duration of Labour (min)" className="flex-1">
                <input
                  type="number"
                  value={durationOfLabourMinutes}
                  onChange={(e) => setDurationOfLabourMinutes(e.target.value)}
                  placeholder="e.g. 30"
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Type of Delivery">
              <select
                value={typeOfDelivery}
                onChange={(e) => setTypeOfDelivery(e.target.value)}
                className={inputClass}
              >
                <option value="">Select type</option>
                {DELIVERY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            {typeOfDelivery && typeOfDelivery !== "Normal" && (
              <Field label="Indication for Vacuum/CS">
                <input
                  value={indicationForVacuumOrCs}
                  onChange={(e) => setIndicationForVacuumOrCs(e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>
            )}
            <Field label="Anesthesia">
              <input
                value={anesthesia}
                onChange={(e) => setAnesthesia(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
            <Field label="Estimated Blood Loss (ml)">
              <input
                type="number"
                value={estimatedBloodLossMl}
                onChange={(e) => setEstimatedBloodLossMl(e.target.value)}
                placeholder="e.g. 250"
                className={inputClass}
              />
            </Field>
            <Field label="Blood Transfusion">
              <YesNoToggle value={bloodTransfusion} onChange={setBloodTransfusion} />
            </Field>
            <Field label="State of Placenta/Membranes">
              <input
                value={statePlacentaMembranes}
                onChange={(e) => setStatePlacentaMembranes(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
            <Field label="Manual Removal of Placenta">
              <YesNoToggle value={manualRemovalOfPlacenta} onChange={setManualRemovalOfPlacenta} />
            </Field>
            <Field label="State of Perineum">
              <select value={statePerineum} onChange={(e) => setStatePerineum(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                {PERINEUM_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Labour/Delivery Complications">
              <textarea
                value={labourDeliveryComplications}
                onChange={(e) => setLabourDeliveryComplications(e.target.value)}
                rows={3}
                placeholder="Optional"
                className="w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </Field>
            <Field label="Birth Attendant">
              <input
                value={birthAttendant}
                onChange={(e) => setBirthAttendant(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
            <Field label="Place of Delivery">
              <input
                value={placeOfDelivery}
                onChange={(e) => setPlaceOfDelivery(e.target.value)}
                placeholder="Optional"
                className={inputClass}
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field label="Baby Sex">
              <select value={babySex} onChange={(e) => setBabySex(e.target.value)} className={inputClass}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </Field>
            <Field label="Baby Birth Weight (kg)">
              <input
                type="number"
                step="0.1"
                value={babyBirthWeightKg}
                onChange={(e) => setBabyBirthWeightKg(e.target.value)}
                placeholder="e.g. 3.2"
                className={inputClass}
              />
            </Field>
            <Field label="Baby Condition">
              <input
                value={babyCondition}
                onChange={(e) => setBabyCondition(e.target.value)}
                placeholder="e.g. Alive and well"
                className={inputClass}
              />
            </Field>
            <Field label="Breastfed within 30 minutes">
              <YesNoToggle value={breastfedWithin30Min} onChange={setBreastfedWithin30Min} />
            </Field>
            <Field label="Skin-to-Skin Contact">
              <YesNoToggle value={skinToSkinContact} onChange={setSkinToSkinContact} />
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
            onClick={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
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
            {submitting ? "Saving…" : "Save Delivery Record"}
          </button>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary";

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function YesNoToggle({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex rounded-badge bg-lilac-light p-1">
      {[
        { label: "Yes", v: true },
        { label: "No", v: false },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.v)}
          className={cn(
            "flex-1 rounded-badge py-2.5 text-center font-heading text-sm font-bold",
            value === opt.v ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
