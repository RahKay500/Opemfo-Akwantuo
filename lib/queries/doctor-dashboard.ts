import { prisma } from "@/lib/prisma";
import type { Priority } from "@prisma/client";

export interface DoctorDashboardData {
  name: string;
  facilityName: string;
  stats: {
    activeShares: number;
    reviewed: number;
    flagged: number;
    facilities: number;
  };
  needsReview: {
    shareId: string;
    patientId: string;
    name: string;
    priority: Priority;
    reason: string;
    sharedAt: Date;
  }[];
  recentShares: {
    shareId: string;
    patientId: string;
    name: string;
    sharedByName: string;
    sharedAt: Date;
  }[];
}

export async function getDoctorDashboardData(userId: string): Promise<DoctorDashboardData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { facility: true } });
  if (!user) return null;

  const now = new Date();

  const [activeShares, reviewed, activeShareRows] = await Promise.all([
    prisma.referralShare.count({ where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: now } } }),
    prisma.referralShare.count({ where: { sharedWithDoctorId: userId, isActive: false } }),
    prisma.referralShare.findMany({
      where: { sharedWithDoctorId: userId, isActive: true, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          include: { visits: { orderBy: { createdAt: "desc" }, take: 1 }, facility: { select: { id: true, name: true } } },
        },
        sharedByNurse: { select: { name: true } },
      },
    }),
  ]);

  const facilities = new Set(activeShareRows.map((s) => s.patient?.facility.id).filter(Boolean)).size;

  const priorityRank: Record<Priority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const needsReview = activeShareRows
    .filter((s) => s.patient?.visits[0]?.flagged)
    .sort(
      (a, b) =>
        priorityRank[a.patient!.visits[0].flagPriority ?? "LOW"] - priorityRank[b.patient!.visits[0].flagPriority ?? "LOW"]
    )
    .slice(0, 5)
    .map((s) => ({
      shareId: s.id,
      patientId: s.patient!.id,
      name: s.patient!.name,
      priority: s.patient!.visits[0].flagPriority ?? "LOW",
      reason: s.patient!.visits[0].flagReason ?? "Flagged reading",
      sharedAt: s.createdAt,
    }));

  const recentShares = activeShareRows.slice(0, 5).map((s) => ({
    shareId: s.id,
    patientId: s.patient!.id,
    name: s.patient!.name,
    sharedByName: s.sharedByNurse.name,
    sharedAt: s.createdAt,
  }));

  return {
    name: user.name,
    facilityName: user.facility?.name ?? "",
    stats: { activeShares, reviewed, flagged: needsReview.length, facilities },
    needsReview,
    recentShares,
  };
}
