import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import AuditClient from "./AuditClient";

export default async function AdminAuditPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { actor: { select: { name: true } } },
  });

  const actions = Array.from(new Set(logs.map((l) => l.action))).sort();

  return (
    <>
      <Header title="Audit Log" />
      <div className="px-8 py-6">
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
