"use client";

import { cn } from "@/lib/utils";
import Field from "./Field";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import DateSelectInput from "@/components/ui/DateSelectInput";
import { TrashIcon, PlusIcon } from "@/components/ui/icons";
import {
  MAJOR_RISK_FACTORS,
  EMPTY_PREVIOUS_PREGNANCY,
  PLACE_OF_BIRTH_OPTIONS,
  MODE_OF_DELIVERY_OPTIONS,
  DELIVERY_OUTCOME_OPTIONS,
  CHILD_HEALTH_OPTIONS,
  type PreviousPregnancy,
} from "@/lib/mch-record";

export default function ObstetricHistoryStep({
  abortionsSpontaneous,
  onAbortionsSpontaneousChange,
  abortionsInduced,
  onAbortionsInducedChange,
  riskFactors,
  onRiskFactorsChange,
  riskFactorOther,
  onRiskFactorOtherChange,
  previousPregnancies,
  onPreviousPregnanciesChange,
}: {
  abortionsSpontaneous: string;
  onAbortionsSpontaneousChange: (value: string) => void;
  abortionsInduced: string;
  onAbortionsInducedChange: (value: string) => void;
  riskFactors: string[];
  onRiskFactorsChange: (value: string[]) => void;
  riskFactorOther: string;
  onRiskFactorOtherChange: (value: string) => void;
  previousPregnancies: PreviousPregnancy[];
  onPreviousPregnanciesChange: (value: PreviousPregnancy[]) => void;
}) {
  function toggleRiskFactor(factor: string) {
    onRiskFactorsChange(
      riskFactors.includes(factor) ? riskFactors.filter((f) => f !== factor) : [...riskFactors, factor]
    );
  }

  function updatePregnancy(index: number, patch: Partial<PreviousPregnancy>) {
    onPreviousPregnanciesChange(previousPregnancies.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function removePregnancy(index: number) {
    onPreviousPregnanciesChange(previousPregnancies.filter((_, i) => i !== index));
  }

  return (
    <>
      <div className="flex gap-3 lg:col-span-2">
        <Field label="No. of Abortions — Spontaneous" className="flex-1">
          <Input
            inputSize="lg"
            type="number"
            value={abortionsSpontaneous}
            onChange={(e) => onAbortionsSpontaneousChange(e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="No. of Abortions — Induced" className="flex-1">
          <Input
            inputSize="lg"
            type="number"
            value={abortionsInduced}
            onChange={(e) => onAbortionsInducedChange(e.target.value)}
            placeholder="0"
          />
        </Field>
      </div>

      <Field label="Major Risk Factors" className="lg:col-span-2">
        <div className="flex flex-wrap gap-2">
          {MAJOR_RISK_FACTORS.map((factor) => {
            const active = riskFactors.includes(factor);
            return (
              <button
                key={factor}
                type="button"
                onClick={() => toggleRiskFactor(factor)}
                className={cn(
                  "rounded-badge border-[1.5px] px-3 py-1.5 font-body text-xs font-medium",
                  active ? "border-primary bg-lilac-mid text-lilac-deeper" : "border-border-color bg-white text-text-secondary"
                )}
              >
                {factor}
              </button>
            );
          })}
        </div>
        <input
          value={riskFactorOther}
          onChange={(e) => onRiskFactorOtherChange(e.target.value)}
          placeholder="Other (specify)"
          className="mt-2 h-12 w-full rounded-input border-[1.5px] border-border-color bg-white px-3.5 font-body text-sm text-text-primary outline-none focus:border-primary"
        />
      </Field>

      <div className="lg:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-body text-[13px] font-medium text-text-secondary">Previous Pregnancies</p>
          <button
            type="button"
            onClick={() => onPreviousPregnanciesChange([...previousPregnancies, { ...EMPTY_PREVIOUS_PREGNANCY }])}
            className="flex items-center gap-1 rounded-badge bg-lilac-light px-3 py-1.5 font-body text-xs font-medium text-lilac-deeper"
          >
            <PlusIcon className="size-3.5" />
            Add
          </button>
        </div>

        {previousPregnancies.length === 0 && (
          <p className="font-body text-sm text-text-secondary">None recorded.</p>
        )}

        <div className="flex flex-col gap-3">
          {previousPregnancies.map((preg, i) => (
            <div key={i} className="rounded-card border-[1.5px] border-border-color bg-white p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-heading text-[13px] font-bold text-text-primary">Pregnancy {i + 1}</p>
                <button type="button" onClick={() => removePregnancy(i)} aria-label="Remove">
                  <TrashIcon className="size-4 text-critical" />
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                <Field label="Date of Delivery / Loss">
                  <DateSelectInput
                    size="sm"
                    value={preg.dateOfDeliveryOrLoss}
                    onChange={(v) => updatePregnancy(i, { dateOfDeliveryOrLoss: v })}
                    max={new Date().toISOString().split("T")[0]}
                    aria-label="Date of delivery or loss"
                  />
                </Field>
                <div className="flex gap-2.5">
                  <Field label="Place of Birth" className="flex-1">
                    <Select
                      selectSize="sm"
                      value={preg.placeOfBirth}
                      onChange={(e) => updatePregnancy(i, { placeOfBirth: e.target.value })}
                    >
                      <option value="">Select</option>
                      {PLACE_OF_BIRTH_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Mode of Delivery" className="flex-1">
                    <Select
                      selectSize="sm"
                      value={preg.modeOfDelivery}
                      onChange={(e) => updatePregnancy(i, { modeOfDelivery: e.target.value })}
                    >
                      <option value="">Select</option>
                      {MODE_OF_DELIVERY_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <div className="flex gap-2.5">
                  <Field label="Outcome" className="flex-1">
                    <Select
                      selectSize="sm"
                      value={preg.outcome}
                      onChange={(e) => updatePregnancy(i, { outcome: e.target.value })}
                    >
                      <option value="">Select</option>
                      {DELIVERY_OUTCOME_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Gestational Age" className="flex-1">
                    <input
                      value={preg.gestationalAgeAtBirth}
                      onChange={(e) => updatePregnancy(i, { gestationalAgeAtBirth: e.target.value })}
                      placeholder="e.g. 38 weeks"
                      className="h-10 w-full rounded-md border border-[#E2E8F0] px-2.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </Field>
                </div>
                <Field label="Problems During Pregnancy">
                  <input
                    value={preg.problemsDuringPregnancy}
                    onChange={(e) => updatePregnancy(i, { problemsDuringPregnancy: e.target.value })}
                    placeholder="Optional"
                    className="h-10 w-full rounded-md border border-[#E2E8F0] px-2.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                  />
                </Field>
                <Field label="Labour / Postpartum Complications">
                  <input
                    value={preg.complications}
                    onChange={(e) => updatePregnancy(i, { complications: e.target.value })}
                    placeholder="Optional"
                    className="h-10 w-full rounded-md border border-[#E2E8F0] px-2.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                  />
                </Field>
                <div className="flex gap-2.5">
                  <Field label="Child's Sex" className="flex-1">
                    <Select
                      selectSize="sm"
                      value={preg.childSex}
                      onChange={(e) => updatePregnancy(i, { childSex: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                    </Select>
                  </Field>
                  <Field label="Birth Weight (kg)" className="flex-1">
                    <input
                      type="number"
                      value={preg.birthWeightKg}
                      onChange={(e) => updatePregnancy(i, { birthWeightKg: e.target.value })}
                      placeholder="e.g. 3.2"
                      className="h-10 w-full rounded-md border border-[#E2E8F0] px-2.5 font-body text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </Field>
                </div>
                <Field label="Child's Present Health">
                  <Select
                    selectSize="sm"
                    value={preg.childPresentHealth}
                    onChange={(e) => updatePregnancy(i, { childPresentHealth: e.target.value })}
                  >
                    <option value="">Select</option>
                    {CHILD_HEALTH_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
