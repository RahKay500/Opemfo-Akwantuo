import { prisma } from "@/lib/prisma";
import { averageDurationLabel } from "@/lib/referral-metrics";

export interface DoctorProfileData {
  name: string;
  phone: string;
  facilityName: string;
  facilityRegion: string;
  specialty: string | null;
  memberSince: number;
  referralsReviewedCount: number;
  patientsThisMonthCount: number;
  recordsSharedCount: number;
  avgReviewTimeLabel: string | null;
  staffId: string | null;
  dateOfBirth: Date | null;
  gender: string | null;
  email: string | null;
  serviceStartDate: Date | null;
  yearsOfService: number | null;
  isVerified: boolean;
}

export async function getDoctorProfileData(userId: string): Promise<DoctorProfileData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const facilityId = user.facilityId;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [referralsReviewedCount, thisMonthReferrals, recordsSharedCount, reviewedReferrals] = await Promise.all([
    prisma.referral.count({ where: { toFacilityId: facilityId, acknowledgedAt: { not: null } } }),
    prisma.referral.findMany({
      where: { toFacilityId: facilityId, sentAt: { gte: startOfMonth } },
      select: { patientId: true },
    }),
    prisma.referralShare.count({ where: { sharedWithDoctorId: userId } }),
    prisma.referral.findMany({
      where: { toFacilityId: facilityId, acknowledgedAt: { not: null } },
      select: { sentAt: true, acknowledgedAt: true },
    }),
  ]);

  const patientsThisMonthCount = new Set(thisMonthReferrals.map((r) => r.patientId)).size;
  const avgReviewTimeLabel = averageDurationLabel(
    reviewedReferrals.map((r) => ({ start: r.sentAt, end: r.acknowledgedAt }))
  );

  const yearsOfService = user.serviceStartDate
    ? Math.max(0, new Date().getFullYear() - user.serviceStartDate.getFullYear())
    : null;

  return {
    name: user.name,
    phone: user.phone,
    facilityName: user.facility.name,
    facilityRegion: user.facility.region,
    specialty: user.specialty,
    memberSince: user.createdAt.getFullYear(),
    referralsReviewedCount,
    patientsThisMonthCount,
    recordsSharedCount,
    avgReviewTimeLabel,
    staffId: user.licenseNumber,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    email: user.email,
    serviceStartDate: user.serviceStartDate,
    yearsOfService,
    isVerified: Boolean(user.licenseNumber),
  };
}
