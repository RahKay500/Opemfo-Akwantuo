import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE_NAME, verifyAdminToken, type AdminSessionPayload } from "@/lib/admin-auth";

export async function isSuperAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export interface AdminIdentity {
  name: string | null;
  orgName: string | null;
  district: string | null;
  region: string | null;
  phone: string | null;
  facilityId: string | null;
  districtId: string | null;
  regionId: string | null;
}

// Wrapped in React's cache() so the Sidebar (via layout.tsx) and Header
// (rendered separately per page) share one DB lookup per request instead of
// each querying the SuperAdmin table on their own.
//
// A Facility/District/Regional Admin is always tied to exactly one real
// Facility/District/Region row, so their org/district/region are derived
// from that row (real data) rather than the free-text fields meant for the
// Platform Super Admin, who has no single jurisdiction to derive them from.
export const getCurrentAdminIdentity = cache(async (): Promise<AdminIdentity | null> => {
  const session = await getAdminSession();
  if (!session) return null;

  const admin = await prisma.superAdmin.findUnique({
    where: { id: session.sub },
    select: {
      name: true,
      orgName: true,
      district: true,
      region: true,
      phone: true,
      facilityId: true,
      districtId: true,
      regionId: true,
      facility: { select: { name: true, district: { select: { name: true, region: { select: { name: true } } } } } },
      districtScope: { select: { name: true, region: { select: { name: true } } } },
      regionScope: { select: { name: true } },
    },
  });
  if (!admin) return null;

  if (admin.facility) {
    return {
      name: admin.name,
      orgName: `${admin.facility.name} · Facility Admin`,
      district: admin.facility.district.name,
      region: admin.facility.district.region.name,
      phone: admin.phone,
      facilityId: admin.facilityId,
      districtId: admin.districtId,
      regionId: admin.regionId,
    };
  }
  if (admin.districtScope) {
    return {
      name: admin.name,
      orgName: `${admin.districtScope.name} · District Admin`,
      district: admin.districtScope.name,
      region: admin.districtScope.region.name,
      phone: admin.phone,
      facilityId: admin.facilityId,
      districtId: admin.districtId,
      regionId: admin.regionId,
    };
  }
  if (admin.regionScope) {
    return {
      name: admin.name,
      orgName: `${admin.regionScope.name} · Regional Admin`,
      district: null,
      region: admin.regionScope.name,
      phone: admin.phone,
      facilityId: admin.facilityId,
      districtId: admin.districtId,
      regionId: admin.regionId,
    };
  }
  return {
    name: admin.name,
    orgName: admin.orgName,
    district: admin.district,
    region: admin.region,
    phone: admin.phone,
    facilityId: admin.facilityId,
    districtId: admin.districtId,
    regionId: admin.regionId,
  };
});

// Richer accessor for pages that need to branch on which admin tier is
// logged in — facilityId null is the Platform Super Admin, set is a Facility
// Admin scoped to that facility.
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

// Resolves the set of Facility ids a session's jurisdiction can see:
// undefined = no filter (Platform Super Admin sees everything), otherwise
// the exact list of facility ids to filter a query by. Replaces the old
// single-facilityId-or-nothing branching now that a Region/District Admin's
// jurisdiction can span many facilities.
export async function getVisibleFacilityIds(session: AdminSessionPayload): Promise<string[] | undefined> {
  if (session.facilityId !== null) return [session.facilityId];

  if (session.districtId !== null) {
    const facilities = await prisma.facility.findMany({
      where: { districtId: session.districtId },
      select: { id: true },
    });
    return facilities.map((f) => f.id);
  }

  if (session.regionId !== null) {
    const facilities = await prisma.facility.findMany({
      where: { district: { regionId: session.regionId } },
      select: { id: true },
    });
    return facilities.map((f) => f.id);
  }

  return undefined;
}
