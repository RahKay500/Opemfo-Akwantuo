import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getMidwifePatientDetail } from "@/lib/queries/midwife-patient-detail";
import { calculateAge, calculatePregnancyProgress } from "@/lib/pregnancy";
import { formatDate } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import PatientDetailClient from "./PatientDetailClient";

export default async function MidwifePatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const { id } = await params;
  const detail = await getMidwifePatientDetail(id, user.facilityId);
  if (!detail) notFound();

  const { patient, latestVisit } = detail;

  const doctors = await prisma.user.findMany({
    where: { role: "DOCTOR", isActive: true },
    include: { facility: { select: { name: true } } },
  });

  const week = patient.lmp ? calculatePregnancyProgress(patient.lmp).week : null;
  const age = calculateAge(patient.dateOfBirth);
  const initialsStr = patient.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <main className="flex flex-col">
      <div className="flex items-center gap-3 bg-white px-5 pb-3.5 pt-14">
        <Link href="/midwife/patients" className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Patient Details</h1>
        <div className="size-[22px]" />
      </div>

      <div className="flex items-start gap-4 bg-lilac-light p-5">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-badge bg-primary">
          <span className="font-heading text-xl font-bold text-white">{initialsStr}</span>
        </div>
        <div>
          <p className="font-heading text-xl font-bold text-text-primary">{patient.name}</p>
          <p className="mt-1 font-body text-[13px] text-text-secondary">
            {[week != null ? `Week ${week}` : null, `DOB ${formatDate(patient.dateOfBirth)} (${age})`, patient.bloodGroup]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {latestVisit?.flagged && (
            <div className="mt-2">
              <PriorityBadge priority={latestVisit.flagPriority ?? "LOW"} className="px-2.5 py-1 text-xs" />
            </div>
          )}
        </div>
      </div>

      <PatientDetailClient
        patientId={patient.id}
        patientName={patient.name}
        visits={patient.visits.map((v) => ({
          id: v.id,
          visitType: v.visitType,
          gestationalAge: v.gestationalAge,
          daysPostpartum: v.daysPostpartum,
          systolic: v.systolic,
          diastolic: v.diastolic,
          fetalHeartRate: v.fetalHeartRate,
          temperature: v.temperature,
          weight: v.weight,
          flagged: v.flagged,
          flagReason: v.flagReason,
          flagPriority: v.flagPriority,
          createdAt: v.createdAt.toISOString(),
          nurseName: v.nurse.name,
        }))}
        referrals={patient.referrals.map((r) => ({
          id: r.id,
          hospitalName: r.toFacility.name,
          status: r.status,
          priority: r.priority,
          sentAt: r.sentAt.toISOString(),
        }))}
        doctors={doctors.map((d) => ({ id: d.id, name: d.name, facilityName: d.facility?.name ?? "" }))}
        vaccinations={patient.vaccinations.map((v) => ({
          id: v.id,
          type: v.type,
          doseNumber: v.doseNumber,
          dateGiven: v.dateGiven.toISOString(),
          batchNumber: v.batchNumber,
        }))}
        iptpDoses={patient.iptpDoses.map((d) => ({
          id: d.id,
          doseNumber: d.doseNumber,
          dateGiven: d.dateGiven.toISOString(),
        }))}
        deliveryRecord={
          patient.deliveryRecord
            ? {
                dateOfDelivery: patient.deliveryRecord.dateOfDelivery
                  ? patient.deliveryRecord.dateOfDelivery.toISOString()
                  : null,
                typeOfDelivery: patient.deliveryRecord.typeOfDelivery,
                durationOfLabourHours: patient.deliveryRecord.durationOfLabourHours,
                durationOfLabourMinutes: patient.deliveryRecord.durationOfLabourMinutes,
                estimatedBloodLossMl: patient.deliveryRecord.estimatedBloodLossMl,
                statePerineum: patient.deliveryRecord.statePerineum,
                birthAttendant: patient.deliveryRecord.birthAttendant,
                babySex: patient.deliveryRecord.babySex,
                babyBirthWeightKg: patient.deliveryRecord.babyBirthWeightKg,
                babyCondition: patient.deliveryRecord.babyCondition,
              }
            : null
        }
      />
    </main>
  );
}
