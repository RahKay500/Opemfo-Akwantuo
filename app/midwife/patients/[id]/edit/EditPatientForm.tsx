"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import DateSelectInput from "@/components/ui/DateSelectInput";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import GhanaCardInput from "@/components/ui/GhanaCardInput";
import { calculateEdd, calculateEffectiveLmpFromScan } from "@/lib/pregnancy";
import { digitsOnly, lettersOnly } from "@/lib/utils";
import Field from "@/components/forms/patient-intake/Field";
import ObstetricHistoryStep from "@/components/forms/patient-intake/ObstetricHistoryStep";
import InvestigationsStep, { type InvestigationsValue } from "@/components/forms/patient-intake/InvestigationsStep";
import HealthHistoryStep from "@/components/forms/patient-intake/HealthHistoryStep";
import PhysicalExamStep from "@/components/forms/patient-intake/PhysicalExamStep";
import type {
  MedicalHistoryState,
  SocialHistoryState,
  FamilyHistoryState,
  PhysicalExamState,
  PreviousPregnancy,
} from "@/lib/mch-record";

const STEPS = ["Personal", "Family", "Pregnancy", "Obstetric", "Labs", "History", "Exam", "Emergency"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const RELATIONS = ["Husband", "Mother", "Sister", "Father", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed", "Other"];
const EDUCATIONAL_LEVELS = ["None", "Primary", "JHS", "SHS", "Tertiary"];

export interface EditPatientInitial {
  name: string;
  dateOfBirth: string;
  phone: string;
  ghanaCardId: string;
  community: string;
  nhisNumber: string;
  maritalStatus: string;
  educationalLevel: string;
  occupation: string;
  spouseName: string;
  spousePhone: string;
  spouseOccupation: string;
  emergencyTransportPhone: string;
  datingMethod: "LMP" | "ULTRASOUND";
  lmp: string;
  scanDate: string;
  scanWeeks: string;
  scanDays: string;
  gravida: string;
  para: string;
  bloodGroup: string;
  knownConditions: string;
  abortionsSpontaneous: string;
  abortionsInduced: string;
  riskFactors: string[];
  riskFactorOther: string;
  previousPregnancies: PreviousPregnancy[];
  investigations: InvestigationsValue;
  medicalHistory: MedicalHistoryState;
  socialHistory: SocialHistoryState;
  familyHistory: FamilyHistoryState;
  physicalExam: PhysicalExamState;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export default function EditPatientForm({
  patientId,
  facilityName,
  initial,
}: {
  patientId: string;
  facilityName: string;
  initial: EditPatientInitial;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(initial.name);
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth);
  const [phone, setPhone] = useState(initial.phone);
  const [ghanaCardId, setGhanaCardId] = useState(initial.ghanaCardId);

  const [community, setCommunity] = useState(initial.community);
  const [nhisNumber, setNhisNumber] = useState(initial.nhisNumber);
  const [maritalStatus, setMaritalStatus] = useState(initial.maritalStatus);
  const [educationalLevel, setEducationalLevel] = useState(initial.educationalLevel);
  const [occupation, setOccupation] = useState(initial.occupation);
  const [spouseName, setSpouseName] = useState(initial.spouseName);
  const [spousePhone, setSpousePhone] = useState(initial.spousePhone);
  const [spouseOccupation, setSpouseOccupation] = useState(initial.spouseOccupation);
  const [emergencyTransportPhone, setEmergencyTransportPhone] = useState(initial.emergencyTransportPhone);

  const [datingMethod, setDatingMethod] = useState<"LMP" | "ULTRASOUND">(initial.datingMethod);
  const [lmp, setLmp] = useState(initial.lmp);
  const [scanDate, setScanDate] = useState(initial.scanDate);
  const [scanWeeks, setScanWeeks] = useState(initial.scanWeeks);
  const [scanDays, setScanDays] = useState(initial.scanDays);
  const [gravida, setGravida] = useState(initial.gravida);
  const [para, setPara] = useState(initial.para);
  const [bloodGroup, setBloodGroup] = useState(initial.bloodGroup);
  const [knownConditions, setKnownConditions] = useState(initial.knownConditions);

  const [abortionsSpontaneous, setAbortionsSpontaneous] = useState(initial.abortionsSpontaneous);
  const [abortionsInduced, setAbortionsInduced] = useState(initial.abortionsInduced);
  const [riskFactors, setRiskFactors] = useState<string[]>(initial.riskFactors);
  const [riskFactorOther, setRiskFactorOther] = useState(initial.riskFactorOther);
  const [previousPregnancies, setPreviousPregnancies] = useState<PreviousPregnancy[]>(initial.previousPregnancies);

  const [investigations, setInvestigations] = useState<InvestigationsValue>(initial.investigations);

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryState>(initial.medicalHistory);
  const [socialHistory, setSocialHistory] = useState<SocialHistoryState>(initial.socialHistory);
  const [familyHistory, setFamilyHistory] = useState<FamilyHistoryState>(initial.familyHistory);

  const [physicalExam, setPhysicalExam] = useState<PhysicalExamState>(initial.physicalExam);

  const [emergencyContactName, setEmergencyContactName] = useState(initial.emergencyContactName);
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initial.emergencyContactPhone);
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(initial.emergencyContactRelation);

  const effectiveLmp =
    datingMethod === "ULTRASOUND" && scanDate
      ? calculateEffectiveLmpFromScan(new Date(scanDate), Number(scanWeeks) || 0, Number(scanDays) || 0)
      : lmp
        ? new Date(lmp)
        : null;
  const edd = effectiveLmp ? calculateEdd(effectiveLmp) : null;

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
      const bmiAtAnc1 =
        investigations.height && investigations.weightAtAnc1
          ? Number(investigations.weightAtAnc1) / (Number(investigations.height) / 100) ** 2
          : undefined;
      const majorRiskFactors = [...riskFactors, ...(riskFactorOther.trim() ? [riskFactorOther.trim()] : [])];

      const res = await fetch(`/api/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          dateOfBirth,
          phone: phone.trim(),
          ghanaCardId: ghanaCardId.trim() || undefined,
          community: community.trim() || undefined,
          nhisNumber: nhisNumber.trim() || undefined,
          maritalStatus: maritalStatus || undefined,
          educationalLevel: educationalLevel || undefined,
          occupation: occupation.trim() || undefined,
          spouseName: spouseName.trim() || undefined,
          spousePhone: spousePhone.trim() || undefined,
          spouseOccupation: spouseOccupation.trim() || undefined,
          emergencyTransportPhone: emergencyTransportPhone.trim() || undefined,
          lmp: lmp || undefined,
          datingMethod,
          scanDate: datingMethod === "ULTRASOUND" ? scanDate || undefined : undefined,
          gestationalAgeAtScanWeeks: datingMethod === "ULTRASOUND" ? Number(scanWeeks) || 0 : undefined,
          gestationalAgeAtScanDays: datingMethod === "ULTRASOUND" ? Number(scanDays) || 0 : undefined,
          gravida: gravida ? Number(gravida) : undefined,
          para: para ? Number(para) : undefined,
          bloodGroup: bloodGroup || undefined,
          knownConditions: knownConditions.trim() || undefined,
          numberOfAbortionsSpontaneous: abortionsSpontaneous ? Number(abortionsSpontaneous) : undefined,
          numberOfAbortionsInduced: abortionsInduced ? Number(abortionsInduced) : undefined,
          majorRiskFactors,
          previousPregnancies: previousPregnancies.length ? previousPregnancies : undefined,
          height: investigations.height ? Number(investigations.height) : undefined,
          weightAtAnc1: investigations.weightAtAnc1 ? Number(investigations.weightAtAnc1) : undefined,
          bmiAtAnc1,
          estimatedDesiredWeightAtEdd: investigations.estimatedDesiredWeightAtEdd.trim() || undefined,
          contraceptionUsed: investigations.contraceptionUsed.trim() || undefined,
          rhTyping: investigations.rhTyping || undefined,
          hbsAg: investigations.hbsAg || undefined,
          sickling: investigations.sickling || undefined,
          g6pd: investigations.g6pd || undefined,
          vdrl: investigations.vdrl || undefined,
          hivStatus: investigations.hivStatus.trim() || undefined,
          hbFirstVisit: investigations.hbFirstVisit ? Number(investigations.hbFirstVisit) : undefined,
          urineRE: investigations.urineRE.trim() || undefined,
          stoolRE: investigations.stoolRE.trim() || undefined,
          bfForMalaria: investigations.bfForMalaria || undefined,
          medicalHistory,
          socialHistory,
          familyHistory,
          physicalExamAtFirstVisit: physicalExam,
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
      router.push(`/midwife/patients/${patientId}`);
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
        <h2 className="hidden font-heading text-lg font-bold text-text-primary lg:block">Edit Patient Details</h2>

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
                <Select selectSize="lg" value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
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

        {step === 2 && (
          <>
            <Field label="Pregnancy Dating Method" className="lg:col-span-2">
              <div className="flex gap-1 rounded-input border-[1.5px] border-border-color bg-white p-1">
                {(["LMP", "ULTRASOUND"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setDatingMethod(method)}
                    className={cn(
                      "h-10 flex-1 rounded-badge font-body text-[13px] font-medium",
                      datingMethod === method ? "bg-lilac-mid text-lilac-deeper" : "text-text-secondary"
                    )}
                  >
                    {method === "LMP" ? "Last Menstrual Period" : "Ultrasound Scan"}
                  </button>
                ))}
              </div>
            </Field>

            {datingMethod === "LMP" ? (
              <Field label="Last Menstrual Period (LMP) — optional">
                <DateSelectInput
                  value={lmp}
                  onChange={setLmp}
                  max={new Date().toISOString().split("T")[0]}
                  aria-label="Last Menstrual Period"
                />
              </Field>
            ) : (
              <Field label="Scan Date">
                <DateSelectInput
                  value={scanDate}
                  onChange={setScanDate}
                  max={new Date().toISOString().split("T")[0]}
                  aria-label="Scan Date"
                />
              </Field>
            )}
            <Field label="Estimated Due Date (EDD)">
              <div className="flex h-14 w-full items-center rounded-input border-[1.5px] border-lilac-light bg-lilac-light px-[17.5px] font-body text-[15px] text-lilac-deeper">
                {edd ? edd.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" }) : "Enter LMP to calculate"}
              </div>
            </Field>
            {datingMethod === "ULTRASOUND" && (
              <div className="flex gap-3 lg:col-span-2">
                <Field label="Gestational Age — Weeks" className="flex-1">
                  <Input
                    inputSize="lg"
                    type="number"
                    value={scanWeeks}
                    onChange={(e) => setScanWeeks(e.target.value)}
                    placeholder="e.g. 12"
                  />
                </Field>
                <Field label="Gestational Age — Days" className="flex-1">
                  <Input
                    inputSize="lg"
                    type="number"
                    value={scanDays}
                    onChange={(e) => setScanDays(e.target.value)}
                    placeholder="e.g. 3"
                  />
                </Field>
              </div>
            )}
            <div className="flex gap-3 lg:col-span-2">
              <Field label="Gravida" className="flex-1">
                <Input inputSize="lg" type="number" value={gravida} onChange={(e) => setGravida(e.target.value)} placeholder="e.g. 2" />
              </Field>
              <Field label="Para" className="flex-1">
                <Input inputSize="lg" type="number" value={para} onChange={(e) => setPara(e.target.value)} placeholder="e.g. 1" />
              </Field>
            </div>
            <Field label="Blood Group">
              <Select selectSize="lg" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Known Conditions" className="lg:col-span-2">
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

        {step === 3 && (
          <ObstetricHistoryStep
            abortionsSpontaneous={abortionsSpontaneous}
            onAbortionsSpontaneousChange={setAbortionsSpontaneous}
            abortionsInduced={abortionsInduced}
            onAbortionsInducedChange={setAbortionsInduced}
            riskFactors={riskFactors}
            onRiskFactorsChange={setRiskFactors}
            riskFactorOther={riskFactorOther}
            onRiskFactorOtherChange={setRiskFactorOther}
            previousPregnancies={previousPregnancies}
            onPreviousPregnanciesChange={setPreviousPregnancies}
          />
        )}

        {step === 4 && <InvestigationsStep value={investigations} onChange={setInvestigations} />}

        {step === 5 && (
          <HealthHistoryStep
            medicalHistory={medicalHistory}
            onMedicalHistoryChange={setMedicalHistory}
            socialHistory={socialHistory}
            onSocialHistoryChange={setSocialHistory}
            familyHistory={familyHistory}
            onFamilyHistoryChange={setFamilyHistory}
          />
        )}

        {step === 6 && <PhysicalExamStep value={physicalExam} onChange={setPhysicalExam} />}

        {step === 7 && (
          <>
            <Field label="Emergency Contact Name">
              <Input
                inputSize="lg"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(lettersOnly(e.target.value))}
                placeholder="Enter full name"
              />
            </Field>
            <Field label="Emergency Contact Phone">
              <Input
                inputSize="lg"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(digitsOnly(e.target.value))}
                placeholder="024 123 4567"
                inputMode="numeric"
              />
            </Field>
            <Field label="Relationship">
              <Select selectSize="lg" value={emergencyContactRelation} onChange={(e) => setEmergencyContactRelation(e.target.value)}>
                <option value="">Select relationship</option>
                {RELATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
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
              {submitting ? "Saving…" : "Save Changes"}
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
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
