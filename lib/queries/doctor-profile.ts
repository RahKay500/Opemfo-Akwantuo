import { prisma } from "@/lib/prisma";

export interface DoctorProfileData {
  name: string;
  phone: string;
  facilityName: string;
  memberSince: number;
  activeSharesCount: number;
  reviewedCount: number;
}

export async function getDoctorProfileData(userId: string): Promise<DoctorProfileData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  const [activeSharesCount, reviewedCount] = await Promise.all([
    prisma.referralShare.count({ where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: new Date() } } }),
    prisma.referralShare.count({ where: { sharedWithDoctorId: userId, isActive: false } }),
  ]);

  return {
    name: user.name,
    phone: user.phone,
    facilityName: user.facility?.name ?? "—",
    memberSince: user.createdAt.getFullYear(),
    activeSharesCount,
    reviewedCount,
  };
}
