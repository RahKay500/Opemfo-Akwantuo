import { prisma } from "@/lib/prisma";
import type { Priority, ReferralStatus } from "@prisma/client";
import { lastNMonths, monthKey } from "@/lib/date-buckets";
import { averageDurationLabel } from "@/lib/referral-metrics";

export interface DoctorAnalyticsData {
  facilityName: string;
  totalReferrals: number;
  avgResponseTimeLabel: string | null;
  avgTimeToArrivalLabel: string | null;
  completionRate: number | null;
  monthlyReferrals: { month: string; received: number; seen: number }[];
  byPriority: { priority: Priority; count: number }[];
  byStatus: { status: ReferralStatus; count: number }[];
  byFacility: { facilityName: string; count: number; criticalCount: number }[];
}

export async function getDoctorAnalyticsData(userId: string): Promise<DoctorAnalyticsData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const facilityId = user.facilityId;
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const referrals = await prisma.referral.findMany({
    where: { toFacilityId: facilityId },
    select: {
      priority: true,
      status: true,
      sentAt: true,
      acknowledgedAt: true,
      arrivedAt: true,
      completedAt: true,
      fromFacility: { select: { name: true } },
    },
  });

  const totalReferrals = referrals.length;

  const avgResponseTimeLabel = averageDurationLabel(
    referrals.map((r) => ({ start: r.sentAt, end: r.acknowledgedAt }))
  );
  const avgTimeToArrivalLabel = averageDurationLabel(
    referrals
      .filter((r) => r.acknowledgedAt)
      .map((r) => ({ start: r.acknowledgedAt!, end: r.arrivedAt }))
  );

  const completedOrCancelled = referrals.filter((r) => r.status === "COMPLETED" || r.status === "CANCELLED");
  const completionRate =
    completedOrCancelled.length > 0
      ? Math.round((referrals.filter((r) => r.status === "COMPLETED").length / completedOrCancelled.length) * 100)
      : null;

  const monthlyReferrals = lastNMonths(12, now).map(({ key, label }) => {
    const received = referrals.filter((r) => r.sentAt >= twelveMonthsAgo && monthKey(r.sentAt) === key).length;
    const seen = referrals.filter((r) => {
      const t = r.completedAt ?? r.arrivedAt;
      return t && monthKey(t) === key;
    }).length;
    return { month: label, received, seen };
  });

  const priorityOrder: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
  const byPriority = priorityOrder.map((priority) => ({
    priority,
    count: referrals.filter((r) => r.priority === priority).length,
  }));

  const statusOrder: ReferralStatus[] = ["SENT", "ACKNOWLEDGED", "PATIENT_ARRIVED", "COMPLETED", "CANCELLED"];
  const byStatus = statusOrder.map((status) => ({
    status,
    count: referrals.filter((r) => r.status === status).length,
  }));

  const facilityTotals = new Map<string, { count: number; criticalCount: number }>();
  for (const r of referrals) {
    const name = r.fromFacility.name;
    const entry = facilityTotals.get(name) ?? { count: 0, criticalCount: 0 };
    entry.count += 1;
    if (r.priority === "CRITICAL") entry.criticalCount += 1;
    facilityTotals.set(name, entry);
  }
  const byFacility = [...facilityTotals.entries()]
    .map(([facilityName, v]) => ({ facilityName, ...v }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    facilityName: user.facility.name,
    totalReferrals,
    avgResponseTimeLabel,
    avgTimeToArrivalLabel,
    completionRate,
    monthlyReferrals,
    byPriority,
    byStatus,
    byFacility,
  };
}
