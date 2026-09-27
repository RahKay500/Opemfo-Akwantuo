import { redirect } from "next/navigation";
import { getAdminSession, getVisibleFacilityIds } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import AuditClient from "./AuditClient";

export default async function AdminAuditPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const visibleFacilityIds = await getVisibleFacilityIds(session);

  const logs = await prisma.auditLog.findMany({
    // A Facility Admin only ever sees their own facility's staff-related
    // entries; a Regional/District Admin sees entries for facilities in
    // their jurisdiction; the Platform Super Admin sees everything
    // (facility-scoped entries only exist for staff-related actions — see
    // AuditLog.facilityId's own comment in schema.prisma).
    where: isPlatformAdmin(session) ? {} : { facilityId: { in: visibleFacilityIds ?? [] } },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { actor: { select: { name: true } } },
  });

  const actions = Array.from(new Set(logs.map((l) => l.action))).sort();

  return (
    <>
      <Header title="Audit Log" />
      <div className="px-4 py-6 lg:px-8">
        <AuditClient
          logs={logs.map((l) => ({
            id: l.id,
            createdAt: l.createdAt.toISOString(),
            actor: l.actor?.name ?? l.actorLabel ?? "Unknown",
            action: l.action,
            entityType: l.entityType,
            entityId: l.entityId,
          }))}
          actions={actions}
        />
      </div>
    </>
  );
}
