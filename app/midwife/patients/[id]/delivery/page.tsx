import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { ArrowLeftIcon } from "@/components/ui/icons";
import DeliveryRecordForm from "./DeliveryRecordForm";

export default async function DeliveryRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { deliveryRecord: true },
  });
  if (!patient || patient.facilityId !== user.facilityId) notFound();

  const record = patient.deliveryRecord;

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-4 border-b border-border-color bg-white px-6 pb-[17px] pt-11">
        <Link href={`/midwife/patients/${patient.id}`} className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">
          {record ? "Edit Delivery Record" : "Record Delivery"}
        </h1>
        <div className="size-[22px]" />
      </div>

      <div className="flex items-center justify-between bg-lilac-light px-5 py-4">
        <p className="font-heading text-[15px] font-bold text-text-primary">{patient.name}</p>
      </div>

      <DeliveryRecordForm
        patientId={patient.id}
        initial={
          record
            ? {
                weeksOfPregnancy: record.weeksOfPregnancy,
                dateOfDelivery: record.dateOfDelivery ? record.dateOfDelivery.toISOString().slice(0, 10) : null,
                timeOfDelivery: record.timeOfDelivery,
                timeOfPlacentaDelivery: record.timeOfPlacentaDelivery,
                durationOfLabourHours: record.durationOfLabourHours,
                durationOfLabourMinutes: record.durationOfLabourMinutes,
                typeOfDelivery: record.typeOfDelivery,
                indicationForVacuumOrCs: record.indicationForVacuumOrCs,
                anesthesia: record.anesthesia,
                estimatedBloodLossMl: record.estimatedBloodLossMl,
                bloodTransfusion: record.bloodTransfusion,
                statePlacentaMembranes: record.statePlacentaMembranes,
                manualRemovalOfPlacenta: record.manualRemovalOfPlacenta,
                statePerineum: record.statePerineum,
                labourDeliveryComplications: record.labourDeliveryComplications,
                birthAttendant: record.birthAttendant,
                placeOfDelivery: record.placeOfDelivery,
                breastfedWithin30Min: record.breastfedWithin30Min,
                skinToSkinContact: record.skinToSkinContact,
                babySex: record.babySex,
                babyBirthWeightKg: record.babyBirthWeightKg,
                babyCondition: record.babyCondition,
              }
            : null
        }
      />
    </main>
  );
}
