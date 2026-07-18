import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateStaffSchema } from "@/lib/validations/admin";
import { countPatientsRegisteredBy, deleteStaffCascade } from "@/lib/staff-cascade-delete";

// A Facility Admin (session.facilityId set) may only act on their own
// facility's staff. The Platform Super Admin (facilityId: null) has
// oversight of any facility's staff — needed e.g. right after deleting that
// facility's only admin, when no one else can reach these routes at all.
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const staff = await prisma.user.findUnique({
    where: { id: params.id },
    include: { facility: { select: { id: true, name: true } } },
  });
  if (
    !staff ||
    (staff.role !== "MIDWIFE" && staff.role !== "DOCTOR") ||
    (session.facilityId !== null && staff.facilityId !== session.facilityId)
  ) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }

  const [auditLogs, patientCount] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: "User", entityId: staff.id },
      orderBy: { createdAt: "desc" },
    }),
    countPatientsRegisteredBy(staff.id),
  ]);

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
      patientCount,
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
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (
    !existing ||
    (existing.role !== "MIDWIFE" && existing.role !== "DOCTOR") ||
    (session.facilityId !== null && existing.facilityId !== session.facilityId)
  ) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }

  const staff = await prisma.user.update({ where: { id: params.id }, data: parsed.data });

  const action =
    parsed.data.isActive === false
      ? "STAFF_DEACTIVATED"
      : parsed.data.isActive === true
        ? "STAFF_REACTIVATED"
        : "STAFF_UPDATED";

  await logAudit({
    actorLabel: "Super Admin",
    facilityId: existing.facilityId,
    action,
    entityType: "User",
    entityId: staff.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: staff });
}

// Hard delete — also permanently deletes every patient this staff member
// registered, and all of those patients' clinical records (visits,
// referrals, vaccinations, delivery records, etc.). Distinct from PUT
// { isActive: false }, which only revokes portal access. Scoped only to data
// this staff member's own registered patients own; see
// lib/staff-cascade-delete.ts for why the staff row itself may survive if
// it's still referenced by an unrelated patient's records.
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (
    !existing ||
    (existing.role !== "MIDWIFE" && existing.role !== "DOCTOR") ||
    (session.facilityId !== null && existing.facilityId !== session.facilityId)
  ) {
    return NextResponse.json({ success: false, error: "Staff member not found." }, { status: 404 });
  }

  const result = await deleteStaffCascade(params.id);

  await logAudit({
    actorLabel: "Super Admin",
    facilityId: existing.facilityId,
    action: "STAFF_DELETED",
    entityType: "User",
    entityId: params.id,
    metadata: { phone: existing.phone, ...result },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: result });
}
