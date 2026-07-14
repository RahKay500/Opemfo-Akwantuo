import { prisma } from "@/lib/prisma";

export interface MidwifeSidebarData {
  name: string;
  facilityName: string;
  activeEmergency: { patientId: string; patientName: string } | null;
}

export async function getMidwifeSidebarData(userId: string): Promise<MidwifeSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const activeEmergencyAlert = await prisma.emergencyAlert.findFirst({
    where: { isActive: true, patient: { facilityId: user.facilityId } },
    orderBy: { triggeredAt: "desc" },
    include: { patient: { select: { id: true, name: true } } },
  });

  return {
    name: user.name,
    facilityName: user.facility.name,
    activeEmergency: activeEmergencyAlert
      ? { patientId: activeEmergencyAlert.patient.id, patientName: activeEmergencyAlert.patient.name }
      : null,
  };
}
