import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getMidwifePatientDetail } from "@/lib/queries/midwife-patient-detail";
import { gestationalAgeAtScan } from "@/lib/pregnancy";
import { ArrowLeftIcon } from "@/components/ui/icons";
import {
  EMPTY_MEDICAL_HISTORY,
  EMPTY_SOCIAL_HISTORY,
  EMPTY_FAMILY_HISTORY,
  EMPTY_PHYSICAL_EXAM,
  MAJOR_RISK_FACTORS,
  type MedicalHistoryState,
  type SocialHistoryState,
  type FamilyHistoryState,
  type PhysicalExamState,
  type PreviousPregnancy,
} from "@/lib/mch-record";
import EditPatientForm from "./EditPatientForm";

// Older patient records predate this intake data entirely (stored JSON is
// null), and even newer ones could predate a since-added key within it —
// merging onto the empty shape keeps every known key present either way.
function mergeJson<T extends object>(stored: unknown, empty: T): T {
  return stored && typeof stored === "object" ? { ...empty, ...(stored as Partial<T>) } : empty;
}

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "MIDWIFE" || !user.facilityId) redirect("/login");

  const { id } = await params;
  const [detail, facility] = await Promise.all([
    getMidwifePatientDetail(id, user.facilityId),
    prisma.facility.findUnique({ where: { id: user.facilityId } }),
  ]);
  if (!detail) notFound();

  const { patient } = detail;

  // scanWeeks/scanDays aren't stored — only scanDate + the back-calculated
  // effective lmp are — so reconstruct them for the form's initial values.
  const scanAge =
    patient.datingMethod === "ULTRASOUND" && patient.scanDate && patient.lmp
      ? gestationalAgeAtScan(patient.scanDate, patient.lmp)
      : null;

  // Split the flat majorRiskFactors list back into the fixed checklist
  // (matching MAJOR_RISK_FACTORS) vs. free-text "Other" entries, since the
  // form edits those as two separate controls.
  const storedRiskFactors = patient.majorRiskFactors ?? [];
  const riskFactors = storedRiskFactors.filter((f) => MAJOR_RISK_FACTORS.includes(f));
  const riskFactorOther = storedRiskFactors.filter((f) => !MAJOR_RISK_FACTORS.includes(f)).join(", ");

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-4 border-b border-border-color bg-white px-6 pb-[17px] pt-11">
        <Link href={`/midwife/patients/${patient.id}`} className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Edit Patient Details</h1>
        <div className="size-[22px]" />
      </div>

      <div className="flex items-center justify-between bg-lilac-light px-5 py-4">
        <p className="font-heading text-[15px] font-bold text-text-primary">{patient.name}</p>
      </div>

      <EditPatientForm
        patientId={patient.id}
        facilityName={facility?.name ?? "Your facility"}
        initial={{
          name: patient.name,
          dateOfBirth: patient.dateOfBirth.toISOString().slice(0, 10),
          phone: patient.phone,
          ghanaCardId: patient.ghanaCardId ?? "",
          community: patient.community ?? "",
          nhisNumber: patient.nhisNumber ?? "",
          maritalStatus: patient.maritalStatus ?? "",
          educationalLevel: patient.educationalLevel ?? "",
          occupation: patient.occupation ?? "",
          spouseName: patient.spouseName ?? "",
          spousePhone: patient.spousePhone ?? "",
          spouseOccupation: patient.spouseOccupation ?? "",
          emergencyTransportPhone: patient.emergencyTransportPhone ?? "",
          datingMethod: patient.datingMethod === "ULTRASOUND" ? "ULTRASOUND" : "LMP",
          lmp: patient.datingMethod === "ULTRASOUND" ? "" : patient.lmp ? patient.lmp.toISOString().slice(0, 10) : "",
          scanDate: patient.scanDate ? patient.scanDate.toISOString().slice(0, 10) : "",
          scanWeeks: scanAge ? String(scanAge.weeks) : "",
          scanDays: scanAge ? String(scanAge.days) : "",
          gravida: patient.gravida != null ? String(patient.gravida) : "",
          para: patient.para != null ? String(patient.para) : "",
          bloodGroup: patient.bloodGroup ?? "",
          knownConditions: patient.knownConditions ?? "",
          abortionsSpontaneous: patient.numberOfAbortionsSpontaneous != null ? String(patient.numberOfAbortionsSpontaneous) : "",
          abortionsInduced: patient.numberOfAbortionsInduced != null ? String(patient.numberOfAbortionsInduced) : "",
          riskFactors,
          riskFactorOther,
          previousPregnancies: Array.isArray(patient.previousPregnancies)
            ? (patient.previousPregnancies as unknown as PreviousPregnancy[])
            : [],
          investigations: {
            height: patient.height != null ? String(patient.height) : "",
            weightAtAnc1: patient.weightAtAnc1 != null ? String(patient.weightAtAnc1) : "",
            estimatedDesiredWeightAtEdd: patient.estimatedDesiredWeightAtEdd ?? "",
            contraceptionUsed: patient.contraceptionUsed ?? "",
            rhTyping: patient.rhTyping ?? "",
            hbsAg: patient.hbsAg ?? "",
            sickling: patient.sickling ?? "",
            g6pd: patient.g6pd ?? "",
            vdrl: patient.vdrl ?? "",
            hivStatus: patient.hivStatus ?? "",
            hbFirstVisit: patient.hbFirstVisit != null ? String(patient.hbFirstVisit) : "",
            urineRE: patient.urineRE ?? "",
            stoolRE: patient.stoolRE ?? "",
            bfForMalaria: patient.bfForMalaria ?? "",
          },
          medicalHistory: mergeJson<MedicalHistoryState>(patient.medicalHistory, EMPTY_MEDICAL_HISTORY),
          socialHistory: mergeJson<SocialHistoryState>(patient.socialHistory, EMPTY_SOCIAL_HISTORY),
          familyHistory: mergeJson<FamilyHistoryState>(patient.familyHistory, EMPTY_FAMILY_HISTORY),
          physicalExam: mergeJson<PhysicalExamState>(patient.physicalExamAtFirstVisit, EMPTY_PHYSICAL_EXAM),
          emergencyContactName: patient.emergencyContactName ?? "",
          emergencyContactPhone: patient.emergencyContactPhone ?? "",
          emergencyContactRelation: patient.emergencyContactRelation ?? "",
        }}
      />
    </main>
  );
}
