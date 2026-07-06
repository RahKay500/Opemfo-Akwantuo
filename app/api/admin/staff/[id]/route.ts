import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateStaffSchema } from "@/lib/validations/admin";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const staff = await prisma.user.findUnique({
    where: { id: params.id },
    include: { facility: { select: { id: true, name: true } } },
  });
  if (!staff || (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR")) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "User", entityId: staff.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: staff.id,
      name: staff.name,
      phone: staff.phone,
      role: staff.role,
      facilityId: staff.facilityId,
      facilityName: staff.facility?.name ?? null,
      licenseNumber: staff.licenseNumber,
      isActive: staff.isActive,
      hasPassword: Boolean(staff.passwordHash),
      createdAt: staff.createdAt,
      auditLogs: auditLogs.map((l) => ({
        id: l.id,
        action: l.action,
        createdAt: l.createdAt,
        metadata: l.metadata,
      })),
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing || (existing.role !== "MIDWIFE" && existing.role !== "DOCTOR")) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }

  if (parsed.data.facilityId) {
    const facility = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId } });
    if (!facility || !facility.isActive) {
      return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
    }
  }

  const staff = await prisma.user.update({ where: { id: params.id }, data: parsed.data });

  const action =
    parsed.data.isActive === false
      ? "STAFF_DEACTIVATED"
      : parsed.data.isActive === true
        ? "STAFF_REACTIVATED"
        : parsed.data.facilityId
          ? "STAFF_FACILITY_CHANGED"
          : "STAFF_UPDATED";

  await logAudit({
    actorLabel: "Super Admin",
    action,
    entityType: "User",
    entityId: staff.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: staff });
}
