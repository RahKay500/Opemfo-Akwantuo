import { prisma } from "@/lib/prisma";
import type { Priority, VisitType } from "@prisma/client";
import { initials } from "@/lib/utils";

export interface MidwifePatientListItem {
  id: string;
  name: string;
  initials: string;
  visitType: VisitType | null;
  weekOrDay: string | null;
  lastVisitAt: Date | null;
  flagged: boolean;
  flagPriority: Priority | null;
  flagBanner: string | null;
  hasActiveReferral: boolean;
}

export async function getMidwifePatientList(userId: string): Promise<MidwifePatientListItem[] | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.facilityId) return null;

  const patients = await prisma.patient.findMany({
    where: { facilityId: user.facilityId },
    include: {
      visits: { orderBy: { createdAt: "desc" }, take: 1 },
      referrals: { where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return patients.map((patient) => {
    const lastVisit = patient.visits[0] ?? null;
    const weekOrDay = lastVisit
      ? lastVisit.visitType === "ANTENATAL" && lastVisit.gestationalAge != null
        ? `Week ${lastVisit.gestationalAge}`
        : lastVisit.visitType === "POSTNATAL" && lastVisit.daysPostpartum != null
          ? `Day ${lastVisit.daysPostpartum} postpartum`
          : null
      : null;

    const flagBanner =
      lastVisit?.flagged && lastVisit.systolic != null && lastVisit.diastolic != null
        ? `⚠ BP ${lastVisit.systolic}/${lastVisit.diastolic}${lastVisit.flagReason ? ` — ${lastVisit.flagReason}` : ""}`
        : lastVisit?.flagged && lastVisit.flagReason
          ? `⚠ ${lastVisit.flagReason}`
          : null;

    return {
      id: patient.id,
      name: patient.name,
      initials: initials(patient.name),
      visitType: lastVisit?.visitType ?? null,
      weekOrDay,
      lastVisitAt: lastVisit?.createdAt ?? null,
      flagged: lastVisit?.flagged ?? false,
      flagPriority: lastVisit?.flagPriority ?? null,
      flagBanner,
      hasActiveReferral: patient.referrals.length > 0,
    };
  });
}
