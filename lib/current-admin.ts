import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken, type AdminSessionPayload } from "@/lib/admin-auth";

export async function isSuperAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

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
