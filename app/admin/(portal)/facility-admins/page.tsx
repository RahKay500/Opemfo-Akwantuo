import { redirect } from "next/navigation";
import { getAdminSession, getCurrentAdminIdentity } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilityAdminsClient from "./FacilityAdminsClient";

export default async function AdminFacilityAdminsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const [admins, identity] = await Promise.all([
    prisma.superAdmin.findMany({
      where: { facilityId: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { facility: { select: { name: true } } },
    }),
    getCurrentAdminIdentity(),
  ]);

  return (
    <>
      <Header title="Facility Admins" subtitle={identity?.orgName} />
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
        />
      </div>
    </>
  );
}
