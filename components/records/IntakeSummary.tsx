"use client";

import {
  MEDICAL_HISTORY_ITEMS,
  FAMILY_HISTORY_ITEMS,
  PHYSICAL_EXAM_AREAS,
  type MedicalHistoryState,
  type SocialHistoryState,
  type FamilyHistoryState,
  type PhysicalExamState,
  type PreviousPregnancy,
} from "@/lib/mch-record";

export interface IntakeSummaryData {
  numberOfAbortionsSpontaneous: number | null;
  numberOfAbortionsInduced: number | null;
  majorRiskFactors: string[];
  previousPregnancies: PreviousPregnancy[];
  height: number | null;
  weightAtAnc1: number | null;
  bmiAtAnc1: number | null;
  estimatedDesiredWeightAtEdd: string | null;
  contraceptionUsed: string | null;
  rhTyping: string | null;
  hbsAg: string | null;
  sickling: string | null;
  g6pd: string | null;
  vdrl: string | null;
  hivStatus: string | null;
  hbFirstVisit: number | null;
  urineRE: string | null;
  stoolRE: string | null;
  bfForMalaria: string | null;
  medicalHistory: Partial<MedicalHistoryState> | null;
  socialHistory: Partial<SocialHistoryState> | null;
  familyHistory: Partial<FamilyHistoryState> | null;
  physicalExamAtFirstVisit: Partial<PhysicalExamState> | null;
}

function medicalDetail(mh: Partial<MedicalHistoryState> | null, key: string): string | null {
  if (key === "allergiesDrugFood") return mh?.allergiesDrugFoodDetail || null;
  if (key === "medicationHistory") return mh?.medicationHistoryDetail || null;
  return null;
}

// Read-only view of the first-visit intake (Obstetric History, Investigations,
// Medical/Social/Family History, Physical Exam) captured at registration —
// see components/forms/patient-intake/ for the form that collects this.
// Deliberately shows only what's positive/abnormal/recorded, not a full
// checklist replica — a doctor scanning a shared chart needs the flags
// (diabetic, HIV, mental illness, etc.), not a wall of "No"s.
export default function IntakeSummary({ data }: { data: IntakeSummaryData }) {
  const medicalPositives = MEDICAL_HISTORY_ITEMS.filter((i) => data.medicalHistory?.[i.key]);
  const familyPositives = FAMILY_HISTORY_ITEMS.filter((i) => data.familyHistory?.[i.key]);
  const examAbnormal = PHYSICAL_EXAM_AREAS.filter((a) => data.physicalExamAtFirstVisit?.[a.key]?.normal === false);
  const hasSocialRisk = Boolean(data.socialHistory?.alcohol || data.socialHistory?.smoking);

  const investigations = [
    data.height ? { label: "Height", value: `${data.height} cm` } : null,
    data.weightAtAnc1 ? { label: "Weight at ANC1", value: `${data.weightAtAnc1} kg` } : null,
    data.bmiAtAnc1 ? { label: "BMI at ANC1", value: data.bmiAtAnc1.toFixed(1) } : null,
    data.estimatedDesiredWeightAtEdd ? { label: "Desired Weight at EDD", value: data.estimatedDesiredWeightAtEdd } : null,
    data.contraceptionUsed ? { label: "Contraception Used", value: data.contraceptionUsed } : null,
    data.rhTyping ? { label: "Rh Typing", value: data.rhTyping } : null,
    data.hbsAg ? { label: "HBsAg", value: data.hbsAg } : null,
    data.sickling ? { label: "Sickling", value: data.sickling } : null,
    data.g6pd ? { label: "G6PD", value: data.g6pd } : null,
    data.vdrl ? { label: "VDRL/Syphilis", value: data.vdrl } : null,
    data.hivStatus ? { label: "HIV Antibody", value: data.hivStatus } : null,
    data.hbFirstVisit ? { label: "Hb (First Visit)", value: `${data.hbFirstVisit} g/dl` } : null,
    data.urineRE ? { label: "Urine RE", value: data.urineRE } : null,
    data.stoolRE ? { label: "Stool RE", value: data.stoolRE } : null,
    data.bfForMalaria ? { label: "BF for Malaria", value: data.bfForMalaria } : null,
  ].filter((x): x is { label: string; value: string } => x !== null);

  const hasObstetric =
    (data.numberOfAbortionsSpontaneous ?? 0) > 0 ||
    (data.numberOfAbortionsInduced ?? 0) > 0 ||
    data.majorRiskFactors.length > 0 ||
    data.previousPregnancies.length > 0;

  const nothingRecorded =
    investigations.length === 0 &&
    !hasObstetric &&
    medicalPositives.length === 0 &&
    familyPositives.length === 0 &&
    examAbnormal.length === 0 &&
    !hasSocialRisk &&
    !data.medicalHistory?.previousSurgery &&
    !data.medicalHistory?.other &&
    !data.familyHistory?.other;

  if (nothingRecorded) {
    return <p className="font-body text-sm text-text-secondary">No first-visit intake recorded yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {(medicalPositives.length > 0 || familyPositives.length > 0 || hasSocialRisk) && (
        <div className="rounded-card border-l-4 border-critical bg-critical-bg p-4">
          <p className="font-body text-xs font-medium text-critical">Flagged in History</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {medicalPositives.map((i) => {
              const detail = medicalDetail(data.medicalHistory, i.key);
              return (
                <p key={i.key} className="font-body text-[13px] text-text-primary">
                  {i.label}
                  {detail ? ` — ${detail}` : ""}
                </p>
              );
            })}
            {data.socialHistory?.alcohol && (
              <p className="font-body text-[13px] text-text-primary">
                Alcohol{data.socialHistory.alcoholDetail ? ` — ${data.socialHistory.alcoholDetail}` : ""}
              </p>
            )}
            {data.socialHistory?.smoking && (
              <p className="font-body text-[13px] text-text-primary">
                Smoking{data.socialHistory.smokingDetail ? ` — ${data.socialHistory.smokingDetail}` : ""}
              </p>
            )}
            {familyPositives.map((i) => (
              <p key={`fam-${i.key}`} className="font-body text-[13px] text-text-secondary">
                Family history: {i.label}
              </p>
            ))}
            {data.medicalHistory?.other && (
              <p className="font-body text-[13px] text-text-secondary">Other: {data.medicalHistory.other}</p>
            )}
            {data.familyHistory?.other && (
              <p className="font-body text-[13px] text-text-secondary">Family — Other: {data.familyHistory.other}</p>
            )}
          </div>
        </div>
      )}

      {data.medicalHistory?.previousSurgery && (
        <div className="rounded-card bg-white p-4 border border-border-color">
          <p className="font-body text-[11px] text-text-secondary">Previous Surgery</p>
          <p className="mt-0.5 font-body text-[13px] font-medium text-text-primary">{data.medicalHistory.previousSurgery}</p>
        </div>
      )}

      {examAbnormal.length > 0 && (
        <div className="rounded-card bg-white p-4 border border-border-color">
          <p className="font-heading text-[13px] font-bold text-text-primary">Physical Exam — Abnormal Findings</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {examAbnormal.map((a) => (
              <p key={a.key} className="font-body text-[13px] text-text-secondary">
                {a.label}
                {data.physicalExamAtFirstVisit?.[a.key]?.note ? `: ${data.physicalExamAtFirstVisit[a.key]!.note}` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

      {hasObstetric && (
        <div className="rounded-card bg-white p-4 border border-border-color">
          <p className="font-heading text-[13px] font-bold text-text-primary">Obstetric History</p>
          {((data.numberOfAbortionsSpontaneous ?? 0) > 0 || (data.numberOfAbortionsInduced ?? 0) > 0) && (
            <p className="mt-2 font-body text-[13px] text-text-secondary">
              Abortions: {data.numberOfAbortionsSpontaneous ?? 0} spontaneous, {data.numberOfAbortionsInduced ?? 0} induced
            </p>
          )}
          {data.majorRiskFactors.length > 0 && (
            <p className="mt-2 font-body text-[13px] text-text-secondary">Risk factors: {data.majorRiskFactors.join(", ")}</p>
          )}
          {data.previousPregnancies.map((p, i) => (
            <div key={i} className="mt-2 border-t border-border-color pt-2">
              <p className="font-body text-[13px] font-medium text-text-primary">Pregnancy {i + 1}</p>
              <p className="mt-0.5 font-body text-xs text-text-secondary">
                {[p.dateOfDeliveryOrLoss, p.placeOfBirth, p.modeOfDelivery, p.outcome].filter(Boolean).join(" · ")}
              </p>
              {(p.problemsDuringPregnancy || p.complications) && (
                <p className="mt-0.5 font-body text-xs text-text-secondary">
                  {[p.problemsDuringPregnancy, p.complications].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {investigations.length > 0 && (
        <div className="rounded-card bg-white p-4 border border-border-color">
          <p className="font-heading text-[13px] font-bold text-text-primary">Investigations</p>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
            {investigations.map((inv) => (
              <div key={inv.label}>
                <p className="font-body text-[11px] text-text-secondary">{inv.label}</p>
                <p className="font-body text-[13px] font-medium text-text-primary">{inv.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
