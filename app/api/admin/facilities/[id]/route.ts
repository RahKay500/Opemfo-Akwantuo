import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { updateFacilitySchema } from "@/lib/validations/admin";

// Platform can edit any facility; a District/Regional Admin can edit only
// facilities inside their own district/region (view access extends to edit
// here — creating a brand-new facility stays Platform-only, see the sibling
// POST in ../route.ts).
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateFacilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.facility.findUnique({
    where: { id: params.id },
    include: { district: { select: { regionId: true } } },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Facility not found." }, { status: 404 });
  }
  const outOfJurisdiction =
    !isPlatformAdmin(session) &&
    ((session.districtId !== null && existing.districtId !== session.districtId) ||
      (session.regionId !== null && existing.district.regionId !== session.regionId) ||
      (session.districtId === null && session.regionId === null));
  if (outOfJurisdiction) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  // A District/Regional Admin can't move a facility to a different
  // district/region via edit — that would let them walk it out of their own
  // jurisdiction (or, for a District Admin, into a district that isn't
  // theirs at all). Only Platform can reassign a facility's district.
  const data = isPlatformAdmin(session)
    ? parsed.data
    : { name: parsed.data.name, type: parsed.data.type, phone: parsed.data.phone, isActive: parsed.data.isActive, openedAt: parsed.data.openedAt };

  const facility = await prisma.facility.update({
    where: { id: params.id },
    data: { ...data, openedAt: data.openedAt ? new Date(data.openedAt) : undefined },
  });

  await logAudit({
    actorLabel: isPlatformAdmin(session) ? "Super Admin" : session.regionId !== null ? "Regional Admin" : "District Admin",
    action: parsed.data.isActive === false ? "FACILITY_DEACTIVATED" : parsed.data.isActive === true ? "FACILITY_REACTIVATED" : "FACILITY_UPDATED",
    entityType: "Facility",
    entityId: facility.id,
    metadata: { changes: parsed.data },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: facility });
}
