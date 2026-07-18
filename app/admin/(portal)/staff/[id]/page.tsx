import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import { countPatientsRegisteredBy } from "@/lib/staff-cascade-delete";
import Header from "@/components/admin/Header";
import StaffDetailClient from "./StaffDetailClient";

export default async function AdminStaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const staff = await prisma.user.findUnique({ where: { id }, include: { facility: { select: { name: true } } } });

  // A Facility Admin only ever sees their own facility's staff; the Platform
  // Super Admin has oversight of any facility's staff (needed e.g. right
  // after deleting that facility's only admin, when no one else can reach
  // this page at all).
  const isPlatform = session.facilityId === null;
  if (!staff || (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR")) notFound();
  if (!isPlatform && staff.facilityId !== session.facilityId) notFound();

  const [auditLogs, patientCount] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: "User", entityId: staff.id },
      orderBy: { createdAt: "desc" },
    }),
    countPatientsRegisteredBy(staff.id),
  ]);

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
            patientCount,
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
