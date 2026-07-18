import { prisma } from "@/lib/prisma";
import type { FacilityType, Role } from "@prisma/client";

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
  // Populated for the Platform Super Admin tier only (facilityId: null).
  platform: PlatformDashboardData | null;
}

export interface PlatformDashboardData {
  totalFacilities: number;
  facilitiesThisQuarter: number;
  registeredPatients: number;
  registeredPatientsThisMonth: number;
  activeStaff: number;
  facilityAdminsCount: number;
  unassignedFacilities: { id: string; name: string }[];
  patientGrowth: { label: string; count: number }[];
  facilitiesOverview: {
    id: string;
    name: string;
    type: FacilityType;
    adminName: string | null;
    staffCount: number;
    patientCount: number;
    isActive: boolean;
  }[];
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

async function getPlatformDashboardData(): Promise<PlatformDashboardData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  // Cumulative patient count as of the end of each of the last 6 months —
  // matches "Patient Growth" being a running total, not a per-month delta.
  const monthEnds: { label: string; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const label = MONTH_LABELS[(now.getMonth() - i + 12) % 12];
    monthEnds.push({ label, end });
  }

  const [
    totalFacilities,
    facilitiesThisQuarter,
    registeredPatients,
    registeredPatientsThisMonth,
    activeStaff,
    facilityAdmins,
    facilities,
    patientGrowthCounts,
  ] = await Promise.all([
    prisma.facility.count(),
    prisma.facility.count({ where: { createdAt: { gte: startOfQuarter } } }),
    prisma.patient.count(),
    prisma.patient.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count({ where: { role: { in: ["MIDWIFE", "DOCTOR"] }, isActive: true } }),
    prisma.superAdmin.findMany({
      where: { facilityId: { not: null } },
      select: { facilityId: true, name: true, isActive: true },
    }),
    prisma.facility.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true, patients: true } } },
    }),
    Promise.all(monthEnds.map(({ end }) => prisma.patient.count({ where: { createdAt: { lt: end } } }))),
  ]);

  const assignedFacilityIds = new Set(facilityAdmins.map((a) => a.facilityId));
  const adminByFacility = new Map(facilityAdmins.map((a) => [a.facilityId, a.name]));

  return {
    totalFacilities,
    facilitiesThisQuarter,
    registeredPatients,
    registeredPatientsThisMonth,
    activeStaff,
    facilityAdminsCount: facilityAdmins.length,
    unassignedFacilities: facilities
      .filter((f) => !assignedFacilityIds.has(f.id))
      .map((f) => ({ id: f.id, name: f.name })),
    patientGrowth: monthEnds.map(({ label }, i) => ({ label, count: patientGrowthCounts[i] })),
    facilitiesOverview: facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      adminName: adminByFacility.get(f.id) ?? null,
      staffCount: f._count.users,
      patientCount: f._count.patients,
      isActive: f.isActive,
    })),
  };
}

// facilityId null = Platform Super Admin (platform-wide stats); set = a
// Facility Admin, scoped to just their own facility's staff.
export async function getAdminDashboardData(facilityId: string | null): Promise<AdminDashboardData> {
  const staffWhere = facilityId ? { facilityId } : {};

  const [totalFacilities, facility, totalNurses, totalDoctors, pendingActivation, recent, platform] =
    await Promise.all([
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
      facilityId ? Promise.resolve(null) : getPlatformDashboardData(),
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
    platform,
  };
}
