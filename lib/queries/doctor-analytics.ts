import { prisma } from "@/lib/prisma";
import { lastNMonths, monthKey } from "@/lib/date-buckets";
import { averageDurationLabel } from "@/lib/referral-metrics";

export interface DoctorAnalyticsData {
  facilityName: string;
  referralsThisMonth: number;
  referralsDeltaVsLastMonth: number;
  avgResponseTimeLabel: string | null;
  criticalCasesThisMonth: number;
  outcomesRecordedThisMonth: number;
  outcomesRecordedPercent: number | null;
  monthlyReferrals: { month: string; received: number; seen: number }[];
  reasonBreakdown: { category: string; percent: number; count: number }[];
  byFacility: { facilityName: string; count: number; criticalCount: number }[];
}

// Referral.reason is free text a midwife types, not a structured field, so
// "Referral Reasons" is a best-effort keyword classification of that text —
// grounded in the real clinical terms this app's referrals actually use
// (per the Ghana MCH Record Book case studies), not a fabricated breakdown.
const REASON_CATEGORIES: { label: string; match: RegExp }[] = [
  { label: "Pre-eclampsia", match: /pre-?eclamps|eclamps/i },
  { label: "Gestational Diabetes", match: /diabet|glucose/i },
  { label: "Anaemia", match: /an(a)?emia/i },
  { label: "Preterm Labour", match: /preterm|premature labo(u)?r/i },
];

function categorizeReason(reason: string): string {
  for (const c of REASON_CATEGORIES) {
    if (c.match.test(reason)) return c.label;
  }
  return "Other";
}

export async function getDoctorAnalyticsData(userId: string): Promise<DoctorAnalyticsData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const facilityId = user.facilityId;
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const referrals = await prisma.referral.findMany({
    where: { toFacilityId: facilityId },
    select: {
      priority: true,
      status: true,
      reason: true,
      sentAt: true,
      acknowledgedAt: true,
      arrivedAt: true,
      completedAt: true,
      fromFacility: { select: { name: true } },
    },
  });

  const thisMonthReferrals = referrals.filter((r) => r.sentAt >= startOfThisMonth);
  const lastMonthReferrals = referrals.filter((r) => r.sentAt >= startOfLastMonth && r.sentAt < startOfThisMonth);

  const referralsThisMonth = thisMonthReferrals.length;
  const referralsDeltaVsLastMonth = referralsThisMonth - lastMonthReferrals.length;

  const avgResponseTimeLabel = averageDurationLabel(
    thisMonthReferrals.map((r) => ({ start: r.sentAt, end: r.acknowledgedAt }))
  );

  const criticalCasesThisMonth = thisMonthReferrals.filter((r) => r.priority === "CRITICAL").length;

  const outcomesRecordedThisMonth = thisMonthReferrals.filter((r) => r.status === "COMPLETED").length;
  const outcomesRecordedPercent =
    referralsThisMonth > 0 ? Math.round((outcomesRecordedThisMonth / referralsThisMonth) * 100) : null;

  const monthlyReferrals = lastNMonths(6, now).map(({ key, label }) => {
    const received = referrals.filter((r) => r.sentAt >= sixMonthsAgo && monthKey(r.sentAt) === key).length;
    const seen = referrals.filter((r) => {
      const t = r.completedAt ?? r.arrivedAt;
      return t && monthKey(t) === key;
    }).length;
    return { month: label, received, seen };
  });

  const reasonCounts = new Map<string, number>();
  for (const r of referrals) {
    const category = categorizeReason(r.reason);
    reasonCounts.set(category, (reasonCounts.get(category) ?? 0) + 1);
  }
  const total = referrals.length;
  const reasonBreakdown = [...reasonCounts.entries()]
    .map(([category, count]) => ({ category, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count);

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
    referralsThisMonth,
    referralsDeltaVsLastMonth,
    avgResponseTimeLabel,
    criticalCasesThisMonth,
    outcomesRecordedThisMonth,
    outcomesRecordedPercent,
    monthlyReferrals,
    reasonBreakdown,
    byFacility,
  };
}
