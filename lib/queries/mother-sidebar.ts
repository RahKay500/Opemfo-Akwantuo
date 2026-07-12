import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";

export interface MotherSidebarData {
  name: string;
  week: number | null;
  dueDate: Date | null;
  progressPercent: number | null;
  unreadCount: number;
}

export async function getMotherSidebarData(userId: string): Promise<MotherSidebarData | null> {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) return null;

  const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } });
  const pregnancy = patient.lmp ? calculatePregnancyProgress(patient.lmp) : null;

  return {
    name: patient.name,
    week: pregnancy?.week ?? null,
    dueDate: patient.edd,
    progressPercent: pregnancy?.progressPercent ?? null,
    unreadCount,
  };
}
