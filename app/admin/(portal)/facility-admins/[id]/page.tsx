import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilityAdminDetailClient from "./FacilityAdminDetailClient";

export default async function AdminFacilityAdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  const { id } = await params;
  const [admin, facilities] = await Promise.all([
    prisma.superAdmin.findUnique({ where: { id }, include: { facility: { select: { name: true } } } }),
    prisma.facility.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!admin || admin.facilityId === null) notFound();

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "SuperAdmin", entityId: admin.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Facility Admin Detail" />
      <div className="px-4 py-6 lg:px-8">
        <FacilityAdminDetailClient
          admin={{
            id: admin.id,
            phone: admin.phone,
            facilityId: admin.facilityId,
            facilityName: admin.facility?.name ?? null,
            isActive: admin.isActive,
            hasPassword: Boolean(admin.passwordHash),
            createdAt: admin.createdAt.toISOString(),
            auditLogs: auditLogs.map((l) => ({
              id: l.id,
              action: l.action,
              createdAt: l.createdAt.toISOString(),
            })),
          }}
          facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
        />
      </div>
    </>
  );
}
