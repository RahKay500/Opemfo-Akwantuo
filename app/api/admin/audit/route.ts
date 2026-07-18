import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import type { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const where: Prisma.AuditLogWhereInput = {
    // A Facility Admin only ever sees their own facility's staff-related
    // entries; the Platform Super Admin (facilityId null) sees everything.
    ...(session.facilityId !== null ? { facilityId: session.facilityId } : {}),
    ...(action ? { action } : {}),
    ...(from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { actor: { select: { name: true } } },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      total,
      page,
      pageSize,
      logs: logs.map((l) => ({
        id: l.id,
        createdAt: l.createdAt,
        actor: l.actor?.name ?? l.actorLabel ?? "Unknown",
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        metadata: l.metadata,
      })),
    },
  });
}

// Clears the audit trail — scoped the same way as GET: a Facility Admin can
// only clear their own facility's entries, never another facility's or
// platform-level ones; the Platform Super Admin clears everything. A single
// new entry is logged immediately after so there's a record of who cleared
// the log and when, rather than a silent, untraceable wipe.
export async function DELETE(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const where: Prisma.AuditLogWhereInput =
    session.facilityId !== null ? { facilityId: session.facilityId } : {};

  const { count } = await prisma.auditLog.deleteMany({ where });

  await logAudit({
    actorLabel: "Super Admin",
    facilityId: session.facilityId,
    action: "AUDIT_LOG_CLEARED",
    entityType: "AuditLog",
    entityId: "bulk",
    metadata: { clearedCount: count },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: { clearedCount: count } });
}
