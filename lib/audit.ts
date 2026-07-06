import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  // Exactly one of these identifies who performed the action: a real user
  // (actorId) or a non-User actor like the Super Admin portal (actorLabel).
  actorId?: string;
  actorLabel?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

export async function logAudit(params: AuditParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      actorLabel: params.actorLabel,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata,
      ipAddress: params.ipAddress ?? null,
    },
  });
}
