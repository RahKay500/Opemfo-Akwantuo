import { notFound, redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import StaffDetailClient from "./StaffDetailClient";

export default async function AdminStaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  const { id } = await params;
  const [staff, facilities] = await Promise.all([
    prisma.user.findUnique({ where: { id }, include: { facility: { select: { name: true } } } }),
    prisma.facility.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!staff || (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR")) notFound();

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "User", entityId: staff.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header title="Staff Detail" />
      <div className="px-4 py-6 lg:px-8">
        <StaffDetailClient
          staff={{
            id: staff.id,
            name: staff.name,
            phone: staff.phone,
            role: staff.role as "MIDWIFE" | "DOCTOR",
            facilityId: staff.facilityId,
            facilityName: staff.facility?.name ?? null,
            licenseNumber: staff.licenseNumber,
            isActive: staff.isActive,
            hasPassword: Boolean(staff.passwordHash),
            createdAt: staff.createdAt.toISOString(),
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
