import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin, type AdminSessionPayload } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateFacilityAdminSchema } from "@/lib/validations/admin";

// A District Admin can only see a Facility Admin whose facility is inside
// their own district — never trust the id path param alone for scoping.
function isOutOfJurisdiction(session: AdminSessionPayload, facilityDistrictId: string | null): boolean {
  return session.districtId !== null && facilityDistrictId !== session.districtId;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.districtId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const admin = await prisma.superAdmin.findUnique({
    where: { id: params.id },
    include: { facility: { select: { id: true, name: true, districtId: true } } },
  });
  if (!admin || admin.facilityId === null || isOutOfJurisdiction(session, admin.facility?.districtId ?? null)) {
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
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      facilityId: admin.facilityId,
      facilityName: admin.facility?.name ?? null,
      isActive: admin.isActive,
      hasPassword: Boolean(admin.passwordHash),
      createdAt: admin.createdAt,
      lastLoginAt: admin.lastLoginAt,
      auditLogs: auditLogs.map((l) => ({ id: l.id, action: l.action, createdAt: l.createdAt })),
    },
  });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.districtId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateFacilityAdminSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.superAdmin.findUnique({
    where: { id: params.id },
    include: { facility: { select: { districtId: true } } },
  });
  if (
    !existing ||
    existing.facilityId === null ||
    isOutOfJurisdiction(session, existing.facility?.districtId ?? null)
  ) {
    return NextResponse.json({ success: false, error: "Facility Admin not found." }, { status: 404 });
  }

  if (parsed.data.facilityId) {
    const facility = await prisma.facility.findUnique({ where: { id: parsed.data.facilityId } });
    if (!facility || !facility.isActive || isOutOfJurisdiction(session, facility.districtId)) {
      return NextResponse.json({ success: false, error: "Selected facility is not available." }, { status: 400 });
    }
  }

  const admin = await prisma.superAdmin.update({
    where: { id: params.id },
    data: { ...parsed.data, email: parsed.data.email === "" ? null : parsed.data.email },
  });

  const action =
    parsed.data.isActive === false
      ? "FACILITY_ADMIN_DEACTIVATED"
      : parsed.data.isActive === true
        ? "FACILITY_ADMIN_REACTIVATED"
        : parsed.data.facilityId
          ? "FACILITY_ADMIN_FACILITY_CHANGED"
          : "FACILITY_ADMIN_UPDATED";

  await logAudit({
    actorLabel: isPlatformAdmin(session) ? "Super Admin" : "District Admin",
    action,
    entityType: "SuperAdmin",
    entityId: admin.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: admin });
}

// Hard delete — distinct from PUT { isActive: false }, which just revokes
// portal access while keeping the account (and its audit trail) around.
// Deleting removes the row entirely, e.g. to clean up an account created by
// mistake or for testing. The audit trail is deleted alongside it since it's
// keyed to this account's id and would otherwise be orphaned.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || (!isPlatformAdmin(session) && session.districtId === null)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const existing = await prisma.superAdmin.findUnique({
    where: { id: params.id },
    include: { facility: { select: { districtId: true } } },
  });
  if (
    !existing ||
    existing.facilityId === null ||
    isOutOfJurisdiction(session, existing.facility?.districtId ?? null)
  ) {
    return NextResponse.json({ success: false, error: "Facility Admin not found." }, { status: 404 });
  }

  await prisma.auditLog.deleteMany({ where: { entityType: "SuperAdmin", entityId: params.id } });
  await prisma.superAdmin.delete({ where: { id: params.id } });

  await logAudit({
    actorLabel: isPlatformAdmin(session) ? "Super Admin" : "District Admin",
    action: "FACILITY_ADMIN_DELETED",
    entityType: "SuperAdmin",
    entityId: params.id,
    metadata: { phone: existing.phone, facilityId: existing.facilityId },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true });
}
