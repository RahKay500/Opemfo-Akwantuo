import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSessionFromRequest } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { createFacilitySchema } from "@/lib/validations/admin";

export async function GET(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const facilities = await prisma.facility.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return NextResponse.json({
    success: true,
    data: facilities.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      region: f.region,
      district: f.district,
      phone: f.phone,
      isActive: f.isActive,
      staffCount: f._count.users,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createFacilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.flatten() }, { status: 400 });
  }

  const facility = await prisma.facility.create({ data: parsed.data });

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
