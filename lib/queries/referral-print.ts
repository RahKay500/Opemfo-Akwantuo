import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";

export async function getReferralPrintData(referralId: string) {
  const referral = await prisma.referral.findUnique({
    where: { id: referralId },
    include: {
      patient: true,
      fromFacility: {
        select: { name: true, phone: true, district: { select: { name: true, region: { select: { name: true } } } } },
      },
      toFacility: {
        select: { name: true, phone: true, district: { select: { name: true, region: { select: { name: true } } } } },
      },
      initiatedBy: { select: { name: true } },
    },
  });
  if (!referral) return null;

  const [latestVisit, flaggedVisits] = await Promise.all([
    referral.includeVitals
      ? prisma.visit.findFirst({ where: { patientId: referral.patientId }, orderBy: { createdAt: "desc" } })
      : null,
    referral.includeFlags
      ? prisma.visit.findMany({
          where: { patientId: referral.patientId, flagged: true },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
  ]);

  const pregnancy = referral.patient.lmp ? calculatePregnancyProgress(referral.patient.lmp) : null;

  return { referral, latestVisit, flaggedVisits, pregnancy };
}

export type ReferralPrintData = NonNullable<Awaited<ReturnType<typeof getReferralPrintData>>>;
