import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { calculateAge, calculatePregnancyProgress } from "@/lib/pregnancy";
import { evaluateVitals } from "@/lib/flagging";
import { ArrowLeftIcon } from "@/components/ui/icons";
import PriorityBadge from "@/components/ui/PriorityBadge";
import ReferralCreationForm from "./ReferralCreationForm";
import type { Priority } from "@prisma/client";

export default async function ReferralCreationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { visits: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!patient || patient.facilityId !== user.facilityId) notFound();

  const facilities = await prisma.facility.findMany({
    where: { id: { not: user.facilityId }, type: { not: "CHPS" } },
    orderBy: { name: "asc" },
  });

  const latestVisit = patient.visits[0] ?? null;
  const vitalsFlag = latestVisit
    ? evaluateVitals({
        systolic: latestVisit.systolic,
        diastolic: latestVisit.diastolic,
        fetalHeartRate: latestVisit.fetalHeartRate,
        temperature: latestVisit.temperature,
      })
    : { flagged: false, priority: null as Priority | null, reason: "" };

  const systemSuggestedPriority: Priority = vitalsFlag.priority ?? "MEDIUM";
  const suggestedReason = vitalsFlag.flagged
    ? `${vitalsFlag.reason} recorded at today's visit. Immediate referral recommended.`
    : "No active clinical flags — referral is clinician-initiated.";

  const week = patient.lmp ? calculatePregnancyProgress(patient.lmp).week : null;
  const age = calculateAge(patient.dateOfBirth);

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-4 border-b border-border-color bg-white px-6 pb-[17px] pt-11">
        <Link href={`/midwife/patients/${patient.id}`} className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Create Referral</h1>
        <div className="size-[22px]" />
      </div>

      <div className="px-6 pt-6">
        <div className="rounded-card bg-lilac-light p-4">
          <p className="font-heading text-[17px] font-bold text-text-primary">{patient.name}</p>
          <p className="mt-1.5 font-body text-[13px] text-lilac-deeper">
            {[`${age} yrs`, week != null ? `Week ${week}` : null, patient.bloodGroup ? `Blood Group ${patient.bloodGroup}` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {latestVisit?.systolic && latestVisit.diastolic && (
            <div className="mt-3 flex items-center gap-2.5">
              <span className="font-body text-[13px] font-medium text-text-primary">
                Last BP: {latestVisit.systolic}/{latestVisit.diastolic}
              </span>
              {latestVisit.flagged && (
                <PriorityBadge priority={latestVisit.flagPriority ?? "LOW"} className="px-2.5 py-0.5 text-[11px]" />
              )}
            </div>
          )}
        </div>
      </div>

      <ReferralCreationForm
        patientId={patient.id}
        systemSuggestedPriority={systemSuggestedPriority}
        suggestedReason={suggestedReason}
        facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
      />
    </main>
  );
}
