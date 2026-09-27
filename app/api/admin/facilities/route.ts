import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest, isPlatformAdmin } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { createFacilitySchema } from "@/lib/validations/admin";

// Platform sees every facility; a Regional/District Admin sees only the
// facilities in their own jurisdiction (view access — creating a new
// facility stays a Platform-only action, see POST below). A Facility Admin
// has no use for this cross-facility list at all.
export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.facilityId !== null) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const facilities = await prisma.facility.findMany({
    where: {
      ...(session.districtId !== null ? { districtId: session.districtId } : {}),
      ...(session.regionId !== null ? { district: { regionId: session.regionId } } : {}),
    },
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } }, district: { select: { name: true, region: { select: { name: true } } } } },
  });

  return NextResponse.json({
    success: true,
    data: facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      districtId: f.districtId,
      district: f.district.name,
      region: f.district.region.name,
      phone: f.phone,
      isActive: f.isActive,
      staffCount: f._count.users,
      openedAt: f.openedAt,
    })),
  });
}

// Creating a brand-new facility stays Platform-only, unlike GET/PUT above
// and below — a District/Regional Admin can view and edit facilities in
// their jurisdiction, but the base unit itself is still provisioned
// platform-wide.
export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || !isPlatformAdmin(session)) {
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createFacilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const facility = await prisma.facility.create({
    data: { ...parsed.data, openedAt: parsed.data.openedAt ? new Date(parsed.data.openedAt) : undefined },
  });

  await logAudit({
    actorLabel: "Super Admin",
    action: "FACILITY_CREATED",
    entityType: "Facility",
    entityId: facility.id,
    metadata: { name: facility.name },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ success: true, data: facility });
}
