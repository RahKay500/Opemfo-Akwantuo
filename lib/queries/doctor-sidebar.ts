import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@prisma/client";
import { getUnreadConversationCount } from "@/lib/queries/staff-conversations";

export interface DoctorSidebarData {
  name: string;
  facilityName: string;
  facilityType: FacilityType | null;
  newSharedRecordsCount: number;
  unreadMessagesCount: number;
}

export async function getDoctorSidebarData(userId: string): Promise<DoctorSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  const [newSharedRecordsCount, unreadMessagesCount] = await Promise.all([
    prisma.referralShare.count({
      where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: new Date() } },
    }),
    getUnreadConversationCount(userId, "DOCTOR"),
  ]);

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
    facilityType: user.facility?.type ?? null,
    newSharedRecordsCount,
    unreadMessagesCount,
  };
}
