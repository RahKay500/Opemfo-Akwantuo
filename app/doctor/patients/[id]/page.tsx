import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorPatientDetail } from "@/lib/queries/doctor-patient-detail";
import { calculateAge, calculatePregnancyProgress } from "@/lib/pregnancy";
import { formatDate } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import DoctorRecordClient from "./DoctorRecordClient";

export default async function DoctorPatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const detail = await getDoctorPatientDetail(id, user.id);
  if (!detail) notFound();

  const { patient, latestVisit, share, status } = detail;

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
        <Link href="/doctor/inbox" className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Shared Record</h1>
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

      <DoctorRecordClient
        shareId={share.id}
        status={status}
        sharedByName={share.sharedByNurse.name}
        reason={share.reason}
        expiresAt={share.expiresAt.toISOString()}
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
      />
    </main>
  );
}
