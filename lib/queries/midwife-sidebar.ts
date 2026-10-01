import { prisma } from "@/lib/prisma";
import { getUnreadConversationCount } from "@/lib/queries/staff-conversations";

export interface MidwifeSidebarData {
  name: string;
  facilityName: string;
  activeEmergency: { patientId: string; patientName: string } | null;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
}

export async function getMidwifeSidebarData(userId: string): Promise<MidwifeSidebarData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user || !user.facilityId || !user.facility) return null;

  const [activeEmergencyAlert, unreadMessagesCount, unreadNotificationsCount] = await Promise.all([
    prisma.emergencyAlert.findFirst({
      where: { isActive: true, patient: { facilityId: user.facilityId } },
      orderBy: { triggeredAt: "desc" },
      include: { patient: { select: { id: true, name: true } } },
    }),
    getUnreadConversationCount(userId, "MIDWIFE"),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    name: user.name,
    facilityName: user.facility.name,
    activeEmergency: activeEmergencyAlert
      ? { patientId: activeEmergencyAlert.patient.id, patientName: activeEmergencyAlert.patient.name }
      : null,
    unreadMessagesCount,
    unreadNotificationsCount,
  };
}
