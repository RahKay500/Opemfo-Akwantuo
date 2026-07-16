import { prisma } from "@/lib/prisma";

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

  const avgResponseTimeLabel = averageResponseTimeLabel(acknowledgedReferrals);

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

function averageResponseTimeLabel(referrals: { sentAt: Date; acknowledgedAt: Date | null }[]): string | null {
  if (referrals.length === 0) return null;
  const totalMs = referrals.reduce((sum, r) => sum + (r.acknowledgedAt!.getTime() - r.sentAt.getTime()), 0);
  const avgMinutes = Math.round(totalMs / referrals.length / 60000);
  if (avgMinutes < 60) return `${avgMinutes} min`;
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
