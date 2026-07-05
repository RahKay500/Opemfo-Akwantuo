import { prisma } from "@/lib/prisma";
import type { Priority } from "@prisma/client";
import { initials } from "@/lib/utils";

export interface MidwifeDashboardData {
  name: string;
  facilityName: string;
  stats: {
    totalPatients: number;
    activeReferrals: number;
    flagsToday: number;
    pendingVisits: number;
  };
  activeEmergency: { patientId: string; patientName: string; triggeredAt: Date } | null;
  needsAttention: {
    patientId: string;
    visitId: string;
    name: string;
    priority: Priority;
    reason: string;
    recordedAt: Date;
  }[];
  todaysVisits: { patientId: string; name: string; initials: string; week: number | null; time: string | null }[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function getMidwifeDashboardData(userId: string): Promise<MidwifeDashboardData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const facilityId = user.facilityId;
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  const [
    totalPatients,
    activeReferrals,
    flagsToday,
    pendingVisits,
    activeEmergencyAlert,
    flaggedVisits,
    todaysAppointments,
  ] = await Promise.all([
    prisma.patient.count({ where: { facilityId } }),
    prisma.referral.count({ where: { fromFacilityId: facilityId, status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.visit.count({
      where: { flagged: true, createdAt: { gte: todayStart, lte: todayEnd }, patient: { facilityId } },
    }),
    prisma.appointmentRequest.count({
      where: { status: "PENDING", patient: { facilityId } },
    }),
    prisma.emergencyAlert.findFirst({
      where: { isActive: true, patient: { facilityId } },
      orderBy: { triggeredAt: "desc" },
      include: { patient: { select: { name: true } } },
    }),
    prisma.visit.findMany({
      where: { flagged: true, patient: { facilityId } },
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      include: { patient: { select: { id: true, name: true } } },
    }),
    prisma.appointmentRequest.findMany({
      where: { patient: { facilityId }, preferredDate: { gte: todayStart, lte: todayEnd } },
      orderBy: { preferredTime: "asc" },
      include: { patient: { select: { id: true, name: true, lmp: true } } },
    }),
  ]);

  const priorityRank: Record<Priority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const needsAttention = flaggedVisits
    .sort((a, b) => priorityRank[a.flagPriority ?? "LOW"] - priorityRank[b.flagPriority ?? "LOW"])
    .map((v) => ({
      patientId: v.patient.id,
      visitId: v.id,
      name: v.patient.name,
      priority: v.flagPriority ?? "LOW",
      reason: v.flagReason ?? "Flagged reading",
      recordedAt: v.createdAt,
    }));

  return {
    name: user.name,
    facilityName: user.facility.name,
    stats: { totalPatients, activeReferrals, flagsToday, pendingVisits },
    activeEmergency: activeEmergencyAlert
      ? {
          patientId: activeEmergencyAlert.patientId,
          patientName: activeEmergencyAlert.patient.name,
          triggeredAt: activeEmergencyAlert.triggeredAt,
        }
      : null,
    needsAttention,
    todaysVisits: todaysAppointments.map((a) => {
      const week = a.patient.lmp
        ? Math.min(Math.max(Math.floor((today.getTime() - a.patient.lmp.getTime()) / (7 * 24 * 60 * 60 * 1000)), 0), 40)
        : null;
      return {
        patientId: a.patient.id,
        name: a.patient.name,
        initials: initials(a.patient.name),
        week,
        time: a.preferredTime,
      };
    }),
  };
}
