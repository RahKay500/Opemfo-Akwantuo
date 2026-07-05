import { prisma } from "@/lib/prisma";

export interface MidwifeProfileData {
  name: string;
  phone: string;
  facilityName: string;
  memberSince: number;
  patientsCount: number;
  referralsCount: number;
}

export async function getMidwifeProfileData(userId: string): Promise<MidwifeProfileData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const [patientsCount, referralsCount] = await Promise.all([
    prisma.patient.count({ where: { facilityId: user.facilityId } }),
    prisma.referral.count({ where: { initiatedById: userId } }),
  ]);

  return {
    name: user.name,
    phone: user.phone,
    facilityName: user.facility.name,
    memberSince: user.createdAt.getFullYear(),
    patientsCount,
    referralsCount,
  };
}
