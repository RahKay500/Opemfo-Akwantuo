import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilityAdminsClient from "./FacilityAdminsClient";

// Platform manages Facility Admins everywhere; a District Admin manages
// them only within their own district (a Regional Admin does not — they
// manage District Admins one level down, not facility staff directly).
export default async function AdminFacilityAdminsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!isPlatformAdmin(session) && session.districtId === null) redirect("/admin/dashboard");

  const facilityWhere = session.districtId !== null ? { districtId: session.districtId } : {};

  const [admins, facilities] = await Promise.all([
    prisma.superAdmin.findMany({
      where: { facilityId: { not: null }, facility: facilityWhere },
      orderBy: { createdAt: "desc" },
      include: { facility: { select: { name: true } } },
    }),
    prisma.facility.findMany({ where: { isActive: true, ...facilityWhere }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Header title="Facility Admins" showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <FacilityAdminsClient
          admins={admins.map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            phone: a.phone,
            facilityId: a.facilityId,
            facilityName: a.facility?.name ?? null,
            isActive: a.isActive,
            hasPassword: Boolean(a.passwordHash),
            createdAt: a.createdAt.toISOString(),
            lastLoginAt: a.lastLoginAt ? a.lastLoginAt.toISOString() : null,
          }))}
          facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
        />
      </div>
    </>
  );
}
