"use client";

import Field from "./Field";
import YesNoRow from "./YesNoRow";
import {
  MEDICAL_HISTORY_ITEMS,
  FAMILY_HISTORY_ITEMS,
  type MedicalHistoryState,
  type SocialHistoryState,
  type FamilyHistoryState,
} from "@/lib/mch-record";

// Medical & Surgical History, Social Risk Factors, and Family History —
// grouped into one step since all three are the same "history" moment in
// the paper record book (page 5-6), each just a short checklist.
export default function HealthHistoryStep({
  medicalHistory,
  onMedicalHistoryChange,
  socialHistory,
  onSocialHistoryChange,
  familyHistory,
  onFamilyHistoryChange,
}: {
  medicalHistory: MedicalHistoryState;
  onMedicalHistoryChange: (value: MedicalHistoryState) => void;
  socialHistory: SocialHistoryState;
  onSocialHistoryChange: (value: SocialHistoryState) => void;
  familyHistory: FamilyHistoryState;
  onFamilyHistoryChange: (value: FamilyHistoryState) => void;
}) {
  return (
    <>
      <Field label="Medical & Surgical History" className="lg:col-span-2">
        <div className="rounded-input border-[1.5px] border-border-color bg-white px-4">
          {MEDICAL_HISTORY_ITEMS.map((item) => (
            <YesNoRow
              key={item.key}
              label={item.label}
              checked={medicalHistory[item.key]}
              onChange={(v) => onMedicalHistoryChange({ ...medicalHistory, [item.key]: v })}
            />
          ))}
          <YesNoRow
            label="Allergies (Drug/Food)"
            checked={medicalHistory.allergiesDrugFood}
            onChange={(v) => onMedicalHistoryChange({ ...medicalHistory, allergiesDrugFood: v })}
            detail={medicalHistory.allergiesDrugFoodDetail}
            onDetailChange={(v) => onMedicalHistoryChange({ ...medicalHistory, allergiesDrugFoodDetail: v })}
          />
          <YesNoRow
            label="Medication history"
            checked={medicalHistory.medicationHistory}
            onChange={(v) => onMedicalHistoryChange({ ...medicalHistory, medicationHistory: v })}
            detail={medicalHistory.medicationHistoryDetail}
            onDetailChange={(v) => onMedicalHistoryChange({ ...medicalHistory, medicationHistoryDetail: v })}
          />
        </div>
      </Field>

      <Field label="Previous Surgery">
        <input
          value={medicalHistory.previousSurgery}
          onChange={(e) => onMedicalHistoryChange({ ...medicalHistory, previousSurgery: e.target.value })}
          placeholder="e.g. Nil"
          className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </Field>
      <Field label="Other Medical History">
        <input
          value={medicalHistory.other}
          onChange={(e) => onMedicalHistoryChange({ ...medicalHistory, other: e.target.value })}
          placeholder="Optional"
          className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </Field>

      <Field label="Social Risk Factors" className="lg:col-span-2">
        <div className="rounded-input border-[1.5px] border-border-color bg-white px-4">
          <YesNoRow
            label="Alcohol"
            checked={socialHistory.alcohol}
            onChange={(v) => onSocialHistoryChange({ ...socialHistory, alcohol: v })}
            detail={socialHistory.alcoholDetail}
            onDetailChange={(v) => onSocialHistoryChange({ ...socialHistory, alcoholDetail: v })}
          />
          <YesNoRow
            label="Smoking"
            checked={socialHistory.smoking}
            onChange={(v) => onSocialHistoryChange({ ...socialHistory, smoking: v })}
            detail={socialHistory.smokingDetail}
            onDetailChange={(v) => onSocialHistoryChange({ ...socialHistory, smokingDetail: v })}
          />
        </div>
      </Field>

      <Field label="Family History" className="lg:col-span-2">
        <div className="rounded-input border-[1.5px] border-border-color bg-white px-4">
          {FAMILY_HISTORY_ITEMS.map((item) => (
            <YesNoRow
              key={item.key}
              label={item.label}
              checked={familyHistory[item.key]}
              onChange={(v) => onFamilyHistoryChange({ ...familyHistory, [item.key]: v })}
            />
          ))}
        </div>
      </Field>
      <Field label="Other Family History" className="lg:col-span-2">
        <input
          value={familyHistory.other}
          onChange={(e) => onFamilyHistoryChange({ ...familyHistory, other: e.target.value })}
          placeholder="e.g. husband's mumps"
          className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
        />
      </Field>
    </>
  );
}
