import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@prisma/client";

export interface DoctorSidebarData {
  name: string;
  facilityName: string;
  facilityType: FacilityType | null;
  newSharedRecordsCount: number;
}

export async function getDoctorSidebarData(userId: string): Promise<DoctorSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  const newSharedRecordsCount = await prisma.referralShare.count({
    where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: new Date() } },
  });

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
    facilityType: user.facility?.type ?? null,
    newSharedRecordsCount,
  };
}
