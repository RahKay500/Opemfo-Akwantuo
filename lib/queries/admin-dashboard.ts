import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface AdminDashboardData {
  totalFacilities: number;
  totalNurses: number;
  totalDoctors: number;
  pendingActivation: number;
  recentActivity: {
    id: string;
    name: string;
    role: Role;
    facilityName: string | null;
    createdAt: Date;
    isActive: boolean;
    hasPassword: boolean;
  }[];
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [totalFacilities, totalNurses, totalDoctors, pendingActivation, recent] = await Promise.all([
    prisma.facility.count(),
    prisma.user.count({ where: { role: "MIDWIFE" } }),
    prisma.user.count({ where: { role: "DOCTOR" } }),
    prisma.user.count({ where: { role: { in: ["MIDWIFE", "DOCTOR"] }, isActive: false, passwordHash: null } }),
    prisma.user.findMany({
      where: { role: { in: ["MIDWIFE", "DOCTOR"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { facility: { select: { name: true } } },
    }),
  ]);

  return {
    totalFacilities,
    totalNurses,
    totalDoctors,
    pendingActivation,
    recentActivity: recent.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      facilityName: u.facility?.name ?? null,
      createdAt: u.createdAt,
      isActive: u.isActive,
      hasPassword: Boolean(u.passwordHash),
    })),
  };
}
