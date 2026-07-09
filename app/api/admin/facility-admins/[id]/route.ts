import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateFacilityAdminSchema } from "@/lib/validations/admin";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admin = await prisma.superAdmin.findUnique({
    where: { id: params.id },
    include: { facility: { select: { id: true, name: true } } },
  });
  if (!admin || admin.facilityId === null) {
    return NextResponse.json({ success: false, error: "Facility Admin not found." }, { status: 404 });
  }

  const auditLogs = await prisma.auditLog.findMany({
    where: { entityType: "SuperAdmin", entityId: admin.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: admin.id,
      phone: admin.phone,
      facilityId: admin.facilityId,
      facilityName: admin.facility?.name ?? null,
      isActive: admin.isActive,
      hasPassword: Boolean(admin.passwordHash),
      createdAt: admin.createdAt,
      auditLogs: auditLogs.map((l) => ({ id: l.id, action: l.action, createdAt: l.createdAt })),
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateFacilityAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.superAdmin.findUnique({ where: { id: params.id } });
  if (!existing || existing.facilityId === null) {
    return NextResponse.json({ success: false, error: "Facility Admin not found." }, { status: 404 });
  }

  if (parsed.data.facilityId) {
    const facility = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId } });
    if (!facility || !facility.isActive) {
      return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
    }
  }

  const admin = await prisma.superAdmin.update({ where: { id: params.id }, data: parsed.data });

  const action =
    parsed.data.isActive === false
      ? "FACILITY_ADMIN_DEACTIVATED"
      : parsed.data.isActive === true
        ? "FACILITY_ADMIN_REACTIVATED"
        : parsed.data.facilityId
          ? "FACILITY_ADMIN_FACILITY_CHANGED"
          : "FACILITY_ADMIN_UPDATED";

  await logAudit({
    actorLabel: "Super Admin",
    action,
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: admin });
}
