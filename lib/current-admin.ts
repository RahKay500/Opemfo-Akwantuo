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
  phone: string;
  facilityId: string | null;
}

// Wrapped in React's cache() so the Sidebar (via layout.tsx) and Header
// (rendered separately per page) share one DB lookup per request instead of
// each querying the SuperAdmin table on their own.
export const getCurrentAdminIdentity = cache(async (): Promise<AdminIdentity | null> => {
  const session = await getAdminSession();
  if (!session) return null;

  const admin = await prisma.superAdmin.findUnique({
    where: { id: session.sub },
    select: { name: true, orgName: true, district: true, region: true, phone: true, facilityId: true },
  });
  return admin;
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
