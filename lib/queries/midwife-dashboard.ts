import { prisma } from "@/lib/prisma";
import type { Priority } from "@prisma/client";
import { initials } from "@/lib/utils";

export type QueueStatus = "NORMAL" | "FLAGGED" | "CRITICAL";
export type FlaggedStatus = "FLAGGED" | "CRITICAL" | "EMERGENCY";

export interface MidwifeDashboardData {
  name: string;
  facilityName: string;
  stats: {
    todaysPatients: number;
    todaysPatientsRemaining: number;
    pendingReferrals: number;
    pendingReferralsCritical: number;
    flaggedVitalsThisWeek: number;
    totalRegistered: number;
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
  todaysQueue: {
    patientId: string;
    name: string;
    phone: string;
    week: number | null;
    appointmentTime: string | null;
    status: QueueStatus;
  }[];
  flaggedPatients: { patientId: string; name: string; week: number | null; status: FlaggedStatus }[];
  patientsThisWeek: { day: string; count: number }[];
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

function weekOf(lmp: Date | null, today: Date): number | null {
  if (!lmp) return null;
  return Math.min(Math.max(Math.floor((today.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000)), 0), 40);
}

// Monday 00:00 through Saturday 23:59 of the current week.
function mondayOfWeek(today: Date): Date {
  const d = startOfDay(today);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export async function getMidwifeDashboardData(userId: string): Promise<MidwifeDashboardData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const facilityId = user.facilityId;
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const weekStart = mondayOfWeek(today);
  const weekEnd = endOfDay(new Date(weekStart.getTime() + 5 * 24 * 60 * 60 * 1000));

  const [
    totalPatients,
    pendingReferralsList,
    flaggedVitalsThisWeek,
    activeEmergencyAlert,
    activeEmergencyAlerts,
    flaggedVisits,
    todaysAppointments,
    weeksVisits,
  ] = await Promise.all([
    prisma.patient.count({ where: { facilityId } }),
    prisma.referral.findMany({
      where: { fromFacilityId: facilityId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
      select: { priority: true },
    }),
    prisma.visit.count({
      where: { flagged: true, createdAt: { gte: weekStart, lte: weekEnd }, patient: { facilityId } },
    }),
    prisma.emergencyAlert.findFirst({
      where: { isActive: true, patient: { facilityId } },
      orderBy: { triggeredAt: "desc" },
      include: { patient: { select: { name: true } } },
    }),
    prisma.emergencyAlert.findMany({
      where: { isActive: true, patient: { facilityId } },
      orderBy: { triggeredAt: "desc" },
      take: 5,
      include: { patient: { select: { id: true, name: true, lmp: true } } },
    }),
    prisma.visit.findMany({
      where: { flagged: true, patient: { facilityId } },
      orderBy: [{ createdAt: "desc" }],
      take: 5,
      include: { patient: { select: { id: true, name: true, lmp: true } } },
    }),
    prisma.appointmentRequest.findMany({
      where: { patient: { facilityId }, preferredDate: { gte: todayStart, lte: todayEnd } },
      orderBy: { preferredTime: "asc" },
      include: { patient: { select: { id: true, name: true, phone: true, lmp: true } } },
    }),
    prisma.visit.findMany({
      where: { patient: { facilityId }, createdAt: { gte: weekStart, lte: weekEnd } },
      select: { createdAt: true },
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

  // Today's visits already logged, keyed by patientId, to derive queue status
  // and to know which of today's appointments still need to be seen.
  const todaysVisitsByPatient = await prisma.visit.findMany({
    where: {
      patientId: { in: todaysAppointments.map((a) => a.patient.id) },
      createdAt: { gte: todayStart, lte: todayEnd },
    },
    orderBy: { createdAt: "desc" },
  });
  const latestVisitByPatient = new Map<string, (typeof todaysVisitsByPatient)[number]>();
  for (const v of todaysVisitsByPatient) {
    if (!latestVisitByPatient.has(v.patientId)) latestVisitByPatient.set(v.patientId, v);
  }

  const todaysQueue = todaysAppointments.map((a) => {
    const visit = latestVisitByPatient.get(a.patient.id);
    let status: QueueStatus = "NORMAL";
    if (visit?.flagged) status = visit.flagPriority === "CRITICAL" ? "CRITICAL" : "FLAGGED";
    return {
      patientId: a.patient.id,
      name: a.patient.name,
      phone: a.patient.phone,
      week: weekOf(a.patient.lmp, today),
      appointmentTime: a.preferredTime,
      status,
    };
  });
  const todaysPatientsRemaining = todaysAppointments.filter((a) => !latestVisitByPatient.has(a.patient.id)).length;

  const flaggedPatientsMap = new Map<string, { patientId: string; name: string; week: number | null; status: FlaggedStatus }>();
  for (const alert of activeEmergencyAlerts) {
    flaggedPatientsMap.set(alert.patient.id, {
      patientId: alert.patient.id,
      name: alert.patient.name,
      week: weekOf(alert.patient.lmp, today),
      status: "EMERGENCY",
    });
  }
  for (const v of flaggedVisits) {
    if (flaggedPatientsMap.has(v.patient.id)) continue;
    flaggedPatientsMap.set(v.patient.id, {
      patientId: v.patient.id,
      name: v.patient.name,
      week: weekOf(v.patient.lmp, today),
      status: v.flagPriority === "CRITICAL" ? "CRITICAL" : "FLAGGED",
    });
  }
  const flaggedPatients = Array.from(flaggedPatientsMap.values()).slice(0, 5);

  const countsByWeekday = new Array(6).fill(0);
  for (const v of weeksVisits) {
    const dow = v.createdAt.getDay(); // 0=Sun..6=Sat
    const index = dow === 0 ? -1 : dow - 1; // Mon=0 ... Sat=5, Sun excluded
    if (index >= 0 && index < 6) countsByWeekday[index] += 1;
  }
  const patientsThisWeek = WEEKDAY_LABELS.map((day, i) => ({ day, count: countsByWeekday[i] }));

  const pendingReferrals = pendingReferralsList.length;
  const pendingReferralsCritical = pendingReferralsList.filter((r) => r.priority === "CRITICAL").length;

  return {
    name: user.name,
    facilityName: user.facility.name,
    stats: {
      todaysPatients: todaysAppointments.length,
      todaysPatientsRemaining,
      pendingReferrals,
      pendingReferralsCritical,
      flaggedVitalsThisWeek,
      totalRegistered: totalPatients,
    },
    activeEmergency: activeEmergencyAlert
      ? {
          patientId: activeEmergencyAlert.patientId,
          patientName: activeEmergencyAlert.patient.name,
          triggeredAt: activeEmergencyAlert.triggeredAt,
        }
      : null,
    needsAttention,
    todaysVisits: todaysAppointments.map((a) => ({
      patientId: a.patient.id,
      name: a.patient.name,
      initials: initials(a.patient.name),
      week: weekOf(a.patient.lmp, today),
      time: a.preferredTime,
    })),
    todaysQueue,
    flaggedPatients,
    patientsThisWeek,
  };
}
