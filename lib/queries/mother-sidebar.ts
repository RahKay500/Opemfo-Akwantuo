import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";
import { getMotherUnreadMessageCount } from "@/lib/queries/mother-conversations";

export interface MotherSidebarData {
  name: string;
  week: number | null;
  dueDate: Date | null;
  progressPercent: number | null;
  unreadCount: number;
  unreadMessagesCount: number;
}

export async function getMotherSidebarData(userId: string): Promise<MotherSidebarData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const [unreadCount, unreadMessagesCount] = await Promise.all([
    prisma.notification.count({ where: { userId, isRead: false } }),
    getMotherUnreadMessageCount(userId),
  ]);
  const pregnancy = patient.lmp ? calculatePregnancyProgress(patient.lmp) : null;

  return {
    name: patient.name,
    week: pregnancy?.week ?? null,
    dueDate: patient.edd,
    progressPercent: pregnancy?.progressPercent ?? null,
    unreadCount,
    unreadMessagesCount,
  };
}
