import { prisma } from "@/lib/prisma";
import type { Priority, ReferralStatus } from "@prisma/client";

export interface DoctorReferralQueueItem {
  id: string;
  refId: string;
  patientId: string;
  patientName: string;
  fromFacilityName: string;
  week: number | null;
  reason: string;
  priority: Priority;
  status: ReferralStatus;
  sentAt: string;
}

function weekOf(lmp: Date | null, today: Date): number | null {
  if (!lmp) return null;
  return Math.min(Math.max(Math.floor((today.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000)), 0), 40);
}

export async function getDoctorReferralQueue(userId: string): Promise<DoctorReferralQueueItem[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.facilityId) return [];

  const referrals = await prisma.referral.findMany({
    where: { toFacilityId: user.facilityId },
    orderBy: { sentAt: "desc" },
    include: {
      patient: { select: { id: true, name: true, lmp: true } },
      fromFacility: { select: { name: true } },
    },
  });

  // Sequential ref numbers in the order referrals actually arrived (R-001 =
  // earliest), independent of the desc display order above.
  const refIdByReferralId = new Map(
    [...referrals]
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
      .map((r, i) => [r.id, `R-${String(i + 1).padStart(3, "0")}`])
  );

  const today = new Date();
  return referrals.map((r) => ({
    id: r.id,
    refId: refIdByReferralId.get(r.id)!,
    patientId: r.patient.id,
    patientName: r.patient.name,
    fromFacilityName: r.fromFacility.name,
    week: weekOf(r.patient.lmp, today),
    reason: r.reason,
    priority: r.priority,
    status: r.status,
    sentAt: r.sentAt.toISOString(),
  }));
}
