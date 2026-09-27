import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import RegionalAdminsClient from "./RegionalAdminsClient";

export default async function AdminRegionalAdminsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!isPlatformAdmin(session)) redirect("/admin/dashboard");

  const [admins, regions] = await Promise.all([
    prisma.superAdmin.findMany({
      where: { regionId: { not: null } },
      orderBy: { createdAt: "desc" },
      include: { regionScope: { select: { name: true } } },
    }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <Header title="Regional Admins" showSearch={false} />
      <div className="px-4 py-6 lg:px-8">
        <RegionalAdminsClient
          admins={admins.map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            phone: a.phone,
            regionId: a.regionId,
            regionName: a.regionScope?.name ?? null,
            isActive: a.isActive,
            hasPassword: Boolean(a.passwordHash),
            createdAt: a.createdAt.toISOString(),
            lastLoginAt: a.lastLoginAt ? a.lastLoginAt.toISOString() : null,
          }))}
          regions={regions.map((r) => ({ id: r.id, name: r.name }))}
        />
      </div>
    </>
  );
}
