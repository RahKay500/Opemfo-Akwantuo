import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilitiesClient from "./FacilitiesClient";

// Platform sees and can create/edit every facility. A District Admin sees
// and can edit only facilities in their own district; a Regional Admin the
// same for their region. Creating a brand-new facility stays Platform-only.
export default async function AdminFacilitiesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const platform = isPlatformAdmin(session);
  if (!platform && session.districtId === null && session.regionId === null) redirect("/admin/dashboard");

  const facilityWhere = {
    ...(session.districtId !== null ? { districtId: session.districtId } : {}),
    ...(session.regionId !== null ? { district: { regionId: session.regionId } } : {}),
  };

  const [facilities, facilityAdmins, regions] = await Promise.all([
    prisma.facility.findMany({
      where: facilityWhere,
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true, patients: true } },
        district: { select: { id: true, name: true, region: { select: { name: true } } } },
      },
    }),
    prisma.superAdmin.findMany({
      where: { facilityId: { not: null } },
      select: { facilityId: true, name: true },
    }),
    // Only Platform can reassign a facility's district (see the PUT route),
    // so this is the one piece of data only they need — skip the query for
    // everyone else.
    platform
      ? prisma.region.findMany({
          orderBy: { name: "asc" },
          include: { districts: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);
  const adminByFacility = new Map(facilityAdmins.map((a) => [a.facilityId, a.name]));

  return (
    <>
      <Header title="Facilities" showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <FacilitiesClient
          canCreate={platform}
          regions={regions.map((r) => ({
            id: r.id,
            name: r.name,
            districts: r.districts.map((d) => ({ id: d.id, name: d.name })),
          }))}
          facilities={facilities.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            districtId: f.districtId,
            district: f.district.name,
            region: f.district.region.name,
            phone: f.phone,
            isActive: f.isActive,
            staffCount: f._count.users,
            patientCount: f._count.patients,
            adminName: adminByFacility.get(f.id) ?? null,
            openedAt: f.openedAt ? f.openedAt.toISOString() : null,
          }))}
        />
      </div>
    </>
  );
}
