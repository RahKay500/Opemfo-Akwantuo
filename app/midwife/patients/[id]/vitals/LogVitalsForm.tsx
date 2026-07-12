"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LogVitalsForm({
  patientId,
  week,
  daysPostpartum,
}: {
  patientId: string;
  week: number | null;
  daysPostpartum: number | null;
}) {
  const router = useRouter();
  const [visitType, setVisitType] = useState<"ANTENATAL" | "POSTNATAL">("ANTENATAL");
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [fetalHeartRate, setFetalHeartRate] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [fundalHeight, setFundalHeight] = useState("");
  const [observations, setObservations] = useState("");
  const [nextVisitDate, setNextVisitDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
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
          fetalHeartRate: fetalHeartRate ? Number(fetalHeartRate) : undefined,
          temperature: temperature ? Number(temperature) : undefined,
          weight: weight ? Number(weight) : undefined,
          fundalHeight: fundalHeight ? Number(fundalHeight) : undefined,
          observations: observations.trim() || undefined,
          nextVisitDate: nextVisitDate || undefined,
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
    <div className="flex flex-col gap-5 px-6 pb-10 pt-5">
      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Visit type</label>
        <div className="mt-2 flex rounded-badge bg-lilac-light p-1">
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
      </div>

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Blood pressure</label>
        <div className="mt-1.5 flex gap-3">
          <div className="flex-1">
            <p className="mb-1 font-body text-[11px] text-text-secondary">Systolic (mmHg)</p>
            <input
              type="number"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              placeholder="e.g. 120"
              className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>
          <div className="flex-1">
            <p className="mb-1 font-body text-[11px] text-text-secondary">Diastolic (mmHg)</p>
            <input
              type="number"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              placeholder="e.g. 80"
              className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <NumberField label="Fetal Heart Rate" unit="bpm" value={fetalHeartRate} onChange={setFetalHeartRate} placeholder="e.g. 142" />
      <NumberField label="Maternal Temperature" unit="°C" value={temperature} onChange={setTemperature} placeholder="e.g. 36.8" />
      <NumberField label="Weight" unit="kg" value={weight} onChange={setWeight} placeholder="e.g. 68" />
      <NumberField label="Fundal Height" unit="cm" value={fundalHeight} onChange={setFundalHeight} placeholder="e.g. 33" />

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">
          {visitType === "ANTENATAL" ? "Gestational Age at Visit" : "Days Postpartum"}
        </label>
        <div className="mt-1.5 flex h-14 w-full items-center rounded-input border-[1.5px] border-lilac-light bg-lilac-light px-[17.5px] font-body text-[15px] text-lilac-deeper">
          {visitType === "ANTENATAL"
            ? week != null
              ? `Week ${week}`
              : "No LMP on file"
            : daysPostpartum != null
              ? `Day ${daysPostpartum}`
              : "No delivery date on file"}
        </div>
      </div>

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Observations / Notes</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          placeholder="Any additional clinical observations..."
          className="mt-1.5 w-full resize-none rounded-input border-[1.5px] border-border-color bg-white p-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="font-body text-[13px] font-medium text-text-secondary">Date of Next Visit</label>
        <input
          type="date"
          value={nextVisitDate}
          onChange={(e) => setNextVisitDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="mt-1.5 h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
        <p className="mt-1.5 font-body text-[11px] text-text-secondary">
          Sets when this patient should return — shown on her dashboard.
        </p>
      </div>

      {error && <p className="font-body text-sm text-[#DC2626]">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="h-14 w-full rounded-card bg-primary font-heading text-[17px] font-bold text-white disabled:opacity-60"
      >
        {submitting ? "Saving…" : "Save Visit"}
      </button>
    </div>
  );
}

function NumberField({
  label,
  unit,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="font-body text-[13px] font-medium text-text-secondary">{label}</label>
      <div className="relative mt-1.5">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] pr-14 font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-body text-[13px] text-text-secondary">
          {unit}
        </span>
      </div>
    </div>
  );
}
