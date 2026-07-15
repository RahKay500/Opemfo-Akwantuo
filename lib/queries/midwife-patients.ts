import { prisma } from "@/lib/prisma";
import type { Priority, VisitType } from "@prisma/client";
import { initials } from "@/lib/utils";
import { calculateAge } from "@/lib/pregnancy";

export type PatientStatus = "NORMAL" | "FLAGGED" | "CRITICAL" | "EMERGENCY";

export interface MidwifePatientListItem {
  id: string;
  name: string;
  initials: string;
  phone: string;
  age: number;
  week: number | null;
  visitType: VisitType | null;
  weekOrDay: string | null;
  lastVisitAt: Date | null;
  nextVisitAt: Date | null;
  flagged: boolean;
  flagPriority: Priority | null;
  flagBanner: string | null;
  hasActiveReferral: boolean;
  status: PatientStatus;
}

export async function getMidwifePatientList(userId: string): Promise<MidwifePatientListItem[] | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.facilityId) return null;

  const now = new Date();

  const [patients, activeEmergencyAlerts] = await Promise.all([
    prisma.patient.findMany({
      where: { facilityId: user.facilityId },
      include: {
        visits: { orderBy: { createdAt: "desc" }, take: 1 },
        referrals: { where: { status: { notIn: ["COMPLETED", "CANCELLED"] } }, take: 1 },
        appointmentRequests: {
          where: { status: "CONFIRMED", preferredDate: { gte: now } },
          orderBy: { preferredDate: "asc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.emergencyAlert.findMany({
      where: { isActive: true, patient: { facilityId: user.facilityId } },
      select: { patientId: true },
    }),
  ]);

  const emergencyPatientIds = new Set(activeEmergencyAlerts.map((a) => a.patientId));

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

    const week = patient.lmp
      ? Math.min(Math.max(Math.floor((now.getTime() - patient.lmp.getTime()) / (7 * 24 * 60 * 60 * 1000)), 0), 40)
      : null;

    const midwifeNextVisit =
      lastVisit?.nextVisitDate && lastVisit.nextVisitDate.getTime() >= now.getTime() ? lastVisit.nextVisitDate : null;
    const nextVisitAt = midwifeNextVisit ?? patient.appointmentRequests[0]?.preferredDate ?? null;

    let status: PatientStatus = "NORMAL";
    if (emergencyPatientIds.has(patient.id)) status = "EMERGENCY";
    else if (lastVisit?.flagged) status = lastVisit.flagPriority === "CRITICAL" ? "CRITICAL" : "FLAGGED";

    return {
      id: patient.id,
      name: patient.name,
      initials: initials(patient.name),
      phone: patient.phone,
      age: calculateAge(patient.dateOfBirth),
      week,
      visitType: lastVisit?.visitType ?? null,
      weekOrDay,
      lastVisitAt: lastVisit?.createdAt ?? null,
      nextVisitAt,
      flagged: lastVisit?.flagged ?? false,
      flagPriority: lastVisit?.flagPriority ?? null,
      flagBanner,
      hasActiveReferral: patient.referrals.length > 0,
      status,
    };
  });
}
