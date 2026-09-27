import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import FacilityAdminDetailClient from "./FacilityAdminDetailClient";

export default async function AdminFacilityAdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!isPlatformAdmin(session) && session.districtId === null) redirect("/admin/dashboard");

  const facilityWhere = session.districtId !== null ? { districtId: session.districtId } : {};

  const { id } = await params;
  const [admin, facilities] = await Promise.all([
    prisma.superAdmin.findUnique({ where: { id }, include: { facility: { select: { name: true, districtId: true } } } }),
    prisma.facility.findMany({ where: { isActive: true, ...facilityWhere }, orderBy: { name: "asc" } }),
  ]);

  // A District Admin can only view Facility Admins for facilities inside
  // their own district — not just any facility-admin id.
  if (!admin || admin.facilityId === null) notFound();
  if (session.districtId !== null && admin.facility?.districtId !== session.districtId) notFound();

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
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            facilityId: admin.facilityId,
            facilityName: admin.facility?.name ?? null,
            isActive: admin.isActive,
            hasPassword: Boolean(admin.passwordHash),
            createdAt: admin.createdAt.toISOString(),
            lastLoginAt: admin.lastLoginAt ? admin.lastLoginAt.toISOString() : null,
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
