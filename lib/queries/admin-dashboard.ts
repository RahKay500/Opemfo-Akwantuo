import { prisma } from "@/lib/prisma";
import type { FacilityType, Role } from "@prisma/client";
import { isPlatformAdmin, type AdminSessionPayload } from "@/lib/admin-auth";
import { getVisibleFacilityIds } from "@/lib/current-admin";

export interface AdminDashboardData {
  // Populated for the Platform Super Admin tier only.
  platform: PlatformDashboardData | null;
  // Populated for the Facility Admin tier only.
  facility: FacilityAdminDashboardData | null;
  // Populated for the Regional/District Admin tiers only — a lighter
  // jurisdiction-scoped summary, not the full platform analytics view.
  jurisdiction: JurisdictionDashboardData | null;
}

export interface JurisdictionDashboardData {
  facilityCount: number;
  registeredPatients: number;
  activeStaff: number;
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

export interface FacilityAdminDashboardData {
  facilityName: string;
  totalStaff: number;
  activeStaff: number;
  totalPatients: number;
  patientsThisWeek: number;
  visitsThisMonth: number;
  pendingReferrals: number;
  staff: { id: string; name: string; role: Role; isActive: boolean }[];
  facilityInfo: { type: FacilityType; district: string; region: string; openedAt: Date | null };
}

async function getJurisdictionDashboardData(facilityIds: string[]): Promise<JurisdictionDashboardData> {
  const [registeredPatients, activeStaff] = await Promise.all([
    prisma.patient.count({ where: { facilityId: { in: facilityIds } } }),
    prisma.user.count({
      where: { role: { in: ["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"] }, isActive: true, facilityId: { in: facilityIds } },
    }),
  ]);
  return { facilityCount: facilityIds.length, registeredPatients, activeStaff };
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
    prisma.user.count({ where: { role: { in: ["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"] }, isActive: true } }),
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

async function getFacilityAdminDashboardData(facilityId: string): Promise<FacilityAdminDashboardData | null> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const staffWhere = { role: { in: ["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"] as Role[] }, facilityId };

  const [facility, totalStaff, activeStaff, totalPatients, patientsThisWeek, visitsThisMonth, pendingReferrals, staff] =
    await Promise.all([
      prisma.facility.findUnique({
        where: { id: facilityId },
        select: {
          name: true,
          type: true,
          openedAt: true,
          district: { select: { name: true, region: { select: { name: true } } } },
        },
      }),
      prisma.user.count({ where: staffWhere }),
      prisma.user.count({ where: { ...staffWhere, isActive: true } }),
      prisma.patient.count({ where: { facilityId } }),
      prisma.patient.count({ where: { facilityId, createdAt: { gte: sevenDaysAgo } } }),
      prisma.visit.count({ where: { patient: { facilityId }, createdAt: { gte: startOfMonth } } }),
      prisma.referral.count({ where: { fromFacilityId: facilityId, status: "SENT" } }),
      prisma.user.findMany({
        where: staffWhere,
        orderBy: { name: "asc" },
        take: 10,
        select: { id: true, name: true, role: true, isActive: true },
      }),
    ]);

  if (!facility) return null;

  return {
    facilityName: facility.name,
    totalStaff,
    activeStaff,
    totalPatients,
    patientsThisWeek,
    visitsThisMonth,
    pendingReferrals,
    staff,
    facilityInfo: {
      type: facility.type,
      district: facility.district.name,
      region: facility.district.region.name,
      openedAt: facility.openedAt,
    },
  };
}

export async function getAdminDashboardData(session: AdminSessionPayload): Promise<AdminDashboardData> {
  if (session.facilityId !== null) {
    const facility = await getFacilityAdminDashboardData(session.facilityId);
    return { platform: null, facility, jurisdiction: null };
  }

  if (isPlatformAdmin(session)) {
    const platform = await getPlatformDashboardData();
    return { platform, facility: null, jurisdiction: null };
  }

  // Regional or District Admin — a lighter jurisdiction-scoped summary
  // rather than the full platform-wide analytics view above.
  const facilityIds = await getVisibleFacilityIds(session);
  const jurisdiction = await getJurisdictionDashboardData(facilityIds ?? []);
  return { platform: null, facility: null, jurisdiction };
}
