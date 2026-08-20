"use client";

import Field from "./Field";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { POSITIVE_NEGATIVE_OPTIONS, G6PD_OPTIONS, SICKLING_OPTIONS } from "@/lib/mch-record";

export interface InvestigationsValue {
  height: string;
  weightAtAnc1: string;
  estimatedDesiredWeightAtEdd: string;
  contraceptionUsed: string;
  rhTyping: string;
  hbsAg: string;
  sickling: string;
  g6pd: string;
  vdrl: string;
  hivStatus: string;
  hbFirstVisit: string;
  urineRE: string;
  stoolRE: string;
  bfForMalaria: string;
}

// Blood Group already has its own field/step (Pregnancy) — every other
// result here is a one-time snapshot taken at the first ANC visit, so
// there's no per-test date to capture, just the result.
export default function InvestigationsStep({
  value,
  onChange,
}: {
  value: InvestigationsValue;
  onChange: (value: InvestigationsValue) => void;
}) {
  const bmi =
    value.height && value.weightAtAnc1
      ? (Number(value.weightAtAnc1) / (Number(value.height) / 100) ** 2).toFixed(1)
      : null;

  function set<K extends keyof InvestigationsValue>(key: K, v: InvestigationsValue[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <>
      <div className="flex gap-3 lg:col-span-2">
        <Field label="Height (cm)" className="flex-1">
          <Input inputSize="lg" type="number" value={value.height} onChange={(e) => set("height", e.target.value)} placeholder="e.g. 161" />
        </Field>
        <Field label="Weight at ANC1 (kg)" className="flex-1">
          <Input
            inputSize="lg"
            type="number"
            value={value.weightAtAnc1}
            onChange={(e) => set("weightAtAnc1", e.target.value)}
            placeholder="e.g. 62"
          />
        </Field>
      </div>
      <Field label="BMI at ANC1">
        <div className="flex h-14 w-full items-center rounded-input border-[1.5px] border-lilac-light bg-lilac-light px-[17.5px] font-body text-[15px] text-lilac-deeper">
          {bmi ?? "Enter height and weight to calculate"}
        </div>
      </Field>
      <Field label="Estimated Desired Weight at EDD">
        <Input
          inputSize="lg"
          value={value.estimatedDesiredWeightAtEdd}
          onChange={(e) => set("estimatedDesiredWeightAtEdd", e.target.value)}
          placeholder="e.g. 66.5-71kg"
        />
      </Field>
      <Field label="Contraception Used Before This Pregnancy" className="lg:col-span-2">
        <Input
          inputSize="lg"
          value={value.contraceptionUsed}
          onChange={(e) => set("contraceptionUsed", e.target.value)}
          placeholder="Optional"
        />
      </Field>

      <div className="flex gap-3 lg:col-span-2">
        <Field label="Rh Typing" className="flex-1">
          <Select selectSize="lg" value={value.rhTyping} onChange={(e) => set("rhTyping", e.target.value)}>
            <option value="">Not tested</option>
            {POSITIVE_NEGATIVE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="HBsAg" className="flex-1">
          <Select selectSize="lg" value={value.hbsAg} onChange={(e) => set("hbsAg", e.target.value)}>
            <option value="">Not tested</option>
            {POSITIVE_NEGATIVE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex gap-3 lg:col-span-2">
        <Field label="Sickling" className="flex-1">
          <Select selectSize="lg" value={value.sickling} onChange={(e) => set("sickling", e.target.value)}>
            <option value="">Not tested</option>
            {SICKLING_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="G6PD" className="flex-1">
          <Select selectSize="lg" value={value.g6pd} onChange={(e) => set("g6pd", e.target.value)}>
            <option value="">Not tested</option>
            {G6PD_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex gap-3 lg:col-span-2">
        <Field label="VDRL/Syphilis" className="flex-1">
          <Select selectSize="lg" value={value.vdrl} onChange={(e) => set("vdrl", e.target.value)}>
            <option value="">Not tested</option>
            {POSITIVE_NEGATIVE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="BF for Malaria" className="flex-1">
          <Select selectSize="lg" value={value.bfForMalaria} onChange={(e) => set("bfForMalaria", e.target.value)}>
            <option value="">Not tested</option>
            {POSITIVE_NEGATIVE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="HIV Antibody">
        <Input inputSize="lg" value={value.hivStatus} onChange={(e) => set("hivStatus", e.target.value)} placeholder="Result" />
      </Field>
      <Field label="Hb — First Visit (g/dl)">
        <Input
          inputSize="lg"
          type="number"
          value={value.hbFirstVisit}
          onChange={(e) => set("hbFirstVisit", e.target.value)}
          placeholder="e.g. 12.2"
        />
      </Field>

      <Field label="Urine RE">
        <Input inputSize="lg" value={value.urineRE} onChange={(e) => set("urineRE", e.target.value)} placeholder="e.g. Nil" />
      </Field>
      <Field label="Stool RE">
        <Input inputSize="lg" value={value.stoolRE} onChange={(e) => set("stoolRE", e.target.value)} placeholder="e.g. NAD" />
      </Field>
    </>
  );
}
