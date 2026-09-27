import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import DistrictAdminsClient from "./DistrictAdminsClient";

// Platform manages District Admins everywhere; a Regional Admin manages
// them only within their own region.
export default async function AdminDistrictAdminsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const platform = isPlatformAdmin(session);
  if (!platform && session.regionId === null) redirect("/admin/dashboard");

  const [admins, regions] = await Promise.all([
    prisma.superAdmin.findMany({
      where: {
        districtId: { not: null },
        ...(session.regionId !== null ? { districtScope: { regionId: session.regionId } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { districtScope: { select: { name: true, region: { select: { name: true } } } } },
    }),
    prisma.region.findMany({
      where: session.regionId !== null ? { id: session.regionId } : {},
      orderBy: { name: "asc" },
      include: { districts: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
    }),
  ]);

  return (
    <>
      <Header title="District Admins" showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <DistrictAdminsClient
          admins={admins.map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            phone: a.phone,
            districtId: a.districtId,
            districtName: a.districtScope?.name ?? null,
            regionName: a.districtScope?.region.name ?? null,
            isActive: a.isActive,
            hasPassword: Boolean(a.passwordHash),
            createdAt: a.createdAt.toISOString(),
            lastLoginAt: a.lastLoginAt ? a.lastLoginAt.toISOString() : null,
          }))}
          regions={regions.map((r) => ({
            id: r.id,
            name: r.name,
            districts: r.districts.map((d) => ({ id: d.id, name: d.name })),
          }))}
        />
      </div>
    </>
  );
}
