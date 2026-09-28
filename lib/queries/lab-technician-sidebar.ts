import { prisma } from "@/lib/prisma";
import type { FacilityType } from "@prisma/client";

export interface LabTechnicianSidebarData {
  name: string;
  facilityName: string;
  facilityType: FacilityType | null;
  pendingCount: number;
}

export async function getLabTechnicianSidebarData(userId: string): Promise<LabTechnicianSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  const pendingCount = user.facilityId
    ? await prisma.labRequest.count({
        where: { facilityId: user.facilityId, status: { in: ["REQUESTED", "IN_PROGRESS"] } },
      })
    : 0;

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
    facilityType: user.facility?.type ?? null,
    pendingCount,
  };
}
