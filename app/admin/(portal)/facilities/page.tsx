import { redirect } from "next/navigation";
import { getAdminSession, getCurrentAdminIdentity } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilitiesClient from "./FacilitiesClient";

export default async function AdminFacilitiesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const [facilities, facilityAdmins] = await Promise.all([
    prisma.facility.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { users: true, patients: true } } },
    }),
    prisma.superAdmin.findMany({
      where: { facilityId: { not: null } },
      select: { facilityId: true, name: true },
    }),
  ]);
  const adminByFacility = new Map(facilityAdmins.map((a) => [a.facilityId, a.name]));

  return (
    <>
      <Header title="Facilities" subtitle={(await getCurrentAdminIdentity())?.orgName} />
      <div className="px-4 py-6 lg:px-8">
        <FacilitiesClient
          facilities={facilities.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            region: f.region,
            district: f.district,
            phone: f.phone,
            isActive: f.isActive,
            staffCount: f._count.users,
            patientCount: f._count.patients,
            adminName: adminByFacility.get(f.id) ?? null,
          }))}
        />
      </div>
    </>
  );
}
