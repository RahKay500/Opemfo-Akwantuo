import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface AdminDashboardData {
  // null when facility-scoped — a Facility Admin has no reason to see a
  // platform-wide facility count, and the facility's own name is shown in
  // the page header instead.
  totalFacilities: number | null;
  facilityName: string | null;
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

// facilityId null = Platform Super Admin (platform-wide stats); set = a
// Facility Admin, scoped to just their own facility's staff.
export async function getAdminDashboardData(facilityId: string | null): Promise<AdminDashboardData> {
  const staffWhere = facilityId ? { facilityId } : {};

  const [totalFacilities, facility, totalNurses, totalDoctors, pendingActivation, recent] = await Promise.all([
    facilityId ? Promise.resolve(null) : prisma.facility.count(),
    facilityId ? prisma.facility.findUnique({ where: { id: facilityId }, select: { name: true } }) : null,
    prisma.user.count({ where: { role: "MIDWIFE", ...staffWhere } }),
    prisma.user.count({ where: { role: "DOCTOR", ...staffWhere } }),
    prisma.user.count({
      where: { role: { in: ["MIDWIFE", "DOCTOR"] }, isActive: false, passwordHash: null, ...staffWhere },
    }),
    prisma.user.findMany({
      where: { role: { in: ["MIDWIFE", "DOCTOR"] }, ...staffWhere },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { facility: { select: { name: true } } },
    }),
  ]);

  return {
    totalFacilities,
    facilityName: facility?.name ?? null,
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
