"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface LogVitalsPatientOption {
  id: string;
  name: string;
  week: number | null;
}

const URINE_OPTIONS = [
  { value: "NEGATIVE", label: "Negative" },
  { value: "TRACE", label: "Trace" },
  { value: "PLUS_1", label: "1+" },
  { value: "PLUS_2", label: "2+" },
  { value: "PLUS_3", label: "3+" },
] as const;

const PRESENTATION_OPTIONS = [
  { value: "CEPHALIC", label: "Cephalic" },
  { value: "BREECH", label: "Breech" },
  { value: "OTHER", label: "Other" },
] as const;

export default function LogVitalsForm({
  patients,
  initialPatientId,
}: {
  patients: LogVitalsPatientOption[];
  initialPatientId: string | null;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(initialPatientId ?? patients[0]?.id ?? "");
  const [visitType, setVisitType] = useState<"ANTENATAL" | "POSTNATAL">("ANTENATAL");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [weight, setWeight] = useState("");
  const [fetalHeartRate, setFetalHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [fundalHeight, setFundalHeight] = useState("");
  const [urineProt, setUrineProt] = useState("");
  const [urineSugar, setUrineSugar] = useState("");
  const [oedema, setOedema] = useState<boolean | null>(null);
  const [fetalPresentation, setFetalPresentation] = useState("");
  const [fetalDescent, setFetalDescent] = useState("");
  const [ifaSupplied, setIfaSupplied] = useState("");
  const [complaints, setComplaints] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [observations, setObservations] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPatient = patients.find((p) => p.id === patientId) ?? null;

  async function handleSubmit() {
    if (!patientId) {
      setError("Select a patient.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/patients/${patientId}/visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitType,
          systolic: systolic ? Number(systolic) : undefined,
          diastolic: diastolic ? Number(diastolic) : undefined,
          weight: weight ? Number(weight) : undefined,
          fetalHeartRate: fetalHeartRate ? Number(fetalHeartRate) : undefined,
          temperature: temperature ? Number(temperature) : undefined,
          fundalHeight: fundalHeight ? Number(fundalHeight) : undefined,
          urineProt: visitType === "ANTENATAL" && urineProt ? urineProt : undefined,
          urineSugar: visitType === "ANTENATAL" && urineSugar ? urineSugar : undefined,
          oedema: visitType === "ANTENATAL" && oedema != null ? oedema : undefined,
          fetalPresentation: visitType === "ANTENATAL" && fetalPresentation ? fetalPresentation : undefined,
          fetalDescent: visitType === "ANTENATAL" && fetalDescent.trim() ? fetalDescent.trim() : undefined,
          ifaSupplied: visitType === "ANTENATAL" && ifaSupplied ? Number(ifaSupplied) : undefined,
          complaints: visitType === "ANTENATAL" && complaints.trim() ? complaints.trim() : undefined,
          nextVisitDate: nextVisitDate || undefined,
          observations: observations.trim() || undefined,
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
    <div className="rounded-card bg-white p-5 shadow-card lg:p-8">
      <h2 className="font-heading text-lg font-bold text-text-primary">Log Patient Vitals</h2>

      <div className="mt-5">
        <label className="font-body text-[13px] font-medium text-text-secondary">Select Patient</label>
        <select
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        >
          {patients.length === 0 && <option value="">No patients</option>}
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.week != null ? ` — Wk ${p.week}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className="font-body text-[13px] font-medium text-text-secondary">Visit type</label>
        <div className="mt-1.5 flex rounded-badge bg-lilac-light p-1">
          {(["ANTENATAL", "POSTNATAL"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setVisitType(t)}
              className={cn(
                "flex-1 rounded-badge py-2.5 text-center font-heading text-sm font-bold",
                visitType === t ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
              )}
            >
              {t === "ANTENATAL" ? "Antenatal" : "Postnatal"}
            </button>
          ))}
        </div>
        {selectedPatient?.week != null && visitType === "ANTENATAL" && (
          <p className="mt-1.5 font-body text-[11px] text-text-secondary">Gestational age: Week {selectedPatient.week}</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NumberField label="Systolic BP (mmHg)" value={systolic} onChange={setSystolic} placeholder="e.g. 120" />
        <NumberField label="Diastolic BP (mmHg)" value={diastolic} onChange={setDiastolic} placeholder="e.g. 80" />
        <NumberField label="Weight (kg)" value={weight} onChange={setWeight} placeholder="e.g. 68" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <NumberField label="Fetal Heart Rate (bpm)" value={fetalHeartRate} onChange={setFetalHeartRate} placeholder="e.g. 140" />
        <NumberField label="Fundal Height (cm)" value={fundalHeight} onChange={setFundalHeight} placeholder="e.g. 28" />
        <NumberField label="Maternal Temperature (°C)" value={temperature} onChange={setTemperature} placeholder="e.g. 36.8" />
      </div>

      {visitType === "ANTENATAL" && (
        <div className="mt-6 border-t border-border-color pt-5">
          <p className="font-body text-[13px] font-semibold text-text-secondary">Antenatal Follow-Up</p>

          <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SelectField label="Urine Protein" value={urineProt} onChange={setUrineProt} options={URINE_OPTIONS} />
            <SelectField label="Urine Sugar" value={urineSugar} onChange={setUrineSugar} options={URINE_OPTIONS} />
            <div>
              <label className="font-body text-[13px] font-medium text-text-secondary">Oedema</label>
              <div className="mt-1.5 flex h-14 rounded-badge bg-lilac-light p-1">
                {[
                  { value: true, label: "Yes" },
                  { value: false, label: "No" },
                ].map((o) => (
                  <button
                    key={String(o.value)}
                    type="button"
                    onClick={() => setOedema(o.value)}
                    className={cn(
                      "flex-1 rounded-badge text-center font-heading text-sm font-bold",
                      oedema === o.value ? "bg-white text-lilac-deeper shadow-card" : "font-body font-normal text-text-secondary"
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SelectField
              label="Fetal Presentation"
              value={fetalPresentation}
              onChange={setFetalPresentation}
              options={PRESENTATION_OPTIONS}
            />
            <div>
              <label className="font-body text-[13px] font-medium text-text-secondary">Fetal Descent</label>
              <input
                value={fetalDescent}
                onChange={(e) => setFetalDescent(e.target.value)}
                placeholder="e.g. 4/5th"
                className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              />
            </div>
            <NumberField label="IFA Supplied (tablets)" value={ifaSupplied} onChange={setIfaSupplied} placeholder="e.g. 30" />
          </div>

          <div className="mt-4">
            <label className="font-body text-[13px] font-medium text-text-secondary">Complaints</label>
            <textarea
              value={complaints}
              onChange={(e) => setComplaints(e.target.value)}
              rows={2}
              placeholder="Any complaints raised at this visit..."
              className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>
        </div>
      )}

      <div className="mt-5">
        <label className="font-body text-[13px] font-medium text-text-secondary">Clinical Notes</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          placeholder="Add any observations or notes..."
          className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      <div className="mt-5">
        <label className="font-body text-[13px] font-medium text-text-secondary">Date of Next Visit</label>
        <input
          type="date"
          value={nextVisitDate}
          onChange={(e) => setNextVisitDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary lg:max-w-xs"
        />
      </div>

      {error && <p className="mt-4 font-body text-sm text-[#DC2626]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !patientId}
        className="mt-6 h-14 w-full rounded-button bg-lilac-mid px-8 font-heading text-[17px] font-bold text-lilac-deeper disabled:opacity-60 lg:w-auto"
      >
        {submitting ? "Saving…" : "Save Vitals"}
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
      >
        <option value="">Not recorded</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
