import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getMidwifePatientDetail } from "@/lib/queries/midwife-patient-detail";
import { gestationalAgeAtScan } from "@/lib/pregnancy";
import { ArrowLeftIcon } from "@/components/ui/icons";
import EditPatientForm from "./EditPatientForm";

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
          emergencyContactName: patient.emergencyContactName ?? "",
          emergencyContactPhone: patient.emergencyContactPhone ?? "",
          emergencyContactRelation: patient.emergencyContactRelation ?? "",
        }}
      />
    </main>
  );
}
