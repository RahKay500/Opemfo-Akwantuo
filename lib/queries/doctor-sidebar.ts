import { prisma } from "@/lib/prisma";

export interface DoctorSidebarData {
  name: string;
  facilityName: string;
}

export async function getDoctorSidebarData(userId: string): Promise<DoctorSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
  };
}
