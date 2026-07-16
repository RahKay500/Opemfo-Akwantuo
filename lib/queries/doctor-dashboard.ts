import { prisma } from "@/lib/prisma";
import { getDoctorReferralQueue, type DoctorReferralQueueItem } from "@/lib/queries/doctor-referral-queue";

export interface DoctorDashboardData {
  name: string;
  facilityName: string;
  newSharedRecord: { shareId: string; patientId: string; patientName: string; sharedByName: string } | null;
  stats: {
    incomingReferrals: number;
    incomingCritical: number;
    scheduledToday: number;
    seenToday: number;
    recordsShared: number;
    referralsThisWeek: number;
  };
  referralQueue: DoctorReferralQueueItem[];
  monthlyReferrals: { month: string; received: number; seen: number }[];
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

export async function getDoctorDashboardData(userId: string): Promise<DoctorDashboardData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId) return null;

  const facilityId = user.facilityId;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [openReferrals, referralsThisWeek, recordsShared, recentShareRow, referralQueue, monthlyRaw] =
    await Promise.all([
      prisma.referral.findMany({
        where: { toFacilityId: facilityId, status: { notIn: ["COMPLETED", "CANCELLED"] } },
        select: { priority: true, patientId: true },
      }),
      prisma.referral.count({ where: { toFacilityId: facilityId, sentAt: { gte: weekAgo } } }),
      prisma.referralShare.count({ where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: now } } }),
      prisma.referralShare.findFirst({
        where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: now }, patientId: { not: null } },
        orderBy: { createdAt: "desc" },
        include: { patient: { select: { id: true, name: true } }, sharedByNurse: { select: { name: true } } },
      }),
      getDoctorReferralQueue(userId),
      prisma.referral.findMany({
        where: { toFacilityId: facilityId, sentAt: { gte: sixMonthsAgo } },
        select: { sentAt: true, arrivedAt: true, completedAt: true },
      }),
    ]);

  const incomingReferrals = openReferrals.length;
  const incomingCritical = openReferrals.filter((r) => r.priority === "CRITICAL").length;

  const openPatientIds = [...new Set(openReferrals.map((r) => r.patientId))];
  const apptsToday = openPatientIds.length
    ? await prisma.appointmentRequest.findMany({
        where: { patientId: { in: openPatientIds }, preferredDate: { gte: todayStart, lte: todayEnd } },
        select: { patientId: true },
      })
    : [];
  const scheduledPatientIds = new Set(apptsToday.map((a) => a.patientId));
  const scheduledToday = scheduledPatientIds.size;

  const seenReferrals = scheduledPatientIds.size
    ? await prisma.referral.findMany({
        where: {
          toFacilityId: facilityId,
          patientId: { in: [...scheduledPatientIds] },
          status: { in: ["PATIENT_ARRIVED", "COMPLETED"] },
        },
        select: { patientId: true },
      })
    : [];
  const seenToday = new Set(seenReferrals.map((r) => r.patientId)).size;

  const months: { key: string; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GH", { month: "short" }) });
  }
  const monthlyReferrals = months.map(({ key, label }) => {
    const received = monthlyRaw.filter((r) => `${r.sentAt.getFullYear()}-${r.sentAt.getMonth()}` === key).length;
    const seen = monthlyRaw.filter((r) => {
      const t = r.completedAt ?? r.arrivedAt;
      return t && `${t.getFullYear()}-${t.getMonth()}` === key;
    }).length;
    return { month: label, received, seen };
  });

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
    newSharedRecord:
      recentShareRow && recentShareRow.patient
        ? {
            shareId: recentShareRow.id,
            patientId: recentShareRow.patient.id,
            patientName: recentShareRow.patient.name,
            sharedByName: recentShareRow.sharedByNurse.name,
          }
        : null,
    stats: {
      incomingReferrals,
      incomingCritical,
      scheduledToday,
      seenToday,
      recordsShared,
      referralsThisWeek,
    },
    referralQueue: referralQueue.slice(0, 5),
    monthlyReferrals,
  };
}
