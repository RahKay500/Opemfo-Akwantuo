import { prisma } from "@/lib/prisma";
import { averageDurationLabel } from "@/lib/referral-metrics";

export interface MidwifeProfileData {
  name: string;
  phone: string;
  facilityName: string;
  facilityRegion: string;
  memberSince: number;
  patientsCount: number;
  visitsThisMonthCount: number;
  referralsCount: number;
  avgResponseTimeLabel: string | null;
  staffId: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  email: string | null;
  serviceStartDate: Date | null;
  yearsOfService: number | null;
  isVerified: boolean;
}

export async function getMidwifeProfileData(userId: string): Promise<MidwifeProfileData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [patientsCount, visitsThisMonthCount, referralsCount, acknowledgedReferrals] = await Promise.all([
    prisma.patient.count({ where: { facilityId: user.facilityId } }),
    prisma.visit.count({ where: { nurseId: userId, createdAt: { gte: startOfMonth } } }),
    prisma.referral.count({ where: { initiatedById: userId } }),
    prisma.referral.findMany({
      where: { initiatedById: userId, acknowledgedAt: { not: null } },
      select: { sentAt: true, acknowledgedAt: true },
    }),
  ]);

  const avgResponseTimeLabel = averageDurationLabel(
    acknowledgedReferrals.map((r) => ({ start: r.sentAt, end: r.acknowledgedAt }))
  );

  const yearsOfService = user.serviceStartDate
    ? Math.max(0, new Date().getFullYear() - user.serviceStartDate.getFullYear())
    : null;

  return {
    name: user.name,
    phone: user.phone,
    facilityName: user.facility.name,
    facilityRegion: user.facility.region,
    memberSince: user.createdAt.getFullYear(),
    patientsCount,
    visitsThisMonthCount,
    referralsCount,
    avgResponseTimeLabel,
    staffId: user.licenseNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    email: user.email,
    serviceStartDate: user.serviceStartDate,
    yearsOfService,
    isVerified: Boolean(user.licenseNumber),
  };
}
