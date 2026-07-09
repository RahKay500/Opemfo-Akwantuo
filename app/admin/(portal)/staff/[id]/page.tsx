import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import StaffDetailClient from "./StaffDetailClient";

export default async function AdminStaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId === null) redirect("/admin/dashboard");

  const { id } = await params;
  const staff = await prisma.user.findUnique({ where: { id }, include: { facility: { select: { name: true } } } });

  if (!staff || (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR") || staff.facilityId !== session.facilityId) {
    notFound();
  }

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
        />
      </div>
    </>
  );
}
