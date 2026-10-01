import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@prisma/client";

export interface LabTechnicianSidebarData {
  name: string;
  facilityName: string;
  facilityType: FacilityType | null;
  pendingCount: number;
  unreadNotificationsCount: number;
}

export async function getLabTechnicianSidebarData(userId: string): Promise<LabTechnicianSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  const [pendingCount, unreadNotificationsCount] = await Promise.all([
    user.facilityId
      ? prisma.labRequest.count({
          where: { facilityId: user.facilityId, status: { in: ["REQUESTED", "IN_PROGRESS"] } },
        })
      : Promise.resolve(0),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
    facilityType: user.facility?.type ?? null,
    pendingCount,
    unreadNotificationsCount,
  };
}
