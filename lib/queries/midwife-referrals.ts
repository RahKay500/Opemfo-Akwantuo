import { prisma } from "@/lib/prisma";
import type { Priority, ReferralStatus } from "@prisma/client";

export interface MidwifeReferralListItem {
  id: string;
  refId: string;
  patientId: string;
  patientName: string;
  toFacilityName: string;
  reason: string;
  priority: Priority;
  status: ReferralStatus;
  sentAt: string;
}

export async function getMidwifeReferrals(userId: string): Promise<MidwifeReferralListItem[]> {
  const referrals = await prisma.referral.findMany({
    where: { initiatedById: userId },
    orderBy: { sentAt: "desc" },
    include: { patient: { select: { id: true, name: true } }, toFacility: { select: { name: true } } },
  });

  // Sequential ref numbers in the order referrals were actually sent
  // (R-001 = earliest), independent of the desc display order above.
  const refIdByReferralId = new Map(
    [...referrals]
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
      .map((r, i) => [r.id, `R-${String(i + 1).padStart(3, "0")}`])
  );

  return referrals.map((r) => ({
    id: r.id,
    refId: refIdByReferralId.get(r.id)!,
    patientId: r.patient.id,
    patientName: r.patient.name,
    toFacilityName: r.toFacility.name,
    reason: r.reason,
    priority: r.priority,
    status: r.status,
    sentAt: r.sentAt.toISOString(),
  }));
}
